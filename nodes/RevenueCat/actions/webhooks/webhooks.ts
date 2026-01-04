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
} from '../../transport/revenueCatApi';

export const webhookFields: INodeProperties[] = [
	// Webhook URL
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['testWebhook'],
			},
		},
		description: 'The webhook URL to test',
	},

	// Options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['testWebhook'],
			},
		},
		options: [
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				default: 'TEST',
				options: [
					{ name: 'Test', value: 'TEST' },
					{ name: 'Initial Purchase', value: 'INITIAL_PURCHASE' },
					{ name: 'Renewal', value: 'RENEWAL' },
					{ name: 'Cancellation', value: 'CANCELLATION' },
					{ name: 'Non Renewing Purchase', value: 'NON_RENEWING_PURCHASE' },
				],
				description: 'The event type to simulate',
			},
		],
	},
];

export async function executeWebhookOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject;

	switch (operation) {
		case 'testWebhook': {
			const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				url: webhookUrl,
			};

			if (options.eventType) {
				body.event_type = options.eventType;
			}

			responseData = await revenueCatApiRequestV1.call(
				this,
				'POST',
				'/webhooks/test',
				body,
			);

			// If successful but empty response
			if (!responseData || Object.keys(responseData).length === 0) {
				responseData = { success: true, message: 'Webhook test sent successfully' };
			}
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
