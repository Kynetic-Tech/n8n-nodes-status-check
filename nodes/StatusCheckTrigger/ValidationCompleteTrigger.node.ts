import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeOperationError,
} from 'n8n-workflow';

export class ValidationCompleteTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Status Check Validation Complete Trigger',
		name: 'statusCheckValidationCompleteTrigger',
		icon: 'file:statuscheck.svg',
		group: ['trigger'],
		version: 1,
		subtitle: 'Triggers when email or domain validation completes',
		description: 'Starts the workflow when a validation job finishes (validation.complete event)',
		defaults: {
			name: 'Validation Complete Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'statusCheckApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Webhook Name',
				name: 'webhookName',
				type: 'string',
				default: 'n8n Validation Complete Webhook',
				required: true,
				description: 'Friendly name for this webhook in Status Check dashboard',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: 'Automatically created by n8n workflow',
				description: 'Optional description to identify this webhook',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId === undefined) {
					return false;
				}

				try {
					// Check if webhook still exists
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'statusCheckApi',
						{
							method: 'GET',
							url: '/v1/webhooks',
						},
					);

					const webhooks = response.webhooks || [];
					const exists = webhooks.some((wh: any) => wh.id === webhookData.webhookId);

					if (!exists) {
						delete webhookData.webhookId;
					}

					return exists;
				} catch (error) {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');
				const webhookName = this.getNodeParameter('webhookName') as string;
				const description = this.getNodeParameter('description', '') as string;

				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'statusCheckApi',
						{
							method: 'POST',
							url: '/v1/webhooks',
							body: {
								name: webhookName,
								url: webhookUrl,
								events: ['validation.complete'],
								description: description || undefined,
								active: true,
							},
						},
					);

					webhookData.webhookId = response.id;
					webhookData.webhookUrl = webhookUrl;

					return true;
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					throw new NodeOperationError(
						this.getNode(),
						`Failed to create webhook: ${errorMessage}`,
					);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId === undefined) {
					return true;
				}

				try {
					await this.helpers.httpRequestWithAuthentication.call(
						this,
						'statusCheckApi',
						{
							method: 'DELETE',
							url: `/v1/webhooks/${webhookData.webhookId}`,
						},
					);

					delete webhookData.webhookId;
					delete webhookData.webhookUrl;

					return true;
				} catch (error) {
					return false;
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const headerData = this.getHeaderData();

		// Verify webhook signature if present
		const signature = headerData['x-webhook-signature'] as string;
		if (signature) {
			// Signature verification would go here
			// For now, we'll accept all webhooks from the registered URL
		}

		// Extract event data from webhook payload
		const eventData = bodyData.data || bodyData;
		const eventType = bodyData.event || 'validation.complete';

		// Ensure eventData is an object for spreading
		const safeEventData: any = typeof eventData === 'object' && eventData !== null ? eventData : {};

		// Return webhook data to workflow
		return {
			workflowData: [
				[
					{
						json: {
							event: eventType,
							timestamp: bodyData.timestamp || new Date().toISOString(),
							...safeEventData,
						},
					},
				],
			],
		};
	}
}
