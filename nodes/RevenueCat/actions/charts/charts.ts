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

export const chartFields: INodeProperties[] = [
	// Project ID
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['chart'],
			},
		},
		description: 'The project ID (leave empty to use the one from credentials)',
	},

	// Common date range options
	{
		displayName: 'Date Range',
		name: 'dateRange',
		type: 'options',
		default: 'last_28_days',
		displayOptions: {
			show: {
				resource: ['chart'],
			},
		},
		options: [
			{ name: 'Last 7 Days', value: 'last_7_days' },
			{ name: 'Last 28 Days', value: 'last_28_days' },
			{ name: 'Last 30 Days', value: 'last_30_days' },
			{ name: 'Last 90 Days', value: 'last_90_days' },
			{ name: 'Last 12 Months', value: 'last_12_months' },
			{ name: 'Custom', value: 'custom' },
		],
		description: 'The date range for the chart data',
	},

	// Custom start date
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				resource: ['chart'],
				dateRange: ['custom'],
			},
		},
		description: 'The start date for the custom range',
	},

	// Custom end date
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				resource: ['chart'],
				dateRange: ['custom'],
			},
		},
		description: 'The end date for the custom range',
	},

	// Resolution
	{
		displayName: 'Resolution',
		name: 'resolution',
		type: 'options',
		default: 'day',
		displayOptions: {
			show: {
				resource: ['chart'],
				operation: [
					'getActiveSubscriptions',
					'getMRR',
					'getChurn',
					'getRevenue',
					'getTrialConversion',
				],
			},
		},
		options: [
			{ name: 'Day', value: 'day' },
			{ name: 'Week', value: 'week' },
			{ name: 'Month', value: 'month' },
		],
		description: 'The time resolution for the chart data',
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
				resource: ['chart'],
			},
		},
		options: [
			{
				displayName: 'App ID',
				name: 'appId',
				type: 'string',
				default: '',
				description: 'Filter by specific app ID',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				description: 'Filter by country code (e.g., US, GB)',
			},
			{
				displayName: 'Sandbox',
				name: 'sandbox',
				type: 'boolean',
				default: false,
				description: 'Whether to include sandbox data',
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

export async function executeChartOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const projectId = getProjectId.call(this, i);
	const dateRange = this.getNodeParameter('dateRange', i) as string;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;

	const query: IDataObject = {};

	// Handle date range
	if (dateRange === 'custom') {
		const startDate = this.getNodeParameter('startDate', i) as string;
		const endDate = this.getNodeParameter('endDate', i) as string;
		query.start_date = startDate.split('T')[0];
		query.end_date = endDate.split('T')[0];
	} else {
		const now = new Date();
		let startDate: Date;

		switch (dateRange) {
			case 'last_7_days':
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case 'last_28_days':
				startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
				break;
			case 'last_30_days':
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case 'last_90_days':
				startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			case 'last_12_months':
				startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
				break;
			default:
				startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
		}

		query.start_date = startDate.toISOString().split('T')[0];
		query.end_date = now.toISOString().split('T')[0];
	}

	// Add resolution for applicable operations
	if (['getActiveSubscriptions', 'getMRR', 'getChurn', 'getRevenue', 'getTrialConversion'].includes(operation)) {
		const resolution = this.getNodeParameter('resolution', i) as string;
		query.resolution = resolution;
	}

	// Add optional filters
	if (options.appId) {
		query.app_id = options.appId;
	}

	if (options.country) {
		query.country = options.country;
	}

	if (options.sandbox !== undefined) {
		query.sandbox = options.sandbox;
	}

	if (options.store) {
		query.store = options.store;
	}

	let endpoint: string;

	switch (operation) {
		case 'getOverview':
			endpoint = `/projects/${projectId}/metrics/overview`;
			break;

		case 'getActiveSubscriptions':
			endpoint = `/projects/${projectId}/metrics/active_subscriptions`;
			break;

		case 'getMRR':
			endpoint = `/projects/${projectId}/metrics/mrr`;
			break;

		case 'getChurn':
			endpoint = `/projects/${projectId}/metrics/churn`;
			break;

		case 'getRevenue':
			endpoint = `/projects/${projectId}/metrics/revenue`;
			break;

		case 'getTrialConversion':
			endpoint = `/projects/${projectId}/metrics/trial_conversion`;
			break;

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	const responseData = await revenueCatApiRequestV2.call(
		this,
		'GET',
		endpoint,
		{},
		query,
	);

	return [{ json: responseData }];
}
