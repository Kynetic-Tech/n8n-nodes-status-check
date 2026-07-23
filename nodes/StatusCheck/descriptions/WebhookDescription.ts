import { INodeProperties } from 'n8n-workflow';

export const webhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Register a new webhook endpoint',
				action: 'Create a webhook',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all registered webhooks',
				action: 'List webhooks',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a webhook',
				action: 'Delete a webhook',
			},
			{
				name: 'Test',
				value: 'test',
				description: 'Send a test event to a webhook',
				action: 'Test a webhook',
			},
		],
		default: 'list',
	},
];

export const webhookFields: INodeProperties[] = [
	// =====================================
	// Create Webhook Fields
	// =====================================
	{
		displayName: 'Name',
		name: 'webhookName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'Production Webhook',
		description: 'Friendly name for this webhook',
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'https://yourapp.com/webhooks/status-check',
		description: 'The endpoint URL where webhook events will be sent',
	},
	{
		displayName: 'Events',
		name: 'events',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Credits Depleted',
				value: 'credits.depleted',
			},
			{
				name: 'Credits Low',
				value: 'credits.low',
			},
			{
				name: 'Lead Created',
				value: 'lead.created',
			},
			{
				name: 'Lead Updated',
				value: 'lead.updated',
			},
			{
				name: 'Lead Validated',
				value: 'lead.validated',
			},
			{
				name: 'Validation Complete',
				value: 'validation.complete',
			},
			{
				name: 'Validation Failed',
				value: 'validation.failed',
			},
			{
				name: 'Validation Started',
				value: 'validation.started',
			},
		],
		default: ['validation.complete'],
		description: 'Events that will trigger this webhook',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Optional description of webhook purpose',
			},
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the webhook should be active immediately',
			},
		],
	},

	// =====================================
	// Delete/Test Webhook Fields
	// =====================================
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['delete', 'test'],
			},
		},
		default: '',
		placeholder: 'wh_abc123xyz',
		description: 'The ID of the webhook to delete or test',
	},
	{
		displayName: 'Test Event',
		name: 'testEvent',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['test'],
			},
		},
		options: [
			{
				name: 'Validation Complete',
				value: 'validation.complete',
			},
			{
				name: 'Credits Low',
				value: 'credits.low',
			},
		],
		default: 'validation.complete',
		description: 'Which event type to send in the test',
	},
];
