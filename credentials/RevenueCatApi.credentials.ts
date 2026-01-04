/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RevenueCatApi implements ICredentialType {
	name = 'revenueCatApi';
	displayName = 'RevenueCat API';
	documentationUrl = 'https://www.revenuecat.com/docs/api-v1';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key Type',
			name: 'apiKeyType',
			type: 'options',
			options: [
				{
					name: 'Secret API Key (Recommended)',
					value: 'secret',
					description: 'Full access to all API operations (starts with sk_)',
				},
				{
					name: 'Public API Key',
					value: 'public',
					description: 'Limited SDK operations only',
				},
			],
			default: 'secret',
			description: 'The type of API key to use for authentication',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your RevenueCat API key. Secret keys start with "sk_".',
		},
		{
			displayName: 'Project ID',
			name: 'projectId',
			type: 'string',
			default: '',
			description: 'Your RevenueCat project ID (required for API v2 endpoints)',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.revenuecat.com',
			description: 'The base URL for the RevenueCat API',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v2/projects',
			method: 'GET',
		},
	};
}
