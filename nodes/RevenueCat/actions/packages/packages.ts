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

export const packageFields: INodeProperties[] = [
	// Project ID
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['package'],
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
				resource: ['package'],
				operation: ['listPackages', 'createPackage'],
			},
		},
		description: 'The offering ID that contains the packages',
	},

	// Package ID
	{
		displayName: 'Package ID',
		name: 'packageId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['package'],
				operation: ['getPackage', 'updatePackage', 'deletePackage', 'attachProducts'],
			},
		},
		description: 'The unique identifier for the package',
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
				resource: ['package'],
				operation: ['createPackage'],
			},
		},
		description: 'A unique lookup key for the package (e.g., "$rc_monthly", "$rc_annual")',
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
				resource: ['package'],
				operation: ['createPackage', 'updatePackage'],
			},
		},
		description: 'The display name for the package',
	},

	// Product IDs for attach
	{
		displayName: 'Product Associations',
		name: 'productAssociations',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		required: true,
		default: {},
		displayOptions: {
			show: {
				resource: ['package'],
				operation: ['attachProducts'],
			},
		},
		description: 'Products to attach to the package',
		options: [
			{
				name: 'association',
				displayName: 'Product Association',
				values: [
					{
						displayName: 'Product ID',
						name: 'productId',
						type: 'string',
						default: '',
						description: 'The product ID to attach',
					},
					{
						displayName: 'Eligibility Criteria',
						name: 'eligibilityCriteria',
						type: 'options',
						default: 'all',
						options: [
							{
								name: 'All',
								value: 'all',
								description: 'Available to all users',
							},
							{
								name: 'Introductory',
								value: 'introductory',
								description: 'Only for users eligible for intro offers',
							},
							{
								name: 'Standard',
								value: 'standard',
								description: 'Only for users not eligible for intro offers',
							},
						],
						description: 'The eligibility criteria for this product',
					},
				],
			},
		],
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
				resource: ['package'],
				operation: ['listPackages'],
			},
		},
		options: [
			{
				displayName: 'Expand Products',
				name: 'expandProducts',
				type: 'boolean',
				default: false,
				description: 'Whether to expand product details in the response',
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
				resource: ['package'],
				operation: ['createPackage'],
			},
		},
		options: [
			{
				displayName: 'Position',
				name: 'position',
				type: 'number',
				default: 0,
				description: 'The display position of the package within the offering',
			},
		],
	},
];

export async function executePackageOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];
	const projectId = getProjectId.call(this, i);

	switch (operation) {
		case 'listPackages': {
			const offeringId = this.getNodeParameter('offeringId', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;
			const returnAll = options.returnAll as boolean;

			const query: IDataObject = {};
			if (options.expandProducts) {
				query.expand = 'items.products';
			}

			if (returnAll) {
				responseData = await revenueCatApiRequestV2AllItems.call(
					this,
					'GET',
					`/projects/${projectId}/offerings/${offeringId}/packages`,
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
					`/projects/${projectId}/offerings/${offeringId}/packages`,
					{},
					query,
				);
				responseData = response.items as IDataObject[] || response;
			}
			break;
		}

		case 'getPackage': {
			const packageId = this.getNodeParameter('packageId', i) as string;

			responseData = await revenueCatApiRequestV2.call(
				this,
				'GET',
				`/projects/${projectId}/packages/${packageId}`,
			);
			break;
		}

		case 'createPackage': {
			const offeringId = this.getNodeParameter('offeringId', i) as string;
			const lookupKey = this.getNodeParameter('lookupKey', i) as string;
			const displayName = this.getNodeParameter('displayName', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				lookup_key: lookupKey,
				display_name: displayName,
			};

			if (options.position !== undefined) {
				body.position = options.position;
			}

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/offerings/${offeringId}/packages`,
				body,
			);
			break;
		}

		case 'updatePackage': {
			const packageId = this.getNodeParameter('packageId', i) as string;
			const displayName = this.getNodeParameter('displayName', i) as string;

			const body: IDataObject = {
				display_name: displayName,
			};

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/packages/${packageId}`,
				body,
			);
			break;
		}

		case 'deletePackage': {
			const packageId = this.getNodeParameter('packageId', i) as string;

			await revenueCatApiRequestV2.call(
				this,
				'DELETE',
				`/projects/${projectId}/packages/${packageId}`,
			);
			responseData = { success: true, deleted: packageId };
			break;
		}

		case 'attachProducts': {
			const packageId = this.getNodeParameter('packageId', i) as string;
			const productAssociations = this.getNodeParameter('productAssociations', i, {}) as {
				association: Array<{ productId: string; eligibilityCriteria: string }>;
			};

			const products = (productAssociations.association || []).map((assoc) => ({
				product_id: assoc.productId,
				eligibility_criteria: assoc.eligibilityCriteria,
			}));

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/packages/${packageId}/products`,
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
