# Public Google Sheets Integration Guide

## Overview

This guide demonstrates how to read and analyze Google Sheets using **only public URLs**, without official Google Cloud API authentication, OAuth2 credentials, or Google account logins. The approach leverages Google's public CSV export endpoints and alternative write methods.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLIC ACCESS MODE                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ Public Sheet │    │  CSV Export  │    │  Python Script   │  │
│  │  (GSheets)   │───▶│   Endpoint   │───▶│  (pandas/req)    │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│         │                   │                      │           │
│         │                   │                      ▼           │
│         │                   │              ┌──────────────────┐ │
│         │                   │              │   Local Cache    │ │
│         │                   │              │   /data/*.json   │ │
│         │                   │              └──────────────────┘ │
│         │                   │                      │           │
│         │                   │                      ▼           │
│         │                   │              ┌──────────────────┐ │
│         │                   │              │   Vite/React     │ │
│         │                   │              │   Frontend       │ │
│         │                   │              └──────────────────┘ │
│         │                   │                                    │
│         ▼                   ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Sheet Sharing Settings:                                  │   │
│  │  - "Anyone with the link can view"                       │   │
│  │  - No sign-in required                                   │   │
│  │  - Public CSV export enabled                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Methods for Reading Public Sheets

### Method 1: CSV Export via `gviz/tq` endpoint (Recommended)

**URL Pattern:**
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet={SHEET_NAME}
```

**Advantages:**
- Returns proper CSV with headers
- Supports sheet selection via `sheet` parameter
- Handles special characters and quoting correctly
- No authentication required

**Limitations:**
- Requires sheet to be published or shared publicly
- Rate limited by Google (approx. 100-300 req/min per IP)
- Returns data in sheet order, not array formulas evaluated
- Large sheets (>10MB) may timeout

### Method 2: CSV Export via `export` endpoint

**URL Pattern:**
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv&id={SPREADSHEET_ID}&gid={SHEET_GID}
```

**Advantages:**
- Uses gid for sheet selection
- Supports additional formats: `xlsx`, `ods`, `pdf`, `html`

**Limitations:**
- Requires knowing the sheet's gid (numeric ID)
- gid is not always predictable for new sheets
- Less reliable than Method 1

### Method 3: JSON via `gviz/tq` endpoint

**URL Pattern:**
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet={SHEET_NAME}
```

**Advantages:**
- Returns structured data with column types
- Includes row/column metadata

**Limitations:**
- Wrapped in `/*O_o*/` prefix and may have trailing garbage
- Requires additional parsing
- Less reliable than CSV

## Methods for Writing to Public Sheets Without Authentication

### Critical Analysis: Why Writing Is Fundamentally Limited

**Google Sheets' security model requires authentication for write operations.** There is no official, supported way to write to a Google Sheet without:
1. OAuth2 credentials
2. Service account keys
3. Google account login

### Alternative Write Methods (Workarounds)

#### 1. Google Apps Script Web App (Most Viable)

**How it works:**
1. Create a Google Apps Script bound to the sheet
2. Deploy as "Web app" with "Anyone, even anonymous" access
3. Expose HTTP endpoints (doGet/doPost) that call `SpreadsheetApp` methods

**Example Apps Script:**
```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([data.name, data.email, data.timestamp]);
  return ContentService.createTextOutput(JSON.stringify({status: 'success'}));
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status: 'ready'}));
}
```

**Deploy settings:**
- Execute as: `Me`
- Who has access: `Anyone, even anonymous`

**Limitations:**
- Requires one-time setup in Google Apps Script editor
- Web app URL must be kept secret (use as API endpoint)
- Subject to Google Apps Script quotas:
  - 20,000 requests/day (consumer accounts)
  - 100,000 requests/day (Google Workspace)
  - 30-second execution timeout per request
- Can be disabled by sheet owner
- Not suitable for high-volume write operations

**Security Implications:**
- The web app URL is effectively an API key — anyone with it can write
- No built-in rate limiting or auth
- Data validation must be implemented in the script
- Vulnerable to spam/abuse if URL leaks

#### 2. Google Forms Integration

**How it works:**
1. Create a Google Form linked to the sheet
2. Submit form data via POST request to form's action URL
3. Form responses automatically populate the sheet

**Advantages:**
- No code required in Google Apps Script
- Built-in response validation
- Google handles authentication

**Limitations:**
- Only appends rows, cannot update existing data
- Form fields are fixed — cannot add columns dynamically
- Requires form setup for each sheet
- Limited to ~1,000 responses/day for free accounts
- Responses include timestamp and cannot be customized

**Security Implications:**
- Form URLs are public by design
- Anyone with the form URL can submit data
- CAPcha protection is limited
- No server-side validation beyond Google's built-in checks

#### 3. Third-Party API Services

**Services:** Sheet.best, Apipheny, Integromat, Zapier, Make.com

**How it works:**
1. Connect Google Sheet to third-party service via OAuth
2. Service provides REST API endpoints
3. Send authenticated requests to service

**Limitations:**
- Requires initial OAuth setup (one-time)
- Subject to third-party service limits/uptime
- May have costs for high volume
- Data passes through third-party servers

**Security Implications:**
- Trusts third-party with data access
- Additional attack surface
- Service terms may change or shut down

## Security Implications Summary

| Method | Auth Required | Rate Limit | Data Exposure | Use Case |
|--------|--------------|------------|---------------|----------|
| Public CSV export | None | ~100-300/min | Read-only public data | Dashboard, reporting |
| Apps Script Web App | One-time deploy | 20K-100K/day | Write endpoint is public API key | Low-volume write |
| Google Forms | None | ~1K/day | Public submission endpoint | Surveys, simple collection |
| Third-party API | OAuth (one-time) | Service-dependent | Data passes through 3rd party | Production integration |

## Error Handling Strategy

### Network Errors
- Connection timeouts
- HTTP 429 (rate limit)
- HTTP 403 (sheet not public)
- HTTP 404 (invalid sheet ID)

### Data Parsing Errors
- Empty sheets
- Malformed CSV
- Type mismatches
- Missing columns
- Encoding issues (UTF-8 vs Latin-1)

### Retry Strategy
- Exponential backoff: 1s, 2s, 4s, 8s
- Max 3 retries
- Circuit breaker for sustained failures

## Directory Structure

```
songshub/
├── .github/
│   ├── workflows/
│   │   └── sync-public-sheet.yml    # GitHub Actions workflow
│   ├── scripts/
│   │   ├── read_public_sheet.py     # Main reader script
│   │   ├── write_public_sheet.py    # Write attempt via Apps Script
│   │   └── requirements.txt          # Python dependencies
│   └── config/
│       └── sheet_config.json         # Sheet IDs and settings
├── docs/
│   ├── PUBLIC_SHEET_GUIDE.md         # This guide
│   └── ARCHITECTURE.md
├── src/
│   ├── data/
│   │   └── content.js                # Generated local cache
│   └── lib/
│       └── sync.ts
└── package.json
```
