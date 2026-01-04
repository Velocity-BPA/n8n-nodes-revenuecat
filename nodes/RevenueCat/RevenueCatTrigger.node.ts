/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';

import * as crypto from 'crypto';

// Emit licensing notice once
let licenseNoticeEmitted = false;
function emitLicenseNotice(): void {
	if (!licenseNoticeEmitted) {
		console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
		licenseNoticeEmitted = true;
	}
}

export class RevenueCatTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RevenueCat Trigger',
		name: 'revenueCatTrigger',
		icon: 'file:revenuecat.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when RevenueCat webhook events occur',
		defaults: {
			name: 'RevenueCat Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'revenueCatApi',
				required: false,
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
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				description: 'The events to listen for',
				options: [
					{
						name: 'Billing Issue',
						value: 'BILLING_ISSUE',
						description: 'A billing problem was detected',
					},
					{
						name: 'Cancellation',
						value: 'CANCELLATION',
						description: 'A subscription was canceled',
					},
					{
						name: 'Expiration',
						value: 'EXPIRATION',
						description: 'A subscription expired',
					},
					{
						name: 'Initial Purchase',
						value: 'INITIAL_PURCHASE',
						description: 'A new subscription or one-time purchase was made',
					},
					{
						name: 'Non-Renewing Purchase',
						value: 'NON_RENEWING_PURCHASE',
						description: 'A one-time purchase was made',
					},
					{
						name: 'Product Change',
						value: 'PRODUCT_CHANGE',
						description: 'A subscriber changed their product/plan',
					},
					{
						name: 'Refund',
						value: 'REFUND',
						description: 'A purchase was refunded',
					},
					{
						name: 'Renewal',
						value: 'RENEWAL',
						description: 'A subscription was renewed',
					},
					{
						name: 'Subscription Extended',
						value: 'SUBSCRIPTION_EXTENDED',
						description: 'A subscription was extended',
					},
					{
						name: 'Subscription Paused',
						value: 'SUBSCRIPTION_PAUSED',
						description: 'A subscription was paused',
					},
					{
						name: 'Temporary Entitlement Grant',
						value: 'TEMPORARY_ENTITLEMENT_GRANT',
						description: 'A promotional entitlement was granted',
					},
					{
						name: 'Test',
						value: 'TEST',
						description: 'A test webhook was sent',
					},
					{
						name: 'Transfer',
						value: 'TRANSFER',
						description: 'A subscription was transferred between users',
					},
					{
						name: 'Uncancellation',
						value: 'UNCANCELLATION',
						description: 'A cancellation was reversed',
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Verify Signature',
						name: 'verifySignature',
						type: 'boolean',
						default: false,
						description: 'Whether to verify the webhook signature using the authorization header',
					},
					{
						displayName: 'Expected Authorization',
						name: 'expectedAuthorization',
						type: 'string',
						typeOptions: {
							password: true,
						},
						default: '',
						displayOptions: {
							show: {
								verifySignature: [true],
							},
						},
						description: 'The expected value of the Authorization header',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// RevenueCat webhooks are configured in their dashboard
				// We always return true to indicate the webhook endpoint is active
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// RevenueCat webhooks must be configured in their dashboard
				// This is a no-op - user must manually configure the webhook URL
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// RevenueCat webhooks must be removed from their dashboard
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		emitLicenseNotice();

		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;

		const events = this.getNodeParameter('events') as string[];
		const options = this.getNodeParameter('options', {}) as IDataObject;

		// Verify signature if enabled
		if (options.verifySignature) {
			const authHeader = req.headers.authorization as string;
			const expectedAuth = options.expectedAuthorization as string;

			if (!authHeader || !expectedAuth) {
				return {
					webhookResponse: {
						status: 401,
						body: { error: 'Unauthorized' },
					},
				};
			}

			// Compare using timing-safe comparison
			const authBuffer = Buffer.from(authHeader);
			const expectedBuffer = Buffer.from(expectedAuth);

			if (authBuffer.length !== expectedBuffer.length ||
				!crypto.timingSafeEqual(authBuffer, expectedBuffer)) {
				return {
					webhookResponse: {
						status: 401,
						body: { error: 'Unauthorized' },
					},
				};
			}
		}

		// Extract event type from the body
		const eventData = body.event as IDataObject | undefined;
		const eventType = ((eventData?.type || body.type) || 'UNKNOWN') as string;

		// Check if this event type is one we're listening for
		if (events.length > 0 && !events.includes(eventType)) {
			// Event type not in our list, acknowledge but don't trigger
			return {
				webhookResponse: {
					status: 200,
					body: { received: true, processed: false },
				},
			};
		}

		// Extract relevant data
		const webhookData: IDataObject = {
			event: body.event || body,
			api_version: body.api_version,
		};

		// Add subscriber info if available
		if (body.event) {
			const event = body.event as IDataObject;
			webhookData.event_type = event.type;
			webhookData.app_user_id = event.app_user_id;
			webhookData.original_app_user_id = event.original_app_user_id;
			webhookData.product_id = event.product_id;
			webhookData.entitlement_ids = event.entitlement_ids;
			webhookData.period_type = event.period_type;
			webhookData.purchased_at_ms = event.purchased_at_ms;
			webhookData.expiration_at_ms = event.expiration_at_ms;
			webhookData.environment = event.environment;
			webhookData.store = event.store;
			webhookData.is_family_share = event.is_family_share;
			webhookData.country_code = event.country_code;
			webhookData.currency = event.currency;
			webhookData.price = event.price;
			webhookData.price_in_purchased_currency = event.price_in_purchased_currency;
			webhookData.subscriber_attributes = event.subscriber_attributes;
			webhookData.transaction_id = event.transaction_id;
			webhookData.original_transaction_id = event.original_transaction_id;
			webhookData.takehome_percentage = event.takehome_percentage;
			webhookData.offer_code = event.offer_code;
			webhookData.tax_percentage = event.tax_percentage;
			webhookData.commission_percentage = event.commission_percentage;
		}

		return {
			workflowData: [
				[
					{
						json: webhookData,
					},
				],
			],
			webhookResponse: {
				status: 200,
				body: { received: true },
			},
		};
	}
}
