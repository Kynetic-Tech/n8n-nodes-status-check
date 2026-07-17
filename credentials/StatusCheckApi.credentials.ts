import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class StatusCheckApi implements ICredentialType {
	name = 'statusCheckApi';
	displayName = 'Status Check API';
	documentationUrl = 'https://docs.status-check.io/integrations/n8n';
	icon = 'file:statuscheck.svg' as const;
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Local Development',
					value: 'local',
				},
			],
			default: 'production',
			description: 'Select the API environment to use',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Status Check API key. Get it from <a href="https://app.status-check.io/profile" target="_blank">Account Settings</a>.',
			placeholder: 'sk_live_... or sk_test_...',
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			displayOptions: {
				show: {
					environment: ['local'],
				},
			},
			default: 'http://localhost:8080',
			required: true,
			description: 'Custom API URL for local development',
			placeholder: 'http://localhost:8080',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "production" ? "https://api.status-check.io" : $credentials.apiUrl}}',
			url: '/v1/webhooks',
			method: 'GET',
		},
	};
}
