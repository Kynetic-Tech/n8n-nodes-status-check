import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeOperationError,
	NodeConnectionTypes,
} from 'n8n-workflow';

export class StatusCheckCreditsLowTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Status Check Credits Low Trigger',
		name: 'statusCheckCreditsLowTrigger',
		icon: 'file:statuscheck.svg',
		group: ['trigger'],
		version: 1,
		usableAsTool: true,		subtitle: 'Triggers when credit balance is low',
		description: 'Starts the workflow when your Status Check credits fall below threshold (credits.low event)',
		defaults: {
			name: 'Credits Low Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
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
				default: 'n8n Credits Low Alert',
				required: true,
				description: 'Friendly name for this webhook in Status Check dashboard',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: 'Alert when credits are running low',
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
				} catch (error: any) {
					// 404 is expected if webhook does not exist
					if (error.statusCode === 404 || error.response?.statusCode === 404) {
						return false;
					}
					throw new NodeOperationError(
						this.getNode(),
						`Failed to check webhook existence: ${error.message}`
					);
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
								events: ['credits.low'],
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
				} catch (error: any) {
					throw new NodeOperationError(
						this.getNode(),
						`Failed to delete webhook: ${error.message}`
					);
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
		}

		// Extract event data from webhook payload
		const eventData = bodyData.data || bodyData;
		const eventType = bodyData.event || 'credits.low';

		// Ensure eventData is an object for spreading
		const safeEventData: any = typeof eventData === 'object' && eventData !== null ? eventData : {};

		return {
			workflowData: [
				[
					{
						json: {
							event: eventType,
							timestamp: bodyData.timestamp || new Date().toISOString(),
							creditsRemaining: safeEventData.creditsRemaining || safeEventData.credits_remaining,
							threshold: safeEventData.threshold,
							userId: safeEventData.userId || safeEventData.user_id,
							...safeEventData,
						},
					},
				],
			],
		};
	}
}
