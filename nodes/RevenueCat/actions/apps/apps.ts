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

export const appFields: INodeProperties[] = [
	// Project ID
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['app'],
			},
		},
		description: 'The project ID (leave empty to use the one from credentials)',
	},

	// App ID
	{
		displayName: 'App ID',
		name: 'appId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['app'],
				operation: ['getApp', 'updateApp'],
			},
		},
		description: 'The unique identifier for the app',
	},

	// App Name for create
	{
		displayName: 'App Name',
		name: 'appName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['app'],
				operation: ['createApp'],
			},
		},
		description: 'The name for the app',
	},

	// App Type
	{
		displayName: 'App Type',
		name: 'appType',
		type: 'options',
		required: true,
		default: 'app_store',
		displayOptions: {
			show: {
				resource: ['app'],
				operation: ['createApp'],
			},
		},
		options: [
			{ name: 'App Store (iOS)', value: 'app_store' },
			{ name: 'Play Store (Android)', value: 'play_store' },
			{ name: 'Amazon', value: 'amazon' },
			{ name: 'Stripe', value: 'stripe' },
			{ name: 'Mac App Store', value: 'mac_app_store' },
		],
		description: 'The type/platform of the app',
	},

	// Bundle ID
	{
		displayName: 'Bundle ID',
		name: 'bundleId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['app'],
				operation: ['createApp'],
			},
		},
		description: 'The bundle/package identifier (e.g., com.example.app)',
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
				resource: ['app'],
				operation: ['listApps'],
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

	// Options for create
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['app'],
				operation: ['createApp'],
			},
		},
		options: [
			{
				displayName: 'Amazon API Key',
				name: 'amazonApiKey',
				type: 'string',
				default: '',
				description: 'The Amazon Appstore shared secret (for Amazon apps)',
			},
			{
				displayName: 'Google Service Account Key',
				name: 'googleServiceAccountKey',
				type: 'json',
				default: '',
				description: 'The Google service account credentials JSON (for Play Store apps)',
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
				resource: ['app'],
				operation: ['updateApp'],
			},
		},
		options: [
			{
				displayName: 'App Name',
				name: 'appName',
				type: 'string',
				default: '',
				description: 'Update the app name',
			},
		],
	},
];

export async function executeAppOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];
	const projectId = getProjectId.call(this, i);

	switch (operation) {
		case 'listApps': {
			const options = this.getNodeParameter('options', i, {}) as IDataObject;
			const returnAll = options.returnAll as boolean;

			if (returnAll) {
				responseData = await revenueCatApiRequestV2AllItems.call(
					this,
					'GET',
					`/projects/${projectId}/apps`,
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
					`/projects/${projectId}/apps`,
					{},
					query,
				);
				responseData = response.items as IDataObject[] || response;
			}
			break;
		}

		case 'getApp': {
			const appId = this.getNodeParameter('appId', i) as string;

			responseData = await revenueCatApiRequestV2.call(
				this,
				'GET',
				`/projects/${projectId}/apps/${appId}`,
			);
			break;
		}

		case 'createApp': {
			const appName = this.getNodeParameter('appName', i) as string;
			const appType = this.getNodeParameter('appType', i) as string;
			const bundleId = this.getNodeParameter('bundleId', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				name: appName,
				type: appType,
				bundle_id: bundleId,
			};

			if (options.amazonApiKey) {
				body.amazon_api_key = options.amazonApiKey;
			}

			if (options.googleServiceAccountKey) {
				try {
					body.google_service_account_credentials = JSON.parse(options.googleServiceAccountKey as string);
				} catch {
					throw new Error('Invalid JSON in Google Service Account Key field');
				}
			}

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/apps`,
				body,
			);
			break;
		}

		case 'updateApp': {
			const appId = this.getNodeParameter('appId', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {};

			if (options.appName) {
				body.name = options.appName;
			}

			responseData = await revenueCatApiRequestV2.call(
				this,
				'POST',
				`/projects/${projectId}/apps/${appId}`,
				body,
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
