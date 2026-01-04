# n8n-nodes-revenuecat

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for RevenueCat, the industry-standard platform for mobile in-app subscriptions and purchases. Provides complete access to RevenueCat's REST APIs for managing subscribers, entitlements, products, offerings, purchases, and analytics across iOS, Android, and web platforms.

![n8n version](https://img.shields.io/badge/n8n-%3E%3D0.170.0-blue)
![Node version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **11 Resource Categories** with 40+ operations
- **Complete Subscriber Management** - Create, update, delete, and query subscribers
- **Entitlement Control** - Manage access grants and product associations
- **Product & Offering Configuration** - Set up products, packages, and offerings
- **Purchase Operations** - Receipt validation, promotional grants, refunds
- **Analytics & Charts** - Access MRR, churn, revenue, and conversion metrics
- **Webhook Triggers** - Real-time subscription event notifications
- **Multi-Platform Support** - iOS, Android, Amazon, Stripe, macOS, Web

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-revenuecat`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the node
npm install n8n-nodes-revenuecat
```

### Development Installation

```bash
# Clone or extract the package
cd n8n-nodes-revenuecat

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-revenuecat

# Restart n8n
n8n start
```

## Credentials Setup

Create RevenueCat API credentials in n8n:

| Field | Description | Required |
|-------|-------------|----------|
| API Key Type | Select `Secret Key` for full access or `Public Key` for SDK operations | Yes |
| API Key | Your RevenueCat API key (starts with `sk_` for secret) | Yes |
| Project ID | Your RevenueCat project ID (for API v2 operations) | For v2 operations |
| Base URL | API base URL (default: `https://api.revenuecat.com`) | No |

### Getting Your API Keys

1. Log in to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Navigate to your project
3. Go to **Project Settings** > **API Keys**
4. Copy your **Secret API Key** (`sk_...`) for server-side operations
5. Copy your **Project ID** from the project settings

## Resources & Operations

### Subscribers (API v1)
| Operation | Description |
|-----------|-------------|
| Get Subscriber | Retrieve subscriber data by app user ID |
| Create Subscriber | Initialize a new subscriber |
| Delete Subscriber | Remove a subscriber |
| Update Subscriber Attributes | Set custom subscriber attributes |
| Get Subscriber History | Retrieve purchase history |
| Alias Subscriber | Link multiple user IDs |

### Entitlements (API v2)
| Operation | Description |
|-----------|-------------|
| List Entitlements | Get all entitlements with pagination |
| Get Entitlement | Retrieve single entitlement details |
| Create Entitlement | Create new access grant |
| Update Entitlement | Modify entitlement properties |
| Delete Entitlement | Remove an entitlement |
| Attach Products | Link products to entitlement |
| Detach Products | Unlink products from entitlement |

### Products (API v2)
| Operation | Description |
|-----------|-------------|
| List Products | Get all products with filtering |
| Get Product | Retrieve product details |
| Create Product | Create new store product |
| Update Product | Modify product properties |
| Delete Product | Remove a product |

### Offerings (API v2)
| Operation | Description |
|-----------|-------------|
| List Offerings | Get all offerings |
| Get Offering | Retrieve offering details |
| Create Offering | Create new offering |
| Update Offering | Modify offering (including set as current) |
| Delete Offering | Remove an offering |

### Packages (API v2)
| Operation | Description |
|-----------|-------------|
| List Packages | Get packages within an offering |
| Get Package | Retrieve package details |
| Create Package | Create new package |
| Update Package | Modify package properties |
| Delete Package | Remove a package |
| Attach Products | Associate products with package |

### Purchases (API v1)
| Operation | Description |
|-----------|-------------|
| Post Receipt | Validate store receipts (App Store, Play Store, Amazon, Stripe) |
| Grant Entitlement | Grant promotional access |
| Revoke Entitlement | Remove promotional access |
| Refund Purchase | Process Google Play refunds |
| Defer Billing | Extend subscription expiry |

### Charts/Analytics (API v2)
| Operation | Description |
|-----------|-------------|
| Get Overview | Summary metrics |
| Get Active Subscriptions | Subscription counts by resolution |
| Get MRR | Monthly recurring revenue |
| Get Churn | Churn metrics |
| Get Revenue | Revenue data |
| Get Trial Conversion | Trial-to-paid conversion rates |

### Projects (API v2)
| Operation | Description |
|-----------|-------------|
| List Projects | Get all projects |
| Get Project | Retrieve project details |

### Apps (API v2)
| Operation | Description |
|-----------|-------------|
| List Apps | Get apps in project |
| Get App | Retrieve app details |
| Create App | Create new app (iOS, Android, Amazon, Stripe, macOS) |
| Update App | Modify app name |

### Customer Lists (API v2)
| Operation | Description |
|-----------|-------------|
| Create Customer List | Create export with field selection |
| Get Customer List | Check export status |

### Webhooks (API v1)
| Operation | Description |
|-----------|-------------|
| Test Webhook | Send test event to endpoint |

## Trigger Node

The **RevenueCat Trigger** node receives real-time webhook events:

| Event | Description |
|-------|-------------|
| INITIAL_PURCHASE | First subscription or purchase |
| RENEWAL | Subscription renewed |
| CANCELLATION | Subscription canceled |
| UNCANCELLATION | Cancellation reversed |
| NON_RENEWING_PURCHASE | One-time purchase |
| SUBSCRIPTION_PAUSED | Subscription paused |
| SUBSCRIPTION_EXTENDED | Subscription extended |
| BILLING_ISSUE | Payment problem detected |
| PRODUCT_CHANGE | Plan/product changed |
| EXPIRATION | Subscription expired |
| TRANSFER | Subscription transferred |
| TEMPORARY_ENTITLEMENT_GRANT | Promotional access granted |
| REFUND | Purchase refunded |
| TEST | Test webhook event |

### Webhook Setup

1. In n8n, create a workflow with the RevenueCat Trigger node
2. Copy the webhook URL from the node
3. In RevenueCat Dashboard, go to **Project Settings** > **Integrations** > **Webhooks**
4. Add a new webhook with the n8n URL
5. (Optional) Enable signature verification for security

## Usage Examples

### Get Subscriber Data

```javascript
// Get subscriber by app user ID
{
  "resource": "subscribers",
  "operation": "getSubscriber",
  "appUserId": "user_12345"
}
```

### Grant Promotional Access

```javascript
// Grant 30-day premium access
{
  "resource": "purchases",
  "operation": "grantEntitlement",
  "appUserId": "user_12345",
  "entitlementIdentifier": "premium",
  "duration": "monthly"
}
```

### Validate Receipt

```javascript
// Validate App Store receipt
{
  "resource": "purchases",
  "operation": "postReceipt",
  "appUserId": "user_12345",
  "fetchToken": "MIIbngYJKoZIhvc...",
  "platform": "ios"
}
```

### Get Analytics

```javascript
// Get MRR for last 30 days
{
  "resource": "charts",
  "operation": "getMRR",
  "dateRange": "last_30_days",
  "resolution": "day"
}
```

## RevenueCat Concepts

| Concept | Description |
|---------|-------------|
| App User ID | Unique identifier for a subscriber across platforms |
| Entitlement | Access grant (e.g., "premium", "pro_features") |
| Offering | Collection of packages displayed to users |
| Package | Product configuration ($monthly, $annual, etc.) |
| Product | Store product ID linked to App Store/Play Store |
| Subscriber Attribute | Custom metadata attached to subscribers |
| Original App User ID | First identified user ID (before aliasing) |
| Aliases | Multiple user IDs linked to same subscriber |

## Platforms

| Platform | Store | Receipt Type |
|----------|-------|--------------|
| iOS | App Store | Base64 receipt |
| Android | Google Play | Purchase token |
| Amazon | Amazon Appstore | Receipt ID |
| Stripe | Stripe | Checkout session ID |
| macOS | Mac App Store | Base64 receipt |
| Web | Stripe/Paddle | Various |

## Error Handling

The node handles RevenueCat API errors with detailed messages:

- **400** - Bad request (invalid parameters)
- **401** - Authentication failed (invalid API key)
- **403** - Forbidden (insufficient permissions)
- **404** - Resource not found
- **409** - Conflict (subscriber already exists)
- **422** - Validation error
- **429** - Rate limited
- **500** - RevenueCat server error

Use the **Continue On Fail** option to handle errors gracefully in workflows.

## Security Best Practices

1. **Use Secret Keys Server-Side** - Never expose `sk_` keys in client applications
2. **Enable Webhook Signatures** - Verify webhook authenticity
3. **Limit API Key Scope** - Use public keys when secret access isn't needed
4. **Secure Credentials** - Use n8n's credential encryption
5. **Monitor API Usage** - Track API calls in RevenueCat dashboard

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix lint issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [RevenueCat Docs](https://docs.revenuecat.com/)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-revenuecat/issues)
- **Email**: licensing@velobpa.com

## Acknowledgments

- [RevenueCat](https://www.revenuecat.com/) for their excellent subscription platform and API
- [n8n](https://n8n.io/) for the workflow automation platform
- The n8n community for node development guidelines
