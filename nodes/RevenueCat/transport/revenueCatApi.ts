/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestMethods,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { REVENUECAT_API_V1_BASE, REVENUECAT_API_V2_BASE } from '../constants/constants';

export interface IRevenueCatApiResponse {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

/**
 * Make an API request to RevenueCat API v1
 */
export async function revenueCatApiRequestV1(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	headers: IDataObject = {},
): Promise<IRevenueCatApiResponse> {
	const credentials = await this.getCredentials('revenueCatApi');

	const baseUrl = (credentials.baseUrl as string) || 'https://api.revenuecat.com';

	const options: {
		method: IHttpRequestMethods;
		url: string;
		headers: IDataObject;
		body?: IDataObject;
		qs?: IDataObject;
		json: boolean;
	} = {
		method,
		url: `${baseUrl}${REVENUECAT_API_V1_BASE}${endpoint}`,
		headers: {
			Authorization: `Bearer ${credentials.apiKey}`,
			'Content-Type': 'application/json',
			...headers,
		},
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	if (Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		const response = await this.helpers.request(options);
		return response as IRevenueCatApiResponse;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: getErrorMessage(error),
		});
	}
}

/**
 * Make an API request to RevenueCat API v2
 */
export async function revenueCatApiRequestV2(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	headers: IDataObject = {},
): Promise<IRevenueCatApiResponse> {
	const credentials = await this.getCredentials('revenueCatApi');

	const baseUrl = (credentials.baseUrl as string) || 'https://api.revenuecat.com';

	const options: {
		method: IHttpRequestMethods;
		url: string;
		headers: IDataObject;
		body?: IDataObject;
		qs?: IDataObject;
		json: boolean;
	} = {
		method,
		url: `${baseUrl}${REVENUECAT_API_V2_BASE}${endpoint}`,
		headers: {
			Authorization: `Bearer ${credentials.apiKey}`,
			'Content-Type': 'application/json',
			...headers,
		},
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	if (Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		const response = await this.helpers.request(options);
		return response as IRevenueCatApiResponse;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: getErrorMessage(error),
		});
	}
}

/**
 * Make a paginated API request to RevenueCat API v2
 */
export async function revenueCatApiRequestV2AllItems(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	propertyName: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];

	let nextPage: string | undefined;

	do {
		if (nextPage) {
			query.starting_after = nextPage;
		}

		const response = await revenueCatApiRequestV2.call(this, method, endpoint, body, query);

		const items = response[propertyName] as IDataObject[];
		if (items) {
			returnData.push(...items);
		}

		nextPage = response.next_page as string | undefined;
	} while (nextPage);

	return returnData;
}

/**
 * Get project ID from credentials or parameters
 */
export async function getProjectId(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	itemIndex: number = 0,
): Promise<string> {
	// First try to get from node parameters
	try {
		const projectIdParam = this.getNodeParameter('projectId', itemIndex, '') as string;
		if (projectIdParam) {
			return projectIdParam;
		}
	} catch {
		// Parameter doesn't exist, continue
	}

	// Fall back to credentials
	const credentials = await this.getCredentials('revenueCatApi');
	if (credentials && credentials.projectId) {
		return credentials.projectId as string;
	}

	throw new Error('Project ID is required. Please provide it in the node settings or credentials.');
}

/**
 * Extract error message from RevenueCat error response
 */
function getErrorMessage(error: unknown): string {
	if (typeof error === 'object' && error !== null) {
		const err = error as { message?: string; error?: { message?: string } };
		if (err.message) {
			return err.message;
		}
		if (err.error?.message) {
			return err.error.message;
		}
	}
	return 'An unknown error occurred';
}

/**
 * Encode app user ID for URL
 */
export function encodeAppUserId(appUserId: string): string {
	return encodeURIComponent(appUserId);
}

/**
 * Parse subscriber attributes from key-value pairs
 */
export function parseSubscriberAttributes(
	attributes: Array<{ key: string; value: string }>,
): IDataObject {
	const result: IDataObject = {};

	for (const attr of attributes) {
		result[attr.key] = {
			value: attr.value,
		};
	}

	return result;
}
