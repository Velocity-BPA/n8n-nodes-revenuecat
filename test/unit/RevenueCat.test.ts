/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { encodeAppUserId, parseSubscriberAttributes } from '../../nodes/RevenueCat/transport/revenueCatApi';

describe('RevenueCat Transport Utilities', () => {
	describe('encodeAppUserId', () => {
		it('should encode simple user IDs', () => {
			expect(encodeAppUserId('user123')).toBe('user123');
		});

		it('should encode user IDs with special characters', () => {
			expect(encodeAppUserId('user@example.com')).toBe('user%40example.com');
		});

		it('should encode user IDs with spaces', () => {
			expect(encodeAppUserId('user with spaces')).toBe('user%20with%20spaces');
		});

		it('should encode user IDs with slashes', () => {
			expect(encodeAppUserId('user/path/id')).toBe('user%2Fpath%2Fid');
		});

		it('should handle empty strings', () => {
			expect(encodeAppUserId('')).toBe('');
		});

		it('should encode unicode characters', () => {
			const encoded = encodeAppUserId('用户123');
			expect(encoded).toBe('%E7%94%A8%E6%88%B7123');
		});
	});

	describe('parseSubscriberAttributes', () => {
		it('should parse empty array', () => {
			const result = parseSubscriberAttributes([]);
			expect(result).toEqual({});
		});

		it('should parse single attribute', () => {
			const result = parseSubscriberAttributes([
				{ key: '$email', value: 'test@example.com' },
			]);
			expect(result).toEqual({
				$email: { value: 'test@example.com' },
			});
		});

		it('should parse multiple attributes', () => {
			const result = parseSubscriberAttributes([
				{ key: '$email', value: 'test@example.com' },
				{ key: '$displayName', value: 'Test User' },
				{ key: 'custom_field', value: 'custom_value' },
			]);
			expect(result).toEqual({
				$email: { value: 'test@example.com' },
				$displayName: { value: 'Test User' },
				custom_field: { value: 'custom_value' },
			});
		});

		it('should handle special characters in values', () => {
			const result = parseSubscriberAttributes([
				{ key: 'bio', value: 'Hello "World" & Friends' },
			]);
			expect(result).toEqual({
				bio: { value: 'Hello "World" & Friends' },
			});
		});
	});
});

describe('RevenueCat Node Structure', () => {
	it('should have proper resource definitions', () => {
		const { resourceOptions } = require('../../nodes/RevenueCat/constants/constants');
		
		expect(resourceOptions).toBeDefined();
		expect(resourceOptions.name).toBe('resource');
		expect(resourceOptions.type).toBe('options');
		expect(resourceOptions.options).toHaveLength(11);
		
		const resourceNames = resourceOptions.options.map((opt: { value: string }) => opt.value);
		expect(resourceNames).toContain('subscriber');
		expect(resourceNames).toContain('entitlement');
		expect(resourceNames).toContain('product');
		expect(resourceNames).toContain('offering');
		expect(resourceNames).toContain('package');
		expect(resourceNames).toContain('purchase');
		expect(resourceNames).toContain('chart');
		expect(resourceNames).toContain('project');
		expect(resourceNames).toContain('app');
		expect(resourceNames).toContain('customerList');
		expect(resourceNames).toContain('webhook');
	});

	it('should have subscriber operations defined', () => {
		const { subscriberOperations } = require('../../nodes/RevenueCat/constants/constants');
		
		expect(subscriberOperations).toBeDefined();
		expect(subscriberOperations.options).toHaveLength(6);
		
		const operationNames = subscriberOperations.options.map((opt: { value: string }) => opt.value);
		expect(operationNames).toContain('getSubscriber');
		expect(operationNames).toContain('createSubscriber');
		expect(operationNames).toContain('deleteSubscriber');
		expect(operationNames).toContain('updateSubscriberAttributes');
		expect(operationNames).toContain('getSubscriberHistory');
		expect(operationNames).toContain('aliasSubscriber');
	});

	it('should have entitlement operations defined', () => {
		const { entitlementOperations } = require('../../nodes/RevenueCat/constants/constants');
		
		expect(entitlementOperations).toBeDefined();
		expect(entitlementOperations.options).toHaveLength(7);
		
		const operationNames = entitlementOperations.options.map((opt: { value: string }) => opt.value);
		expect(operationNames).toContain('listEntitlements');
		expect(operationNames).toContain('getEntitlement');
		expect(operationNames).toContain('createEntitlement');
		expect(operationNames).toContain('updateEntitlement');
		expect(operationNames).toContain('deleteEntitlement');
		expect(operationNames).toContain('attachProducts');
		expect(operationNames).toContain('detachProducts');
	});

	it('should have product operations defined', () => {
		const { productOperations } = require('../../nodes/RevenueCat/constants/constants');
		
		expect(productOperations).toBeDefined();
		expect(productOperations.options).toHaveLength(5);
	});

	it('should have offering operations defined', () => {
		const { offeringOperations } = require('../../nodes/RevenueCat/constants/constants');
		
		expect(offeringOperations).toBeDefined();
		expect(offeringOperations.options).toHaveLength(5);
	});

	it('should have package operations defined', () => {
		const { packageOperations } = require('../../nodes/RevenueCat/constants/constants');
		
		expect(packageOperations).toBeDefined();
		expect(packageOperations.options).toHaveLength(6);
	});

	it('should have purchase operations defined', () => {
		const { purchaseOperations } = require('../../nodes/RevenueCat/constants/constants');
		
		expect(purchaseOperations).toBeDefined();
		expect(purchaseOperations.options).toHaveLength(5);
	});

	it('should have chart operations defined', () => {
		const { chartOperations } = require('../../nodes/RevenueCat/constants/constants');
		
		expect(chartOperations).toBeDefined();
		expect(chartOperations.options).toHaveLength(6);
	});
});

describe('RevenueCat Credentials', () => {
	it('should have proper credential structure', () => {
		const { RevenueCatApi } = require('../../credentials/RevenueCatApi.credentials');
		const credentials = new RevenueCatApi();
		
		expect(credentials.name).toBe('revenueCatApi');
		expect(credentials.displayName).toBe('RevenueCat API');
		expect(credentials.properties).toHaveLength(4);
		
		const propertyNames = credentials.properties.map((p: { name: string }) => p.name);
		expect(propertyNames).toContain('apiKeyType');
		expect(propertyNames).toContain('apiKey');
		expect(propertyNames).toContain('projectId');
		expect(propertyNames).toContain('baseUrl');
	});

	it('should have proper authentication setup', () => {
		const { RevenueCatApi } = require('../../credentials/RevenueCatApi.credentials');
		const credentials = new RevenueCatApi();
		
		expect(credentials.authenticate).toBeDefined();
		expect(credentials.authenticate.type).toBe('generic');
		expect(credentials.authenticate.properties.headers).toBeDefined();
	});
});
