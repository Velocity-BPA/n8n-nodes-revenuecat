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

export const offeringFields: INodeProperties[] = [
	// Project ID
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['offering'],
			},
		},
		description: 'The project ID (leave empty to use the one from credentials)',
	},

	// Offering ID
	{
		displayName: 'Offering ID',
		name: 'offeringId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['offering'],
				operation: ['getOffering', 'updateOffering', 'deleteOffering'],
			},
		},
		description: 'The unique identifier for the offering',
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
				resource: ['offering'],
				operation: ['createOffering'],
			},
		},
		description: 'A unique lookup key for the offering (e.g., "default", "premium_offerings")',
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
				resource: ['offering'],
				operation: ['createOffering', 'updateOffering'],
			},
		},
		description: 'The display name for the offering',
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
				resource: ['offering'],
				operation: ['listOfferings'],
			},
		},
		options: [
			{
				displayName: 'Expand',
				name: 'expand',
				type: 'multiOptions',
				default: [],
				options: [
					{
						name: 'Packages',
						value: 'items.packages',
						description: 'Include packages in the response',
					},
					{
						name: 'Package Products',
						value: 'items.packages.items.products',
						description: 'Include products in packages',
					},
				],
				description: 'Data to expand in the response',
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

	// Options for create/update
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['offering'],
				operation: ['createOffering', 'updateOffering'],
			},
		},
		options: [
			{
				displayName: 'Is Current',
				name: 'isCurrent',
				type: 'boolean',
				default: false,
				description: 'Whether this is the current/default offering',
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'json',
				default: '{}',
				description: 'Custom metadata for the offering (JSON object)',
			},
		],
	},
];

export async function executeOfferingOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];
	const projectId = getProjectId.call(this, i);

	switch (operation) {
		case 'listOfferings': {
			const options = this.getNodeParameter('options', i, {}) as IDataObject;
			const returnAll = options.returnAll as boolean;

			const query: IDataObject = {};
			if (options.expand && (options.expand as string[]).length > 0) {
				query.expand = (options.expand as string[]).join(',');
			}

			if (returnAll) {
				responseData = await revenueCatApiRequestV2AllItems.call(
					this,
					'GET',
					`/projects/${projectId}/offerings`,
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
					`/projects/${projectId}/offerings`,
					{},
					query,
				);
				responseData = response.items as IDataObject[] || response;
			}
			break;
		}

		case 'getOffering': {
			const offeringId = this.getNodeParameter('offeringId', i) as string;

			responseData = await revenueCatApiRequestV2.call(
				this,
				'GET',
				`/projects/${projectId}/offerings/${offeringId}`,
			);
			break;
		}

		case 'createOffering': {
			const lookupKey = this.getNodeParameter('lookupKey', i) as string;
			const displayName = this.getNodeParameter('displayName', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				lookup_key: lookupKey,
				display_name: displayName,
			};

			if (options.isCurrent !== undefined) {
				body.is_current = options.isCurrent;
			}

			if (options.metadata) {
				try {
					body.metadata = JSON.parse(options.metadata as string);
				} catch {
					throw new Error('Invalid JSON in metadata field');
				}
			}

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/offerings`,
				body,
			);
			break;
		}

		case 'updateOffering': {
			const offeringId = this.getNodeParameter('offeringId', i) as string;
			const displayName = this.getNodeParameter('displayName', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				display_name: displayName,
			};

			if (options.isCurrent !== undefined) {
				body.is_current = options.isCurrent;
			}

			if (options.metadata) {
				try {
					body.metadata = JSON.parse(options.metadata as string);
				} catch {
					throw new Error('Invalid JSON in metadata field');
				}
			}

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/offerings/${offeringId}`,
				body,
			);
			break;
		}

		case 'deleteOffering': {
			const offeringId = this.getNodeParameter('offeringId', i) as string;

			await revenueCatApiRequestV2.call(
				this,
				'DELETE',
				`/projects/${projectId}/offerings/${offeringId}`,
			);
			responseData = { success: true, deleted: offeringId };
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
