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
	revenueCatApiRequestV2,
	revenueCatApiRequestV2AllItems,
	getProjectId,
} from '../../transport/revenueCatApi';

export const productFields: INodeProperties[] = [
	// Project ID
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
			},
		},
		description: 'The project ID (leave empty to use the one from credentials)',
	},

	// Product ID
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getProduct', 'updateProduct', 'deleteProduct'],
			},
		},
		description: 'The unique identifier for the product',
	},

	// Store Identifier for create
	{
		displayName: 'Store Identifier',
		name: 'storeIdentifier',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['createProduct'],
			},
		},
		description: 'The product identifier from the app store (e.g., com.app.premium_monthly)',
	},

	// App ID for create
	{
		displayName: 'App ID',
		name: 'appId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['createProduct'],
			},
		},
		description: 'The ID of the app this product belongs to',
	},

	// Product Type
	{
		displayName: 'Product Type',
		name: 'productType',
		type: 'options',
		required: true,
		default: 'subscription',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['createProduct'],
			},
		},
		options: [
			{
				name: 'Subscription',
				value: 'subscription',
				description: 'A recurring subscription product',
			},
			{
				name: 'Consumable',
				value: 'consumable',
				description: 'A consumable in-app purchase',
			},
			{
				name: 'Non-Consumable',
				value: 'non_consumable',
				description: 'A non-consumable in-app purchase',
			},
		],
		description: 'The type of product',
	},

	// Display Name
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['createProduct', 'updateProduct'],
			},
		},
		description: 'The display name for the product',
	},

	// Options for list
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['listProducts'],
			},
		},
		options: [
			{
				displayName: 'App ID',
				name: 'appId',
				type: 'string',
				default: '',
				description: 'Filter by app ID',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 20,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Starting After',
				name: 'startingAfter',
				type: 'string',
				default: '',
				description: 'A cursor for use in pagination',
			},
		],
	},

	// Options for create
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['createProduct'],
			},
		},
		options: [
			{
				displayName: 'Subscription Period',
				name: 'subscriptionPeriod',
				type: 'options',
				default: '',
				options: [
					{ name: 'Weekly', value: 'P1W' },
					{ name: 'Monthly', value: 'P1M' },
					{ name: 'Bi-Monthly', value: 'P2M' },
					{ name: 'Quarterly', value: 'P3M' },
					{ name: 'Semi-Annual', value: 'P6M' },
					{ name: 'Annual', value: 'P1Y' },
				],
				description: 'The subscription period (ISO 8601 duration)',
			},
			{
				displayName: 'Trial Period',
				name: 'trialPeriod',
				type: 'string',
				default: '',
				description: 'The trial period in ISO 8601 duration format (e.g., P7D for 7 days)',
			},
			{
				displayName: 'Grace Period',
				name: 'gracePeriod',
				type: 'string',
				default: '',
				description: 'The grace period in ISO 8601 duration format',
			},
		],
	},
];

export async function executeProductOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];
	const projectId = getProjectId.call(this, i);

	switch (operation) {
		case 'listProducts': {
			const options = this.getNodeParameter('options', i, {}) as IDataObject;
			const returnAll = options.returnAll as boolean;

			const query: IDataObject = {};
			if (options.appId) {
				query.app_id = options.appId;
			}

			if (returnAll) {
				responseData = await revenueCatApiRequestV2AllItems.call(
					this,
					'GET',
					`/projects/${projectId}/products`,
					'items',
					{},
					query,
				);
			} else {
				const limit = options.limit as number || 20;
				query.limit = limit;

				if (options.startingAfter) {
					query.starting_after = options.startingAfter;
				}

				const response = await revenueCatApiRequestV2.call(
					this,
					'GET',
					`/projects/${projectId}/products`,
					{},
					query,
				);
				responseData = response.items as IDataObject[] || response;
			}
			break;
		}

		case 'getProduct': {
			const productId = this.getNodeParameter('productId', i) as string;

			responseData = await revenueCatApiRequestV2.call(
				this,
				'GET',
				`/projects/${projectId}/products/${productId}`,
			);
			break;
		}

		case 'createProduct': {
			const storeIdentifier = this.getNodeParameter('storeIdentifier', i) as string;
			const appId = this.getNodeParameter('appId', i) as string;
			const productType = this.getNodeParameter('productType', i) as string;
			const displayName = this.getNodeParameter('displayName', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				store_identifier: storeIdentifier,
				app_id: appId,
				type: productType,
			};

			if (displayName) {
				body.display_name = displayName;
			}

			if (options.subscriptionPeriod) {
				body.subscription_period = options.subscriptionPeriod;
			}

			if (options.trialPeriod) {
				body.trial_period = options.trialPeriod;
			}

			if (options.gracePeriod) {
				body.grace_period = options.gracePeriod;
			}

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/products`,
				body,
			);
			break;
		}

		case 'updateProduct': {
			const productId = this.getNodeParameter('productId', i) as string;
			const displayName = this.getNodeParameter('displayName', i) as string;

			const body: IDataObject = {};

			if (displayName) {
				body.display_name = displayName;
			}

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/products/${productId}`,
				body,
			);
			break;
		}

		case 'deleteProduct': {
			const productId = this.getNodeParameter('productId', i) as string;

			await revenueCatApiRequestV2.call(
				this,
				'DELETE',
				`/projects/${projectId}/products/${productId}`,
			);
			responseData = { success: true, deleted: productId };
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	if (Array.isArray(responseData)) {
		return responseData.map((item) => ({ json: item }));
	}

	return [{ json: responseData }];
}
