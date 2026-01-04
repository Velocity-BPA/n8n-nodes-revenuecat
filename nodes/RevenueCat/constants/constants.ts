/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const REVENUECAT_API_V1_BASE = '/v1';
export const REVENUECAT_API_V2_BASE = '/v2';

export const resourceOptions: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'App',
			value: 'app',
			description: 'Manage apps in your project',
		},
		{
			name: 'Chart',
			value: 'chart',
			description: 'Access analytics and metrics',
		},
		{
			name: 'Customer List',
			value: 'customerList',
			description: 'Create and manage customer list exports',
		},
		{
			name: 'Entitlement',
			value: 'entitlement',
			description: 'Manage entitlements and access grants',
		},
		{
			name: 'Offering',
			value: 'offering',
			description: 'Manage offerings and product sets',
		},
		{
			name: 'Package',
			value: 'package',
			description: 'Manage packages within offerings',
		},
		{
			name: 'Product',
			value: 'product',
			description: 'Manage products',
		},
		{
			name: 'Project',
			value: 'project',
			description: 'Access project information',
		},
		{
			name: 'Purchase',
			value: 'purchase',
			description: 'Manage purchases and receipts',
		},
		{
			name: 'Subscriber',
			value: 'subscriber',
			description: 'Manage subscribers and their data',
		},
		{
			name: 'Webhook',
			value: 'webhook',
			description: 'Test webhook endpoints',
		},
	],
	default: 'subscriber',
};

// Subscriber operations
export const subscriberOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['subscriber'],
		},
	},
	options: [
		{
			name: 'Alias Subscriber',
			value: 'aliasSubscriber',
			description: 'Create a subscriber alias',
			action: 'Alias subscriber',
		},
		{
			name: 'Create Subscriber',
			value: 'createSubscriber',
			description: 'Create a new subscriber',
			action: 'Create subscriber',
		},
		{
			name: 'Delete Subscriber',
			value: 'deleteSubscriber',
			description: 'Delete a subscriber',
			action: 'Delete subscriber',
		},
		{
			name: 'Get Subscriber',
			value: 'getSubscriber',
			description: 'Get subscriber by app user ID',
			action: 'Get subscriber',
		},
		{
			name: 'Get Subscriber History',
			value: 'getSubscriberHistory',
			description: 'Get subscriber purchase history',
			action: 'Get subscriber history',
		},
		{
			name: 'Update Subscriber Attributes',
			value: 'updateSubscriberAttributes',
			description: 'Update subscriber attributes',
			action: 'Update subscriber attributes',
		},
	],
	default: 'getSubscriber',
};

// Entitlement operations
export const entitlementOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['entitlement'],
		},
	},
	options: [
		{
			name: 'Attach Products',
			value: 'attachProducts',
			description: 'Attach products to an entitlement',
			action: 'Attach products to entitlement',
		},
		{
			name: 'Create Entitlement',
			value: 'createEntitlement',
			description: 'Create a new entitlement',
			action: 'Create entitlement',
		},
		{
			name: 'Delete Entitlement',
			value: 'deleteEntitlement',
			description: 'Delete an entitlement',
			action: 'Delete entitlement',
		},
		{
			name: 'Detach Products',
			value: 'detachProducts',
			description: 'Detach products from an entitlement',
			action: 'Detach products from entitlement',
		},
		{
			name: 'Get Entitlement',
			value: 'getEntitlement',
			description: 'Get an entitlement by ID',
			action: 'Get entitlement',
		},
		{
			name: 'List Entitlements',
			value: 'listEntitlements',
			description: 'List all entitlements',
			action: 'List entitlements',
		},
		{
			name: 'Update Entitlement',
			value: 'updateEntitlement',
			description: 'Update an entitlement',
			action: 'Update entitlement',
		},
	],
	default: 'listEntitlements',
};

// Product operations
export const productOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['product'],
		},
	},
	options: [
		{
			name: 'Create Product',
			value: 'createProduct',
			description: 'Create a new product',
			action: 'Create product',
		},
		{
			name: 'Delete Product',
			value: 'deleteProduct',
			description: 'Delete a product',
			action: 'Delete product',
		},
		{
			name: 'Get Product',
			value: 'getProduct',
			description: 'Get a product by ID',
			action: 'Get product',
		},
		{
			name: 'List Products',
			value: 'listProducts',
			description: 'List all products',
			action: 'List products',
		},
		{
			name: 'Update Product',
			value: 'updateProduct',
			description: 'Update a product',
			action: 'Update product',
		},
	],
	default: 'listProducts',
};

// Offering operations
export const offeringOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['offering'],
		},
	},
	options: [
		{
			name: 'Create Offering',
			value: 'createOffering',
			description: 'Create a new offering',
			action: 'Create offering',
		},
		{
			name: 'Delete Offering',
			value: 'deleteOffering',
			description: 'Delete an offering',
			action: 'Delete offering',
		},
		{
			name: 'Get Offering',
			value: 'getOffering',
			description: 'Get an offering by ID',
			action: 'Get offering',
		},
		{
			name: 'List Offerings',
			value: 'listOfferings',
			description: 'List all offerings',
			action: 'List offerings',
		},
		{
			name: 'Update Offering',
			value: 'updateOffering',
			description: 'Update an offering',
			action: 'Update offering',
		},
	],
	default: 'listOfferings',
};

// Package operations
export const packageOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['package'],
		},
	},
	options: [
		{
			name: 'Attach Products',
			value: 'attachProducts',
			description: 'Attach products to a package',
			action: 'Attach products to package',
		},
		{
			name: 'Create Package',
			value: 'createPackage',
			description: 'Create a new package',
			action: 'Create package',
		},
		{
			name: 'Delete Package',
			value: 'deletePackage',
			description: 'Delete a package',
			action: 'Delete package',
		},
		{
			name: 'Get Package',
			value: 'getPackage',
			description: 'Get a package by ID',
			action: 'Get package',
		},
		{
			name: 'List Packages',
			value: 'listPackages',
			description: 'List packages in an offering',
			action: 'List packages',
		},
		{
			name: 'Update Package',
			value: 'updatePackage',
			description: 'Update a package',
			action: 'Update package',
		},
	],
	default: 'listPackages',
};

// Purchase operations
export const purchaseOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['purchase'],
		},
	},
	options: [
		{
			name: 'Defer Billing',
			value: 'deferBilling',
			description: 'Defer subscription billing',
			action: 'Defer billing',
		},
		{
			name: 'Grant Entitlement',
			value: 'grantEntitlement',
			description: 'Grant a promotional entitlement',
			action: 'Grant entitlement',
		},
		{
			name: 'Post Receipt',
			value: 'postReceipt',
			description: 'Post a receipt for validation',
			action: 'Post receipt',
		},
		{
			name: 'Refund Purchase',
			value: 'refundPurchase',
			description: 'Refund and revoke a purchase (Google only)',
			action: 'Refund purchase',
		},
		{
			name: 'Revoke Entitlement',
			value: 'revokeEntitlement',
			description: 'Revoke an entitlement',
			action: 'Revoke entitlement',
		},
	],
	default: 'postReceipt',
};

// Chart operations
export const chartOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['chart'],
		},
	},
	options: [
		{
			name: 'Get Active Subscriptions',
			value: 'getActiveSubscriptions',
			description: 'Get subscription counts',
			action: 'Get active subscriptions',
		},
		{
			name: 'Get Churn',
			value: 'getChurn',
			description: 'Get churn metrics',
			action: 'Get churn',
		},
		{
			name: 'Get MRR',
			value: 'getMRR',
			description: 'Get MRR metrics',
			action: 'Get MRR',
		},
		{
			name: 'Get Overview',
			value: 'getOverview',
			description: 'Get overview metrics',
			action: 'Get overview',
		},
		{
			name: 'Get Revenue',
			value: 'getRevenue',
			description: 'Get revenue metrics',
			action: 'Get revenue',
		},
		{
			name: 'Get Trial Conversion',
			value: 'getTrialConversion',
			description: 'Get trial conversion metrics',
			action: 'Get trial conversion',
		},
	],
	default: 'getOverview',
};

// Project operations
export const projectOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['project'],
		},
	},
	options: [
		{
			name: 'Get Project',
			value: 'getProject',
			description: 'Get project details',
			action: 'Get project',
		},
		{
			name: 'List Projects',
			value: 'listProjects',
			description: 'List all projects',
			action: 'List projects',
		},
	],
	default: 'listProjects',
};

// App operations
export const appOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['app'],
		},
	},
	options: [
		{
			name: 'Create App',
			value: 'createApp',
			description: 'Create a new app',
			action: 'Create app',
		},
		{
			name: 'Get App',
			value: 'getApp',
			description: 'Get app by ID',
			action: 'Get app',
		},
		{
			name: 'List Apps',
			value: 'listApps',
			description: 'List apps in project',
			action: 'List apps',
		},
		{
			name: 'Update App',
			value: 'updateApp',
			description: 'Update an app',
			action: 'Update app',
		},
	],
	default: 'listApps',
};

// Customer List operations
export const customerListOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['customerList'],
		},
	},
	options: [
		{
			name: 'Create Customer List',
			value: 'createCustomerList',
			description: 'Create a customer list export',
			action: 'Create customer list',
		},
		{
			name: 'Get Customer List',
			value: 'getCustomerList',
			description: 'Get export status',
			action: 'Get customer list',
		},
	],
	default: 'createCustomerList',
};

// Webhook operations
export const webhookOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['webhook'],
		},
	},
	options: [
		{
			name: 'Test Webhook',
			value: 'testWebhook',
			description: 'Test a webhook endpoint',
			action: 'Test webhook',
		},
	],
	default: 'testWebhook',
};

// Store types
export const storeTypes = [
	{ name: 'App Store', value: 'app_store' },
	{ name: 'Play Store', value: 'play_store' },
	{ name: 'Amazon', value: 'amazon' },
	{ name: 'Stripe', value: 'stripe' },
	{ name: 'Promotional', value: 'promotional' },
];

// Platform types
export const platformTypes = [
	{ name: 'iOS', value: 'ios' },
	{ name: 'Android', value: 'android' },
	{ name: 'macOS', value: 'macos' },
	{ name: 'Amazon', value: 'amazon' },
	{ name: 'Stripe', value: 'stripe' },
];

// App types
export const appTypes = [
	{ name: 'App Store', value: 'app_store' },
	{ name: 'Play Store', value: 'play_store' },
	{ name: 'Amazon', value: 'amazon' },
	{ name: 'Stripe', value: 'stripe' },
	{ name: 'macOS', value: 'mac_app_store' },
];
