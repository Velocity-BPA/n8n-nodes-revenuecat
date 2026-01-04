/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
} from 'n8n-workflow';

import {
	revenueCatApiRequestV1,
	encodeAppUserId,
} from '../../transport/revenueCatApi';

export const purchaseFields: INodeProperties[] = [
	// App User ID
	{
		displayName: 'App User ID',
		name: 'appUserId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['postReceipt', 'grantEntitlement', 'revokeEntitlement', 'refundPurchase', 'deferBilling'],
			},
		},
		description: 'The unique identifier for the subscriber',
	},

	// Store
	{
		displayName: 'Store',
		name: 'store',
		type: 'options',
		required: true,
		default: 'app_store',
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['postReceipt'],
			},
		},
		options: [
			{ name: 'App Store', value: 'app_store' },
			{ name: 'Play Store', value: 'play_store' },
			{ name: 'Amazon', value: 'amazon' },
			{ name: 'Stripe', value: 'stripe' },
		],
		description: 'The store the receipt is from',
	},

	// Receipt
	{
		displayName: 'Receipt',
		name: 'receipt',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['postReceipt'],
			},
		},
		description: 'The base64-encoded receipt data',
	},

	// Entitlement Identifier
	{
		displayName: 'Entitlement Identifier',
		name: 'entitlementIdentifier',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['grantEntitlement', 'revokeEntitlement'],
			},
		},
		description: 'The identifier for the entitlement to grant or revoke',
	},

	// Duration for grant
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'options',
		required: true,
		default: 'monthly',
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['grantEntitlement'],
			},
		},
		options: [
			{ name: 'Daily', value: 'daily' },
			{ name: 'Three Day', value: 'three_day' },
			{ name: 'Weekly', value: 'weekly' },
			{ name: 'Two Week', value: 'two_week' },
			{ name: 'Monthly', value: 'monthly' },
			{ name: 'Two Month', value: 'two_month' },
			{ name: 'Three Month', value: 'three_month' },
			{ name: 'Six Month', value: 'six_month' },
			{ name: 'Yearly', value: 'yearly' },
			{ name: 'Lifetime', value: 'lifetime' },
		],
		description: 'The duration for the promotional entitlement',
	},

	// Product Identifier for refund/revoke
	{
		displayName: 'Product Identifier',
		name: 'productIdentifier',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['refundPurchase'],
			},
		},
		description: 'The product identifier of the purchase to refund',
	},

	// Expiry Time for defer
	{
		displayName: 'Expiry Time (MS)',
		name: 'expiryTimeMs',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['deferBilling'],
			},
		},
		description: 'The new expiry time in milliseconds since epoch',
	},

	// Options for post receipt
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['postReceipt'],
			},
		},
		options: [
			{
				displayName: 'App User ID',
				name: 'appUserId',
				type: 'string',
				default: '',
				description: 'The app user ID (if different from header)',
			},
			{
				displayName: 'Fetch Token',
				name: 'fetchToken',
				type: 'string',
				default: '',
				description: 'The fetch token for the receipt (required for Play Store)',
			},
			{
				displayName: 'Is Restore',
				name: 'isRestore',
				type: 'boolean',
				default: false,
				description: 'Whether this is a restore purchase',
			},
			{
				displayName: 'Presented Offering ID',
				name: 'presentedOfferingId',
				type: 'string',
				default: '',
				description: 'The offering ID that was displayed to the user',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				default: 0,
				description: 'The price of the purchase',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: '',
				description: 'The currency code (e.g., USD)',
			},
			{
				displayName: 'Product ID',
				name: 'productId',
				type: 'string',
				default: '',
				description: 'The product identifier for the purchase',
			},
		],
	},

	// Options for grant entitlement
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['purchase'],
				operation: ['grantEntitlement'],
			},
		},
		options: [
			{
				displayName: 'Start Time (MS)',
				name: 'startTimeMs',
				type: 'number',
				default: 0,
				description: 'The start time in milliseconds since epoch (defaults to now)',
			},
		],
	},
];

export async function executePurchaseOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject;

	switch (operation) {
		case 'postReceipt': {
			const appUserId = this.getNodeParameter('appUserId', i) as string;
			const store = this.getNodeParameter('store', i) as string;
			const receipt = this.getNodeParameter('receipt', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				fetch_token: receipt,
				app_user_id: appUserId,
			};

			if (store === 'play_store' && options.fetchToken) {
				body.fetch_token = options.fetchToken;
			}

			if (options.isRestore !== undefined) {
				body.is_restore = options.isRestore;
			}

			if (options.presentedOfferingId) {
				body.presented_offering_id = options.presentedOfferingId;
			}

			if (options.price) {
				body.price = options.price;
			}

			if (options.currency) {
				body.currency = options.currency;
			}

			if (options.productId) {
				body.product_id = options.productId;
			}

			const headers: IDataObject = {
				'X-Platform': store === 'app_store' ? 'ios' : 'android',
			};

			responseData = await revenueCatApiRequestV1.call(
				this,
				'POST',
				'/receipts',
				body,
				{},
				headers,
			);
			break;
		}

		case 'grantEntitlement': {
			const appUserId = this.getNodeParameter('appUserId', i) as string;
			const entitlementIdentifier = this.getNodeParameter('entitlementIdentifier', i) as string;
			const duration = this.getNodeParameter('duration', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				duration,
			};

			if (options.startTimeMs) {
				body.start_time_ms = options.startTimeMs;
			}

			responseData = await revenueCatApiRequestV1.call(
				this,
				'POST',
				`/subscribers/${encodeAppUserId(appUserId)}/entitlements/${entitlementIdentifier}/promotional`,
				body,
			);
			break;
		}

		case 'revokeEntitlement': {
			const appUserId = this.getNodeParameter('appUserId', i) as string;
			const entitlementIdentifier = this.getNodeParameter('entitlementIdentifier', i) as string;

			responseData = await revenueCatApiRequestV1.call(
				this,
				'POST',
				`/subscribers/${encodeAppUserId(appUserId)}/entitlements/${entitlementIdentifier}/revoke_promotionals`,
			);
			break;
		}

		case 'refundPurchase': {
			const appUserId = this.getNodeParameter('appUserId', i) as string;
			const productIdentifier = this.getNodeParameter('productIdentifier', i) as string;

			responseData = await revenueCatApiRequestV1.call(
				this,
				'POST',
				`/subscribers/${encodeAppUserId(appUserId)}/subscriptions/${productIdentifier}/refund`,
			);
			break;
		}

		case 'deferBilling': {
			const appUserId = this.getNodeParameter('appUserId', i) as string;
			const expiryTimeMs = this.getNodeParameter('expiryTimeMs', i) as number;

			responseData = await revenueCatApiRequestV1.call(
				this,
				'POST',
				`/subscribers/${encodeAppUserId(appUserId)}/subscriptions/defer`,
				{
					expiry_time_ms: expiryTimeMs,
				},
			);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
