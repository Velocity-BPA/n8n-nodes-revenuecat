/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	resourceOptions,
	subscriberOperations,
	entitlementOperations,
	productOperations,
	offeringOperations,
	packageOperations,
	purchaseOperations,
	chartOperations,
	projectOperations,
	appOperations,
	customerListOperations,
	webhookOperations,
} from './constants/constants';

import { subscriberFields, executeSubscriberOperation } from './actions/subscribers/subscribers';
import { entitlementFields, executeEntitlementOperation } from './actions/entitlements/entitlements';
import { productFields, executeProductOperation } from './actions/products/products';
import { offeringFields, executeOfferingOperation } from './actions/offerings/offerings';
import { packageFields, executePackageOperation } from './actions/packages/packages';
import { purchaseFields, executePurchaseOperation } from './actions/purchases/purchases';
import { chartFields, executeChartOperation } from './actions/charts/charts';
import { projectFields, executeProjectOperation } from './actions/projects/projects';
import { appFields, executeAppOperation } from './actions/apps/apps';
import { customerListFields, executeCustomerListOperation } from './actions/customerLists/customerLists';
import { webhookFields, executeWebhookOperation } from './actions/webhooks/webhooks';

// Emit licensing notice once
let licenseNoticeEmitted = false;
function emitLicenseNotice(): void {
	if (!licenseNoticeEmitted) {
		console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
		licenseNoticeEmitted = true;
	}
}

export class RevenueCat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RevenueCat',
		name: 'revenueCat',
		icon: 'file:revenuecat.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with RevenueCat API for in-app subscription management',
		defaults: {
			name: 'RevenueCat',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'revenueCatApi',
				required: true,
			},
		],
		properties: [
			resourceOptions,
			// Operations
			subscriberOperations,
			entitlementOperations,
			productOperations,
			offeringOperations,
			packageOperations,
			purchaseOperations,
			chartOperations,
			projectOperations,
			appOperations,
			customerListOperations,
			webhookOperations,
			// Fields
			...subscriberFields,
			...entitlementFields,
			...productFields,
			...offeringFields,
			...packageFields,
			...purchaseFields,
			...chartFields,
			...projectFields,
			...appFields,
			...customerListFields,
			...webhookFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		emitLicenseNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[];

				switch (resource) {
					case 'subscriber':
						result = await executeSubscriberOperation.call(this, operation, i);
						break;
					case 'entitlement':
						result = await executeEntitlementOperation.call(this, operation, i);
						break;
					case 'product':
						result = await executeProductOperation.call(this, operation, i);
						break;
					case 'offering':
						result = await executeOfferingOperation.call(this, operation, i);
						break;
					case 'package':
						result = await executePackageOperation.call(this, operation, i);
						break;
					case 'purchase':
						result = await executePurchaseOperation.call(this, operation, i);
						break;
					case 'chart':
						result = await executeChartOperation.call(this, operation, i);
						break;
					case 'project':
						result = await executeProjectOperation.call(this, operation, i);
						break;
					case 'app':
						result = await executeAppOperation.call(this, operation, i);
						break;
					case 'customerList':
						result = await executeCustomerListOperation.call(this, operation, i);
						break;
					case 'webhook':
						result = await executeWebhookOperation.call(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
