export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { analyzePipelineStream, type AnalysisProgress } from '@/lib/agent/analyzer'

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (chunk: AnalysisProgress) => {
        controller.enqueue(encoder.encode('data: ' + JSON.stringify(chunk) + '\n\n'))
      }

      try {
        for await (const chunk of analyzePipelineStream()) {
          send(chunk)
          if (chunk.stage === 'complete' || chunk.stage === 'error') {
            controller.close()
            return
          }
        }
      } catch {
        send({ stage: 'error', message: 'Stream failed', progress: 0 })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
