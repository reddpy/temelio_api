# Temelio Nonprofit API

A backend API for managing nonprofits and sending bulk templated emails to foundations.

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- Node.js 18+ (if using npm/yarn as fallback)

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd temelio-nonprofit-api
```

2. Install dependencies
```bash
bun install
```

## Running the Application

Start the development server:
```bash
bun run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### 1. Create Nonprofit
**POST** `/nonprofit/create`

Create a new nonprofit organization.

```bash
curl -X POST http://localhost:3000/nonprofit/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Red Cross",
    "email": "contact@redcross.org",
    "address": "123 Charity Lane, Washington, DC 20001"
  }'
```

**Response:**
```json
{
  "operation": "create",
  "msg": "success",
  "non_profit": {
    "name": "Red Cross",
    "email": "contact@redcross.org",
    "address": "123 Charity Lane, Washington, DC 20001"
  }
}
```

### 2. Send Bulk Email
**POST** `/email/nonprofit/send/bulk`

Send templated emails to multiple nonprofits.

```bash
curl -X POST http://localhost:3000/email/nonprofit/send/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["contact@redcross.org", "info@salvation-army.org"],
    "email_template": "Sending money to nonprofit {{name}} at address {{address}}",
    "subject": "Grant Distribution Notice",
    "sender": "foundation@example.org"
  }'
```

**Available Template Variables:**
- `{{name}}` - Nonprofit name
- `{{email}}` - Nonprofit email
- `{{address}}` - Nonprofit address
- `{{subject}}` - Email subject
- `{{sender}}` - Sender email

**Response:**
```json
{
  "operation": "send:bulk",
  "msg": "success",
  "recipients": ["contact@redcross.org", "info@salvation-army.org"]
}
```

### 3. Retrieve Emails
**GET** `/email/nonprofit/retrieve/:email`

Get all emails sent to a specific nonprofit.

```bash
curl http://localhost:3000/email/nonprofit/retrieve/contact@redcross.org
```

**Response:**
```json
{
  "operation": "get all emails",
  "msg": "success",
  "query_params": "contact@redcross.org",
  "query_result": [
    {
      "recipient": "contact@redcross.org",
      "sender": "foundation@example.org",
      "subject": "Grant Distribution Notice",
      "template": "Sending money to nonprofit {{name}} at address {{address}}",
      "body": "Sending money to nonprofit Red Cross at address 123 Charity Lane, Washington, DC 20001",
      "timestamp": "2025-07-04T10:30:00.000Z"
    }
  ]
}
```

## Error Responses

### 409 Conflict - Duplicate nonprofit
```json
{
  "operation": "create",
  "msg": "error: duplicate exists",
  "non_profit": { ... }
}
```

### 404 Not Found - Nonprofit doesn't exist
```json
{
  "operation": "send:bulk",
  "msg": "error: recipient(s) not found",
  "recipients": ["nonexistent@example.org"]
}
```

### 400 Bad Request - Missing required fields
```json
{
  "operation": "send:bulk",
  "msg": "error: missing subject"
}
```

## Project Structure

```
├── src/
│   ├── index.ts          # Main application routes
│   ├── email_obj.ts      # Email management class
│   └── nonprofit_obj.ts  # Nonprofit management class
├── package.json
└── README.md
```

## Development

The application uses:
- **Hono** - Fast web framework for the edge
- **Handlebars** - Template engine for email templating
- **TypeScript** - Type-safe JavaScript
- **Bun** - JavaScript runtime and package manager

## Example Workflow

1. Create nonprofits:
```bash
curl -X POST http://localhost:3000/nonprofit/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Red Cross", "email": "contact@redcross.org", "address": "123 Charity Lane"}'
```

2. Send bulk emails:
```bash
curl -X POST http://localhost:3000/email/nonprofit/send/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["contact@redcross.org"],
    "email_template": "Hello {{name}}, grant funds are being sent to {{address}}",
    "subject": "Grant Distribution",
    "sender": "foundation@example.org"
  }'
```

3. Retrieve email history:
```bash
curl http://localhost:3000/email/nonprofit/retrieve/contact@redcross.org
```

## Notes

- All data is stored in-memory and will be lost when the server restarts
- Email sending is mocked - no actual emails are sent
- Email addresses are used as unique identifiers for nonprofits
- Template variables are validated against a predefined list
