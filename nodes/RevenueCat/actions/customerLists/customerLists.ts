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
	getProjectId,
} from '../../transport/revenueCatApi';

export const customerListFields: INodeProperties[] = [
	// Project ID
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['customerList'],
			},
		},
		description: 'The project ID (leave empty to use the one from credentials)',
	},

	// Export ID for get
	{
		displayName: 'Export ID',
		name: 'exportId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['customerList'],
				operation: ['getCustomerList'],
			},
		},
		description: 'The unique identifier for the customer list export',
	},

	// Fields to export
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'multiOptions',
		default: ['app_user_id', 'email'],
		displayOptions: {
			show: {
				resource: ['customerList'],
				operation: ['createCustomerList'],
			},
		},
		options: [
			{ name: 'App User ID', value: 'app_user_id' },
			{ name: 'Email', value: 'email' },
			{ name: 'First Seen', value: 'first_seen' },
			{ name: 'Last Seen', value: 'last_seen' },
			{ name: 'Country', value: 'country' },
			{ name: 'Total Revenue', value: 'total_revenue' },
			{ name: 'Store', value: 'store' },
			{ name: 'Entitlements', value: 'entitlements' },
			{ name: 'Active Subscriptions', value: 'active_subscriptions' },
			{ name: 'All Subscriptions', value: 'all_subscriptions' },
		],
		description: 'The fields to include in the export',
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
				resource: ['customerList'],
				operation: ['createCustomerList'],
			},
		},
		options: [
			{
				displayName: 'Active Only',
				name: 'activeOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to only include active subscribers',
			},
			{
				displayName: 'App ID',
				name: 'appId',
				type: 'string',
				default: '',
				description: 'Filter by specific app ID',
			},
			{
				displayName: 'Entitlement',
				name: 'entitlement',
				type: 'string',
				default: '',
				description: 'Filter by specific entitlement',
			},
			{
				displayName: 'First Seen After',
				name: 'firstSeenAfter',
				type: 'dateTime',
				default: '',
				description: 'Filter to subscribers first seen after this date',
			},
			{
				displayName: 'First Seen Before',
				name: 'firstSeenBefore',
				type: 'dateTime',
				default: '',
				description: 'Filter to subscribers first seen before this date',
			},
			{
				displayName: 'Sandbox',
				name: 'sandbox',
				type: 'boolean',
				default: false,
				description: 'Whether to include sandbox subscribers',
			},
			{
				displayName: 'Store',
				name: 'store',
				type: 'options',
				default: '',
				options: [
					{ name: 'All', value: '' },
					{ name: 'App Store', value: 'app_store' },
					{ name: 'Play Store', value: 'play_store' },
					{ name: 'Amazon', value: 'amazon' },
					{ name: 'Stripe', value: 'stripe' },
				],
				description: 'Filter by store',
			},
		],
	},
];

export async function executeCustomerListOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject;
	const projectId = getProjectId.call(this, i);

	switch (operation) {
		case 'createCustomerList': {
			const fields = this.getNodeParameter('fields', i) as string[];
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				fields,
			};

			if (options.activeOnly) {
				body.active_only = options.activeOnly;
			}

			if (options.appId) {
				body.app_id = options.appId;
			}

			if (options.entitlement) {
				body.entitlement = options.entitlement;
			}

			if (options.firstSeenAfter) {
				body.first_seen_after = options.firstSeenAfter;
			}

			if (options.firstSeenBefore) {
				body.first_seen_before = options.firstSeenBefore;
			}

			if (options.sandbox !== undefined) {
				body.sandbox = options.sandbox;
			}

			if (options.store) {
				body.store = options.store;
			}

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/customer_lists`,
				body,
			);
			break;
		}

		case 'getCustomerList': {
			const exportId = this.getNodeParameter('exportId', i) as string;

			responseData = await revenueCatApiRequestV2.call(
				this,
				'GET',
				`/projects/${projectId}/customer_lists/${exportId}`,
			);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
