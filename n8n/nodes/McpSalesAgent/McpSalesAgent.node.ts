import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class McpSalesAgent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MCP Sales Agent',
		name: 'mcpSalesAgent',
		icon: 'file:mcpsalesagent.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Orchestrate CRM, call recorders, and email through MCP',
		defaults: {
			name: 'MCP Sales Agent',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'mcpSalesAgentApi',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Analyze Call',
						value: 'analyzeCall',
						action: 'Analyze a sales call',
					},
					{
						name: 'Update Pipeline',
						value: 'updatePipeline',
						action: 'Update a deal stage',
					},
					{
						name: 'Draft Follow-up',
						value: 'draftFollowup',
						action: 'Draft a follow-up email',
					},
					{
						name: 'Get Benchmarks',
						value: 'getBenchmarks',
						action: 'Get industry benchmarks',
					},
					{
						name: 'Get Dashboard Snapshot',
						value: 'getSnapshot',
						action: 'Get full dashboard snapshot',
					},
				],
				default: 'getSnapshot',
			},
			{
				displayName: 'Call ID',
				name: 'callId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['analyzeCall', 'draftFollowup'],
					},
				},
			},
			{
				displayName: 'Deal ID',
				name: 'dealId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['updatePipeline'],
					},
				},
			},
			{
				displayName: 'Stage',
				name: 'stage',
				type: 'options',
				options: [
					{ name: 'Prospecting', value: 'Prospecting' },
					{ name: 'Qualification', value: 'Qualification' },
					{ name: 'Proposal', value: 'Proposal' },
					{ name: 'Closed-Won', value: 'Closed-Won' },
					{ name: 'Closed-Lost', value: 'Closed-Lost' },
				],
				default: 'Qualification',
				displayOptions: {
					show: {
						operation: ['updatePipeline'],
					},
				},
			},
			{
				displayName: 'Segment',
				name: 'segment',
				type: 'string',
				default: 'SaaS — Mid-Market',
				displayOptions: {
					show: {
						operation: ['getBenchmarks'],
					},
				},
			},
		] as INodeProperties[],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('mcpSalesAgentApi');
		const baseUrl = (credentials?.baseUrl as string) || 'http://localhost:3000';

		for (let i = 0; i < items.length; i++) {
			try {
				let endpoint = '';
				let method = 'GET';
				let body: Record<string, unknown> | undefined;

				if (operation === 'getSnapshot') {
					endpoint = '/api/analyze';
				} else if (operation === 'analyzeCall') {
					const callId = this.getNodeParameter('callId', i) as string;
					endpoint = `/api/analyze/call/${callId}`;
				} else if (operation === 'updatePipeline') {
					const dealId = this.getNodeParameter('dealId', i) as string;
					const stage = this.getNodeParameter('stage', i) as string;
					endpoint = '/api/pipeline/update';
					method = 'POST';
					body = { dealId, stage };
				} else if (operation === 'draftFollowup') {
					const callId = this.getNodeParameter('callId', i) as string;
					endpoint = '/api/followups/draft';
					method = 'POST';
					body = { callId };
				} else if (operation === 'getBenchmarks') {
					const segment = this.getNodeParameter('segment', i) as string;
					endpoint = `/api/benchmarks?segment=${encodeURIComponent(segment)}`;
				}

				const options: RequestInit = {
					method,
					headers: {
						'Content-Type': 'application/json',
					},
				};
				if (body) options.body = JSON.stringify(body);

				const response = await fetch(`${baseUrl}${endpoint}`, options);
				const data = await response.json();

				returnData.push({
					json: data,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
