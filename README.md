# n8n-nodes-status-check

This is an n8n community node that lets you use [Status Check](https://status-check.io) in your n8n workflows.

Status Check provides domain and email validation services to help you verify leads, clean contact lists, and automate quality checks in your workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

### Actions (Regular Nodes)

**Validation Resource**
- Check Website: Validate domain status, detect parking, follow redirects
- Check Email: SMTP-based email deliverability validation
- Get Validation Job: Retrieve async validation job results

**Lead Resource**
- Create Lead: Create new lead with optional validation
- Get Lead: Retrieve lead by ID
- Update Lead: Update lead information
- List Leads: Query leads with filters
- Bulk Create: Create multiple leads at once

**Webhook Resource**
- Create Webhook: Register webhook endpoints
- List Webhooks: Get all registered webhooks
- Delete Webhook: Remove webhook subscriptions
- Test Webhook: Send test events to webhooks

### Triggers (Webhook Nodes)

Automatically start workflows when events occur:

**Validation Triggers**
- **Validation Started Trigger**: Fires when validation job begins
- **Validation Complete Trigger**: Fires when email/domain validation finishes
- **Validation Failed Trigger**: Fires when validation job fails

**Credits Triggers**
- **Credits Low Trigger**: Fires when account credits fall below threshold
- **Credits Depleted Trigger**: Fires when credits are completely exhausted

**Lead Triggers**
- **Lead Created Trigger**: Fires when new lead is created
- **Lead Updated Trigger**: Fires when lead information is updated
- **Lead Validated Trigger**: Fires when lead validation completes

## Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes** in your n8n instance
2. Click **Install**
3. Enter `@status-check/n8n-nodes-status-check`
4. Click **Install**

### Manual Installation

```bash
cd ~/.n8n/custom
npm install @status-check/n8n-nodes-status-check
```

Then restart your n8n instance.

## Prerequisites

You need:
- An active [Status Check account](https://app.status-check.io)
- A Status Check API key (get it from [Account Settings](https://app.status-check.io/profile))

## Credentials

When you add the Status Check node for the first time, you'll need to configure credentials:

1. **API Key**: Your Status Check API key (starts with `sk_live_...`)
2. **Environment**: Choose `Production` for live API or `Test` for local development

The credentials will be tested automatically by calling `/v1/credits` endpoint.

## Operations

### Validation Operations

#### Check Website

Validates a domain's HTTP status, detects parking pages, and follows redirect chains.

**Input:**
- `website` (required): Domain to validate (e.g., `example.com` or `https://example.com`)
- `returnDetails` (optional): Return full validation details including HTTP status, SSL info, redirect chain

**Output:**
```json
{
  "website": "example.com",
  "status": "active",
  "valid": true,
  "httpStatus": 200,
  "isParked": false,
  "redirectChain": ["https://example.com"],
  "creditsDeducted": 1,
  "creditsRemaining": 99
}
```

#### Check Email

Validates email deliverability using SMTP verification.

**Input:**
- `email` (required): Email address to validate
- `timeout` (optional): Max seconds to wait (5-60, default: 30)
- `returnDetails` (optional): Return detailed validation results
- `webhookUrl` (optional): Webhook URL for async results if validation times out

**Output:**
```json
{
  "email": "user@example.com",
  "valid": true,
  "catch_all": false,
  "service": "Google",
  "domain": "example.com",
  "creditsDeducted": 2,
  "creditsRemaining": 97
}
```

#### Get Validation Job

Retrieves results of an async validation job.

**Input:**
- `jobId` (required): Validation job ID (e.g., `val_abc123def456`)

**Output:**
```json
{
  "id": "val_abc123def456",
  "status": "completed",
  "email": "user@example.com",
  "result": {
    "valid": true,
    "catch_all": false,
    "service": "Google"
  }
}
```

### Lead Operations

#### Create Lead

Creates a new lead with optional validation.

**Input:**
- `email` (required): Lead email address
- `website` (optional): Lead website/domain
- **Additional Fields**: firstName, lastName, company, jobTitle, phone, linkedinUrl, customFields
- **Validation Options**: validate, validateDomain, validateEmail

**Output:**
```json
{
  "id": "lead_abc123",
  "email": "john@example.com",
  "website": "example.com",
  "firstName": "John",
  "validationStatus": "verified",
  "emailValid": true,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

#### Bulk Create

Creates multiple leads at once.

**Input:**
- `leads` (required): JSON array of lead objects
- **Bulk Validation Options**: validateDomain, validateEmail

**Example:**
```json
[
  {"email": "user1@example.com", "firstName": "John"},
  {"email": "user2@example.com", "firstName": "Jane"}
]
```

### Webhook Operations

#### Create Webhook

Registers a webhook endpoint for event notifications.

**Input:**
- `name` (required): Friendly webhook name
- `url` (required): Endpoint URL to receive webhooks
- `events` (required): Events to subscribe to (multi-select)
  - `validation.started`
  - `validation.complete`
  - `validation.failed`
  - `credits.low`
  - `credits.depleted`
  - `lead.created`
  - `lead.updated`
  - `lead.validated`
- **Additional Fields**: description, active

## Triggers

### Validation Complete Trigger

Automatically starts your workflow when a validation job completes.

**Use Cases:**
- Update CRM when email validation finishes
- Enrich leads with validation results
- Send notifications for verified contacts

**Webhook Payload:**
```json
{
  "event": "validation.complete",
  "timestamp": "2025-01-15T10:00:00Z",
  "email": "user@example.com",
  "valid": true,
  "catch_all": false,
  "service": "Google"
}
```

### Validation Failed Trigger

Fires when validation jobs fail due to errors or timeouts.

**Use Cases:**
- Alert when validation errors occur
- Retry failed validations
- Log validation failures

### Validation Started Trigger

Fires when a validation job begins processing.

**Use Cases:**
- Track validation progress in real-time
- Update UI to show "validating..." status
- Log validation start times for analytics

**Webhook Payload:**
```json
{
  "event": "validation.started",
  "timestamp": "2025-01-15T10:00:00Z",
  "jobId": "val_abc123",
  "email": "user@example.com"
}
```

### Credits Low Trigger

Fires when your account credits fall below the configured threshold.

**Use Cases:**
- Auto-purchase additional credits
- Send notifications to account admins
- Pause workflows until credits are replenished

**Webhook Payload:**
```json
{
  "event": "credits.low",
  "timestamp": "2025-01-15T10:00:00Z",
  "creditsRemaining": 10,
  "threshold": 50,
  "userId": "user_abc123"
}
```

### Credits Depleted Trigger

Fires when your account credits reach zero.

**Use Cases:**
- Urgent alerts to account owners
- Automatically pause all validation workflows
- Emergency credit purchase workflows

**Webhook Payload:**
```json
{
  "event": "credits.depleted",
  "timestamp": "2025-01-15T10:00:00Z",
  "userId": "user_abc123"
}
```

### Lead Created Trigger

Fires when a new lead is created.

**Use Cases:**
- Sync new leads to CRM immediately
- Send welcome emails to new leads
- Trigger lead enrichment workflows

**Webhook Payload:**
```json
{
  "event": "lead.created",
  "timestamp": "2025-01-15T10:00:00Z",
  "leadId": "lead_abc123",
  "email": "john@example.com",
  "website": "example.com"
}
```

### Lead Updated Trigger

Fires when lead information is updated.

**Use Cases:**
- Keep external systems in sync with lead changes
- Audit trail for lead modifications
- Trigger workflows when specific fields change

**Webhook Payload:**
```json
{
  "event": "lead.updated",
  "timestamp": "2025-01-15T10:00:00Z",
  "leadId": "lead_abc123",
  "email": "john@example.com",
  "updatedFields": ["firstName", "company"]
}
```

### Lead Validated Trigger

Fires when lead validation completes.

**Use Cases:**
- Enrich validated leads with additional data
- Move verified leads to hot prospects list
- Filter and route based on validation results

**Webhook Payload:**
```json
{
  "event": "lead.validated",
  "timestamp": "2025-01-15T10:00:00Z",
  "leadId": "lead_abc123",
  "email": "john@example.com",
  "emailValid": true,
  "websiteStatus": "active",
  "validationStatus": "verified"
}
```

## Example Workflows

### Example 1: Validate Email from Form Submission

```
Webhook (Form) → Status Check (Check Email) → Filter (Valid Only) → Add to CRM
```

1. Receive form submission via webhook
2. Validate email with Status Check
3. Filter for valid emails only
4. Add verified leads to CRM

### Example 2: Bulk Lead Validation

```
Google Sheets → Status Check (Bulk Create) → Status Check Trigger → Update Spreadsheet
```

1. Read leads from Google Sheets
2. Bulk create leads with validation
3. Wait for validation.complete trigger
4. Update spreadsheet with validation results

### Example 3: Auto-Purchase Credits

```
Credits Low Trigger → Stripe (Create Payment) → Notify Slack
```

1. Trigger fires when credits are low
2. Automatically purchase credit package via Stripe
3. Send confirmation to Slack

## Development

### Prerequisites

- Node.js v16+
- n8n CLI (for local testing)

### Setup

```bash
# Clone repository
git clone https://github.com/status-check/n8n-nodes-status-check.git
cd n8n-nodes-status-check

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link for local development
npm link
```

### Local Testing

```bash
# In your n8n installation directory
npm link @status-check/n8n-nodes-status-check

# Start n8n
n8n start

# The Status Check nodes should now appear in the node palette
```

### Project Structure

```
n8n-nodes-status-check/
├── credentials/
│   └── StatusCheckApi.credentials.ts    # API authentication
├── nodes/
│   ├── StatusCheck/
│   │   ├── descriptions/
│   │   │   ├── ValidationDescription.ts  # Validation operations
│   │   │   ├── LeadDescription.ts       # Lead operations
│   │   │   └── WebhookDescription.ts    # Webhook operations
│   │   └── StatusCheck.node.ts          # Main node implementation
│   └── StatusCheckTrigger/
│       ├── ValidationCompleteTrigger.node.ts
│       ├── ValidationFailedTrigger.node.ts
│       └── CreditsLowTrigger.node.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Resources

- [Status Check Documentation](https://docs.status-check.io)
- [Status Check API Reference](https://docs.status-check.io/api)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [n8n Creating Nodes Guide](https://docs.n8n.io/integrations/creating-nodes/)

## Support

- **Documentation**: https://docs.status-check.io
- **Email**: support@status-check.io
- **GitHub Issues**: https://github.com/status-check/n8n-nodes-status-check/issues

## License

[MIT](LICENSE.md)

## Version History

### 1.0.0 (2025-01-15)

Initial release with:
- Validation, Lead, and Webhook resources
- 15+ operations across all resources
- 3 webhook triggers for event-driven automation
- Full TypeScript implementation
- Comprehensive error handling
