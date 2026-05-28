import { z } from 'zod'
import { AgentError } from '@/lib/errors'
import { logger } from '@/lib/logger'

// ------------------------------------------------------------------
// Zod schemas for Slack webhook payload validation
// ------------------------------------------------------------------

export const SlackWebhookResponseSchema = z.object({
  ok: z.boolean(),
})

export const SlackBlockSchema = z.object({
  type: z.string(),
  text: z
    .object({
      type: z.string(),
      text: z.string(),
    })
    .optional(),
  fields: z
    .array(
      z.object({
        type: z.string(),
        text: z.string(),
      })
    )
    .optional(),
})

export const SlackMessagePayloadSchema = z.object({
  text: z.string().optional(),
  blocks: z.array(SlackBlockSchema).optional(),
  attachments: z.array(z.record(z.string(), z.unknown())).optional(),
})

// ------------------------------------------------------------------
// Type exports
// ------------------------------------------------------------------

export type SlackBlock = z.infer<typeof SlackBlockSchema>
export type SlackMessagePayload = z.infer<typeof SlackMessagePayloadSchema>

// ------------------------------------------------------------------
// Error hierarchy
// ------------------------------------------------------------------

export class SlackError extends AgentError {
  constructor(message: string, public readonly statusCode?: number, cause?: unknown) {
    super(message, 'slack', cause)
    this.name = 'SlackError'
  }
}

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

export interface SlackConfig {
  webhookUrl: string
  defaultChannel?: string
  username?: string
  iconEmoji?: string
}

// ------------------------------------------------------------------
// Slack webhook client
// ------------------------------------------------------------------

export class SlackClient {
  constructor(private config: SlackConfig) {}

  private async send(payload: SlackMessagePayload): Promise<void> {
    const parsed = SlackMessagePayloadSchema.safeParse(payload)
    if (!parsed.success) {
      throw new SlackError('Invalid Slack message payload', undefined, parsed.error)
    }

    const res = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...parsed.data,
        username: this.config.username,
        icon_emoji: this.config.iconEmoji,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new SlackError(`Slack webhook error: ${res.status} ${text}`, res.status)
    }

    // Incoming webhooks can return "ok" as plain text
    const text = await res.text()
    if (text !== 'ok') {
      logger.warn('slack', `Unexpected webhook response: ${text}`)
    }
  }

  // ------------------------------------------------------------------
  // Public API methods
  // ------------------------------------------------------------------

  async sendDealAlert(params: {
    dealName: string
    dealValue: number
    stage: string
    repName: string
    urgency?: 'low' | 'medium' | 'high'
    actionUrl?: string
  }): Promise<void> {
    const urgencyEmoji =
      params.urgency === 'high' ? ':rotating_light:' : params.urgency === 'medium' ? ':warning:' : ':information_source:'

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${urgencyEmoji} Deal Alert: ${params.dealName}` },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Value:*\n$${params.dealValue.toLocaleString()}` },
          { type: 'mrkdwn', text: `*Stage:*\n${params.stage}` },
          { type: 'mrkdwn', text: `*Rep:*\n${params.repName}` },
          { type: 'mrkdwn', text: `*Urgency:*\n${params.urgency ?? 'medium'}` },
        ],
      },
    ]

    if (params.actionUrl) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `<${params.actionUrl}|View in dashboard>` },
      })
    }

    await this.send({ blocks })
    logger.info('slack', `Deal alert sent for ${params.dealName}`)
  }

  async sendPipelineUpdate(params: {
    period: string
    newDeals: number
    movedDeals: number
    closedWonValue: number
    closedLostCount: number
    topStage: string
  }): Promise<void> {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `:chart_with_upwards_trend: Pipeline Update — ${params.period}` },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*New Deals:*\n${params.newDeals}` },
          { type: 'mrkdwn', text: `*Stage Moves:*\n${params.movedDeals}` },
          { type: 'mrkdwn', text: `*Closed-Won Value:*\n$${params.closedWonValue.toLocaleString()}` },
          { type: 'mrkdwn', text: `*Closed-Lost:*\n${params.closedLostCount}` },
        ],
      },
      {
        type: 'context',
        text: { type: 'mrkdwn', text: `Top active stage: *${params.topStage}*` },
      },
    ]

    await this.send({ blocks })
    logger.info('slack', `Pipeline update sent for ${params.period}`)
  }
}
