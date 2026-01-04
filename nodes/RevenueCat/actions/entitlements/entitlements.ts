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

export const entitlementFields: INodeProperties[] = [
	// Project ID
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['entitlement'],
			},
		},
		description: 'The project ID (leave empty to use the one from credentials)',
	},

	// Entitlement ID
	{
		displayName: 'Entitlement ID',
		name: 'entitlementId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['entitlement'],
				operation: [
					'getEntitlement',
					'updateEntitlement',
					'deleteEntitlement',
					'attachProducts',
					'detachProducts',
				],
			},
		},
		description: 'The unique identifier for the entitlement',
	},

	// Lookup Key for create
	{
		displayName: 'Lookup Key',
		name: 'lookupKey',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['entitlement'],
				operation: ['createEntitlement'],
			},
		},
		description: 'A unique lookup key for the entitlement (e.g., "premium", "pro")',
	},

	// Display Name
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['entitlement'],
				operation: ['createEntitlement', 'updateEntitlement'],
			},
		},
		description: 'The display name for the entitlement',
	},

	// Product IDs for attach/detach
	{
		displayName: 'Product IDs',
		name: 'productIds',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['entitlement'],
				operation: ['attachProducts', 'detachProducts'],
			},
		},
		description: 'Comma-separated list of product IDs to attach or detach',
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
				resource: ['entitlement'],
				operation: ['listEntitlements'],
			},
		},
		options: [
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

	// Options for update
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['entitlement'],
				operation: ['updateEntitlement'],
			},
		},
		options: [
			{
				displayName: 'Lookup Key',
				name: 'lookupKey',
				type: 'string',
				default: '',
				description: 'Update the lookup key for the entitlement',
			},
		],
	},
];

export async function executeEntitlementOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];
	const projectId = getProjectId.call(this, i);

	switch (operation) {
		case 'listEntitlements': {
			const options = this.getNodeParameter('options', i, {}) as IDataObject;
			const returnAll = options.returnAll as boolean;

			if (returnAll) {
				responseData = await revenueCatApiRequestV2AllItems.call(
					this,
					'GET',
					`/projects/${projectId}/entitlements`,
					'items',
				);
			} else {
				const limit = options.limit as number || 20;
				const query: IDataObject = { limit };

				if (options.startingAfter) {
					query.starting_after = options.startingAfter;
				}

				const response = await revenueCatApiRequestV2.call(
					this,
					'GET',
					`/projects/${projectId}/entitlements`,
					{},
					query,
				);
				responseData = response.items as IDataObject[] || response;
			}
			break;
		}

		case 'getEntitlement': {
			const entitlementId = this.getNodeParameter('entitlementId', i) as string;

			responseData = await revenueCatApiRequestV2.call(
				this,
				'GET',
				`/projects/${projectId}/entitlements/${entitlementId}`,
			);
			break;
		}

		case 'createEntitlement': {
			const lookupKey = this.getNodeParameter('lookupKey', i) as string;
			const displayName = this.getNodeParameter('displayName', i) as string;

			const body: IDataObject = {
				lookup_key: lookupKey,
				display_name: displayName,
			};

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/entitlements`,
				body,
			);
			break;
		}

		case 'updateEntitlement': {
			const entitlementId = this.getNodeParameter('entitlementId', i) as string;
			const displayName = this.getNodeParameter('displayName', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				display_name: displayName,
			};

			if (options.lookupKey) {
				body.lookup_key = options.lookupKey;
			}

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/entitlements/${entitlementId}`,
				body,
			);
			break;
		}

		case 'deleteEntitlement': {
			const entitlementId = this.getNodeParameter('entitlementId', i) as string;

			await revenueCatApiRequestV2.call(
				this,
				'DELETE',
				`/projects/${projectId}/entitlements/${entitlementId}`,
			);
			responseData = { success: true, deleted: entitlementId };
			break;
		}

		case 'attachProducts': {
			const entitlementId = this.getNodeParameter('entitlementId', i) as string;
			const productIds = this.getNodeParameter('productIds', i) as string;

			const products = productIds.split(',').map((id) => ({ product_id: id.trim() }));

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/entitlements/${entitlementId}/products`,
				{ products },
			);
			break;
		}

		case 'detachProducts': {
			const entitlementId = this.getNodeParameter('entitlementId', i) as string;
			const productIds = this.getNodeParameter('productIds', i) as string;

			const products = productIds.split(',').map((id) => ({ product_id: id.trim() }));

			responseData = await revenueCatApiRequestV2.call(
				this,
				'DELETE',
				`/projects/${projectId}/entitlements/${entitlementId}/products`,
				{ products },
			);
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
