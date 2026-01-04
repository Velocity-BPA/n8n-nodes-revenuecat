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
	parseSubscriberAttributes,
} from '../../transport/revenueCatApi';

export const subscriberFields: INodeProperties[] = [
	// App User ID - used by most operations
	{
		displayName: 'App User ID',
		name: 'appUserId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: [
					'getSubscriber',
					'createSubscriber',
					'deleteSubscriber',
					'updateSubscriberAttributes',
					'getSubscriberHistory',
					'aliasSubscriber',
				],
			},
		},
		description: 'The unique identifier for the subscriber',
	},

	// New App User ID for alias operation
	{
		displayName: 'New App User ID',
		name: 'newAppUserId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: ['aliasSubscriber'],
			},
		},
		description: 'The new app user ID to alias to the existing subscriber',
	},

	// Subscriber Attributes for update
	{
		displayName: 'Attributes',
		name: 'attributes',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: ['updateSubscriberAttributes'],
			},
		},
		description: 'Custom attributes to set on the subscriber',
		options: [
			{
				name: 'attribute',
				displayName: 'Attribute',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'The attribute key (e.g., "$email", "$displayName")',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The attribute value',
					},
				],
			},
		],
	},

	// Additional options for getSubscriber
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: ['getSubscriber'],
			},
		},
		options: [
			{
				displayName: 'Fetch Current Offering ID',
				name: 'fetchCurrentOfferingId',
				type: 'boolean',
				default: false,
				description: 'Whether to fetch the current offering ID for the subscriber',
			},
		],
	},

	// Options for createSubscriber
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['subscriber'],
				operation: ['createSubscriber'],
			},
		},
		options: [
			{
				displayName: 'Attributes',
				name: 'attributes',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Initial attributes to set on the subscriber',
				options: [
					{
						name: 'attribute',
						displayName: 'Attribute',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'The attribute key',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The attribute value',
							},
						],
					},
				],
			},
		],
	},
];

export async function executeSubscriberOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject;

	switch (operation) {
		case 'getSubscriber': {
			const appUserId = this.getNodeParameter('appUserId', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const headers: IDataObject = {};
			if (options.fetchCurrentOfferingId) {
				headers['X-Is-Sandbox'] = 'false';
			}

			responseData = await revenueCatApiRequestV1.call(
				this,
				'GET',
				`/subscribers/${encodeAppUserId(appUserId)}`,
				{},
				{},
				headers,
			);
			break;
		}

		case 'createSubscriber': {
			const appUserId = this.getNodeParameter('appUserId', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {};

			if (options.attributes) {
				const attrs = options.attributes as { attribute: Array<{ key: string; value: string }> };
				if (attrs.attribute && attrs.attribute.length > 0) {
					body.attributes = parseSubscriberAttributes(attrs.attribute);
				}
			}

			responseData = await revenueCatApiRequestV1.call(
				this,
				'GET',
				`/subscribers/${encodeAppUserId(appUserId)}`,
				body,
			);
			break;
		}

		case 'deleteSubscriber': {
			const appUserId = this.getNodeParameter('appUserId', i) as string;

			responseData = await revenueCatApiRequestV1.call(
				this,
				'DELETE',
				`/subscribers/${encodeAppUserId(appUserId)}`,
			);
			break;
		}

		case 'updateSubscriberAttributes': {
			const appUserId = this.getNodeParameter('appUserId', i) as string;
			const attributesCollection = this.getNodeParameter('attributes', i, {}) as {
				attribute: Array<{ key: string; value: string }>;
			};

			const body: IDataObject = {
				attributes: parseSubscriberAttributes(attributesCollection.attribute || []),
			};

			responseData = await revenueCatApiRequestV1.call(
				this,
				'POST',
				`/subscribers/${encodeAppUserId(appUserId)}/attributes`,
				body,
			);

			// This endpoint returns empty on success
			if (!responseData || Object.keys(responseData).length === 0) {
				responseData = { success: true };
			}
			break;
		}

		case 'getSubscriberHistory': {
			const appUserId = this.getNodeParameter('appUserId', i) as string;

			responseData = await revenueCatApiRequestV1.call(
				this,
				'GET',
				`/subscribers/${encodeAppUserId(appUserId)}/history`,
			);
			break;
		}

		case 'aliasSubscriber': {
			const appUserId = this.getNodeParameter('appUserId', i) as string;
			const newAppUserId = this.getNodeParameter('newAppUserId', i) as string;

			responseData = await revenueCatApiRequestV1.call(
				this,
				'POST',
				`/subscribers/${encodeAppUserId(appUserId)}/alias`,
				{
					new_app_user_id: newAppUserId,
				},
			);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
