import { INodeProperties } from 'n8n-workflow';

export const leadOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['lead'],
			},
		},
		options: [
			{
				name: 'Bulk Create',
				value: 'bulkCreate',
				description: 'Create multiple leads at once',
				action: 'Bulk create leads',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new lead with optional validation',
				action: 'Create a lead',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a lead by ID',
				action: 'Get a lead',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List leads with optional filters',
				action: 'List leads',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update lead information',
				action: 'Update a lead',
			},
			{
				name: 'Validate',
				value: 'validate',
				description: 'Validate existing leads (domain and/or email)',
				action: 'Validate leads',
			},
		],
		default: 'create',
	},
];

export const leadFields: INodeProperties[] = [
	// =====================================
	// Create Lead Fields
	// =====================================
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'john@example.com',
		description: 'Lead email address',
	},
	{
		displayName: 'Website',
		name: 'website',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'https://example.com',
		description: 'Lead website/domain',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Company name',
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'json',
				default: '{}',
				description: 'Custom fields as JSON object',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'Lead first name',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
				description: 'Job title',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'Lead last name',
			},
			{
				displayName: 'LinkedIn URL',
				name: 'linkedinUrl',
				type: 'string',
				default: '',
				description: 'LinkedIn profile URL',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number',
			},
			{
				displayName: 'Validate',
				name: 'validate',
				type: 'boolean',
				default: true,
				description: 'Whether to trigger automatic validation after creating the lead (validates email always, website if provided)',
			},
		],

	},

	// =====================================
	// Get Lead Fields
	// =====================================
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['get', 'update'],
			},
		},
		default: '',
		placeholder: 'lead_abc123',
		description: 'The ID of the lead to retrieve or update',
	},

	// =====================================
	// Update Lead Fields
	// =====================================
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Company name',
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'json',
				default: '{}',
				description: 'Custom fields as JSON object',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'New email address',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'Lead first name',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
				description: 'Job title',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'Lead last name',
			},
			{
				displayName: 'Revalidate',
				name: 'revalidate',
				type: 'boolean',
				default: true,
				description: 'Whether to automatically re-validate the lead if email or website changes',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'New website URL',
			},
		],

	},

	// =====================================
	// List Leads Fields
	// =====================================
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['list'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['list'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Email Valid',
				name: 'emailValid',
				type: 'boolean',
				default: true,
				description: 'Whether to filter by email validity',
			},
			{
				displayName: 'Minimum Deliverability Rating',
				name: 'minDeliverabilityRating',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				description: 'Minimum lead deliverability score (0-100)',
			},
			{
				displayName: 'Validation Status',
				name: 'validationStatus',
				type: 'options',
				options: [
					{ name: 'Invalid', value: 'invalid' },
					{ name: 'Pending', value: 'pending' },
					{ name: 'Risky', value: 'risky' },
					{ name: 'Verified', value: 'verified' },
					{ name: 'Warning', value: 'warning' },
				],
				default: 'verified',
				description: 'Filter by validation status',
			},
		],
	},

	// =====================================
	// Bulk Create Fields
	// =====================================
	{
		displayName: 'Leads',
		name: 'leads',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['bulkCreate'],
			},
		},
		default: '[]',
		description: 'Array of lead objects to create. Example: [{"email": "user@example.com", "website": "example.com"}].',
		placeholder: '[{"email": "user1@example.com"}, {"email": "user2@example.com"}]',
	},
	{
		displayName: 'Bulk Validation Options',
		name: 'bulkValidationOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['bulkCreate'],
			},
		},
		options: [
			{
				displayName: 'Validate Domain',
				name: 'validateDomain',
				type: 'boolean',
				default: true,
				description: 'Whether to validate domains for all leads',
			},
			{
				displayName: 'Validate Email',
				name: 'validateEmail',
				type: 'boolean',
				default: true,
				description: 'Whether to validate emails for all leads',
			},
		],
	},

	// =====================================
	// Validate Leads Fields
	// =====================================
	{
		displayName: 'Lead IDs',
		name: 'leadIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['validate'],
			},
		},
		default: '',
		placeholder: 'lead_abc123,lead_def456 or ["lead_abc123", "lead_def456"]',
		description: 'Comma-separated lead IDs or JSON array of lead IDs to validate',
	},
	{
		displayName: 'Validate Domain',
		name: 'validateDomain',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['validate'],
			},
		},
		default: true,
		description: 'Whether to validate the domain/website',
	},
	{
		displayName: 'Validate Email',
		name: 'validateEmail',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['validate'],
			},
		},
		default: true,
		description: 'Whether to validate the email address',
	},
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['validate'],
			},
		},
		default: '',
		placeholder: 'https://yourapp.com/webhook',
		description: 'Optional webhook URL to receive validation results. If not provided, use the batch ID to poll for results.',
	},
];
