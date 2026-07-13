import { INodeProperties } from 'n8n-workflow';

export const validationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['validation'],
			},
		},
		options: [
			{
				name: 'Check Website',
				value: 'checkWebsite',
				description: 'Check if a website is online and working',
				action: 'Check domain',
			},
			{
				name: 'Check Email',
				value: 'checkEmail',
				description: 'Check if an email address is valid and working',
				action: 'Check email',
			},
			{
				name: 'Get Validation Job',
				value: 'getJob',
				description: 'Check the status of a validation that\'s still running',
				action: 'Validation status',
			},
		],
		default: 'checkWebsite',
	},
];

export const validationFields: INodeProperties[] = [
	// =====================================
	// Check Website Fields
	// =====================================
	{
		displayName: 'Website',
		name: 'website',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['validation'],
				operation: ['checkWebsite'],
			},
		},
		default: '',
		placeholder: 'example.com or https://example.com',
		description: 'Website URL to validate. Protocol is optional (defaults to HTTPS).',
	},
	{
		displayName: 'Return Details',
		name: 'returnDetails',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['validation'],
				operation: ['checkWebsite'],
			},
		},
		default: true,
		description: 'Whether to return detailed validation results (HTTP status, SSL, redirect chain, etc.) or just the status',
	},

	// =====================================
	// Check Email Fields
	// =====================================
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['validation'],
				operation: ['checkEmail'],
			},
		},
		default: '',
		placeholder: 'user@example.com',
		description: 'Email address to validate',
	},
	{
		displayName: 'Timeout',
		name: 'timeout',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['validation'],
				operation: ['checkEmail'],
			},
		},
		default: 30,
		typeOptions: {
			minValue: 5,
			maxValue: 60,
		},
		description: 'Maximum seconds to wait for validation to complete (5-60). If validation takes longer, a job ID is returned for polling.',
	},
	{
		displayName: 'Return Details',
		name: 'returnDetails',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['validation'],
				operation: ['checkEmail'],
			},
		},
		default: true,
		description: 'Whether to return detailed validation results (service provider, catch-all status, risk score, etc.) or just valid/invalid',
	},
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['validation'],
				operation: ['checkEmail'],
			},
		},
		default: '',
		placeholder: 'https://yourapp.com/webhook',
		description: 'Optional webhook URL to receive results if validation times out. Useful for async processing.',
	},

	// =====================================
	// Get Validation Job Fields
	// =====================================
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['validation'],
				operation: ['getJob'],
			},
		},
		default: '',
		placeholder: 'val_abc123def456',
		description: 'Validation job ID returned from check-email when timeout occurs',
	},
];
