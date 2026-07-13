import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {
	validationOperations,
	validationFields,
} from './descriptions/ValidationDescription';

import {
	leadOperations,
	leadFields,
} from './descriptions/LeadDescription';

import {
	webhookOperations,
	webhookFields,
} from './descriptions/WebhookDescription';

export class StatusCheck implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Status Check',
		name: 'statusCheck',
		icon: 'file:statuscheck.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] ? ($parameter["operation"] + ": " + $parameter["resource"]) : "Domain & email validation"}}',
		description: 'Validate domains and emails, manage leads with Status Check',
		defaults: {
			name: 'Status Check',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'statusCheckApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.environment === "production" ? "https://api.status-check.io" : "http://localhost:8000"}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Validation',
						value: 'validation',
						description: 'Validate websites and emails without creating leads',
					},
					{
						name: 'Lead',
						value: 'lead',
						description: 'Manage leads with validation',
					},
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Manage webhook subscriptions',
					},
				],
				default: 'validation',
			},

			// Operations
			...validationOperations,
			...leadOperations,
			...webhookOperations,

			// Fields
			...validationFields,
			...leadFields,
			...webhookFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		let items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		// Get credentials to determine API base URL
		const credentials = await this.getCredentials('statusCheckApi');
		const baseURL = credentials.environment === 'production'
			? 'https://api.status-check.io'
			: (credentials.apiUrl as string || 'http://localhost:8080');

		// If no input items, create a single empty item to allow execution
		if (items.length === 0) {
			items = [{ json: {} }];
		}

		for (let i = 0; i < items.length; i++) {
			try {
				// =====================================
				// Validation Resource
				// =====================================
				if (resource === 'validation') {
					if (operation === 'checkWebsite') {
						const website = this.getNodeParameter('website', i) as string;
						const returnDetails = this.getNodeParameter('returnDetails', i, true) as boolean;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'POST',
								url: `${baseURL}/v1/check-website`,
								body: {
									website,
									returnDetails,
								},
							},
						);

						returnData.push({ json: response });
					}

					if (operation === 'checkEmail') {
						const email = this.getNodeParameter('email', i) as string;
						const timeout = this.getNodeParameter('timeout', i, 30) as number;
						const returnDetails = this.getNodeParameter('returnDetails', i, true) as boolean;
						const webhookUrl = this.getNodeParameter('webhookUrl', i, '') as string;

						const body: any = {
							email,
							timeout,
							returnDetails,
						};

						if (webhookUrl) {
							body.webhookUrl = webhookUrl;
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'POST',
								url: `${baseURL}/v1/check-email`,
								body,
							},
						);

						returnData.push({ json: response });
					}

					if (operation === 'getJob') {
						const jobId = this.getNodeParameter('jobId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'GET',
								url: `${baseURL}/v1/validation-jobs/${jobId}`,
							},
						);

						returnData.push({ json: response });
					}
				}

				// =====================================
				// Lead Resource
				// =====================================
				if (resource === 'lead') {
					if (operation === 'create') {
						const email = this.getNodeParameter('email', i) as string;
						const website = this.getNodeParameter('website', i, '') as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const body: any = {
							email,
							...(website && { website }),
							...additionalFields,
						};

						// Parse customFields if it's a JSON string
						if (body.customFields && typeof body.customFields === 'string') {
							try {
								body.customFields = JSON.parse(body.customFields);
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									'customFields must be valid JSON',
								);
							}
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'POST',
								url: `${baseURL}/v1/leads`,
								body,
							},
						);

						returnData.push({ json: response });
					}

					if (operation === 'get') {
						const leadId = this.getNodeParameter('leadId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'GET',
								url: `${baseURL}/v1/leads/${leadId}`,
							},
						);

						returnData.push({ json: response });
					}

					if (operation === 'update') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as any;

						// Parse customFields if it's a JSON string
						if (updateFields.customFields && typeof updateFields.customFields === 'string') {
							try {
								updateFields.customFields = JSON.parse(updateFields.customFields);
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									'customFields must be valid JSON',
								);
							}
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'PUT',
								url: `${baseURL}/v1/leads/${leadId}`,
								body: updateFields,
							},
						);

						returnData.push({ json: response });
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as any;

						const qs: any = {};

						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i, 50) as number;
							qs.limit = limit;
						}

						// Add filters to query string
						if (filters.emailValid !== undefined) {
							qs.emailValid = filters.emailValid;
						}
						if (filters.minDeliverabilityRating !== undefined) {
							qs.minDeliverabilityRating = filters.minDeliverabilityRating;
						}
						if (filters.validationStatus) {
							qs.validationStatus = filters.validationStatus;
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'GET',
								url: `${baseURL}/v1/leads`,
								qs,
							},
						);

						const leads = response.leads || [];

						if (returnAll) {
							leads.forEach((lead: any) => returnData.push({ json: lead }));
						} else {
							leads.forEach((lead: any) => returnData.push({ json: lead }));
						}
					}

					if (operation === 'bulkCreate') {
						const leadsJson = this.getNodeParameter('leads', i) as string;
						const bulkValidationOptions = this.getNodeParameter('bulkValidationOptions', i, {}) as any;

						let leads;
						try {
							leads = JSON.parse(leadsJson);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								'Leads must be valid JSON array',
							);
						}

						if (!Array.isArray(leads)) {
							throw new NodeOperationError(
								this.getNode(),
								'Leads must be an array',
							);
						}

						const body: any = {
							leads,
							...bulkValidationOptions,
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'POST',
								url: `${baseURL}/v1/leads/bulk`,
								body,
							},
						);

						returnData.push({ json: response });
					}

				if (operation === 'validate') {
					const leadIdsInput = this.getNodeParameter('leadIds', i) as string;
					const validateDomain = this.getNodeParameter('validateDomain', i, true) as boolean;
					const validateEmail = this.getNodeParameter('validateEmail', i, true) as boolean;
					const webhookUrl = this.getNodeParameter('webhookUrl', i, '') as string;

					// Parse leadIds - support both comma-separated and JSON array
					let leadIds: string[];
					try {
						// Try parsing as JSON array first
						leadIds = JSON.parse(leadIdsInput);
						if (!Array.isArray(leadIds)) {
							throw new Error('Not an array');
						}
					} catch (error) {
						// Fall back to comma-separated string
						leadIds = leadIdsInput.split(',').map(id => id.trim()).filter(id => id.length > 0);
					}

					if (leadIds.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one lead ID is required',
						);
					}

					const body: any = {
						leadIds,
						validateDomain,
						validateEmail,
					};

					if (webhookUrl) {
						body.webhookUrl = webhookUrl;
					}

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'statusCheckApi',
						{
							method: 'POST',
							url: `${baseURL}/v1/leads/validate`,
							body,
						},
					);

					returnData.push({ json: response });
				}
				}

				// =====================================
				// Webhook Resource
				// =====================================
				if (resource === 'webhook') {
					if (operation === 'create') {
						const webhookName = this.getNodeParameter('webhookName', i) as string;
						const url = this.getNodeParameter('url', i) as string;
						const events = this.getNodeParameter('events', i) as string[];
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as any;

						const body: any = {
							name: webhookName,
							url,
							events,
							...additionalFields,
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'POST',
								url: `${baseURL}/v1/webhooks`,
								body,
							},
						);

						returnData.push({ json: response });
					}

					if (operation === 'list') {
						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'GET',
								url: `${baseURL}/v1/webhooks`,
							},
						);

						const webhooks = response.webhooks || [];
						webhooks.forEach((webhook: any) => returnData.push({ json: webhook }));
					}

					if (operation === 'delete') {
						const webhookId = this.getNodeParameter('webhookId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'DELETE',
								url: `${baseURL}/v1/webhooks/${webhookId}`,
							},
						);

						returnData.push({ json: response });
					}

					if (operation === 'test') {
						const webhookId = this.getNodeParameter('webhookId', i) as string;
						const testEvent = this.getNodeParameter('testEvent', i, 'validation.complete') as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'statusCheckApi',
							{
								method: 'POST',
								url: `${baseURL}/v1/webhooks/${webhookId}/test`,
								body: {
									event: testEvent,
								},
							},
						);

						returnData.push({ json: response });
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					returnData.push({ json: { error: errorMessage }, pairedItem: i });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
