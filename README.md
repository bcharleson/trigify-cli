# trigify-cli

> **Agentic Social Listening For Modern B2B Teams**

CLI and MCP server for the [Trigify.io](https://trigify.io) social listening and signal intelligence platform. Transform raw social mentions into signal-led intelligence — monitor LinkedIn, Twitter, Reddit, YouTube, and Podcasts for keyword mentions, track who engages with specific content, and map the engagement graph with firmographic ICP filters.

**Agent-native**: every CLI command is simultaneously an MCP tool for Claude, Cursor, and any MCP-compatible AI agent.

[![npm version](https://img.shields.io/npm/v/trigify-cli)](https://www.npmjs.com/package/trigify-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What Trigify Is For

Trigify gives B2B teams three distinct data layers:

| Layer | What you get | Best for |
|-------|-------------|----------|
| **Social Mentions** | Posts matching keywords across all platforms | Brand monitoring, competitor intel, market research |
| **Engagement Intelligence** | *Who* engaged with LinkedIn content matching keywords | Intent-based prospecting, ICP audience building |
| **Profile Intel** | A specific person's posts + who reacted/commented | Account research, buying signal tracking |

**The core use cases:**
- **Sales**: Find people actively signaling buying intent → route to outbound sequences in <60 seconds
- **Marketing**: Monitor brand health, competitor launches, sentiment shifts across all social channels
- **Product**: Surface real feature requests and pain points from live user conversations
- **RevOps**: Track target accounts for signals that trigger automated GTM plays

---

## Installation

```bash
# Install globally
npm install -g trigify-cli

# Or run without installing
npx trigify-cli --help
```

Requires Node.js 18+.

---

## Authentication

Three methods, in priority order:

**1. Store credentials (recommended)**
```bash
trigify login --api-key <your-api-key>
# Saves securely to ~/.trigify/config.json
```

**2. Environment variable (CI/scripts/MCP configs)**
```bash
export TRIGIFY_API_KEY=your-api-key
trigify searches list
```

**3. Per-command flag**
```bash
trigify --api-key <your-api-key> searches list
```

Get your API key: https://app.trigify.io/settings

---

## Quick Start

```bash
# Authenticate
trigify login --api-key <your-key>

# ── Social Listening (Standard) ──────────────────────────────────────────────

# Monitor brand/competitor mentions across all platforms (1 credit to create)
trigify searches create \
  --name "Brand: MyCompany" \
  --keywords "MyCompany,MyCompany.io" \
  --platforms "linkedin,twitter,reddit"

# Get results (always free, cursor-paginated)
trigify searches results <id> --platform linkedin --limit 50 --pretty

# ── Topic Intelligence (Enterprise) ─────────────────────────────────────────

# Find people engaging with your pain-point keywords on LinkedIn
trigify topics create \
  --name "Intent: outbound pain" \
  --keywords "cold email not working,outbound ROI,SDR quota" \
  --exclude "job,hiring"

# Check how much data has collected
trigify topics get <id> --pretty

# Pull deduplicated engagers (free after data collects)
trigify topics engagements <id> --page-size 100 --pretty

# ── ICP Prospecting (Enterprise) ─────────────────────────────────────────────

# Find VP Sales at mid-market SaaS companies engaging with outbound content
trigify social mapping \
  --keywords "outbound sales,cold email,SDR" \
  --seniority "VP,Director" \
  --company-size "51-200" \
  --industry "SaaS" \
  --limit 50 \
  --pretty

# ── Profile Research (Enterprise) ────────────────────────────────────────────

# Get a prospect's recent LinkedIn posts
trigify profiles posts --url "https://www.linkedin.com/in/johndoe" --limit 10 --pretty

# Get everyone who engaged with a specific post
trigify posts engagements \
  --url "https://www.linkedin.com/feed/update/urn:li:activity:123456789" \
  --limit 25 \
  --pretty
```

---

## All Commands

### Authentication
```
trigify login [--api-key <key>]    Store API key (~/.trigify/config.json)
trigify logout                      Remove stored credentials
trigify mcp                         Start MCP server for AI agents
```

### searches — Social Listening (Standard Tier)
Monitor keyword mentions across LinkedIn, Twitter, Reddit, YouTube, Podcasts.
Returns **content/posts**. Create once, read results for free indefinitely.

```
trigify searches create     --name <n> --keywords <kw> [--platforms] [--exclude-keywords]
trigify searches list       [--page] [--page-size]
trigify searches get        <id>
trigify searches update     <id> [--name] [--keywords] [--status active|paused] [--platforms] [--exclude-keywords]
trigify searches delete     <id>
trigify searches results    <id> [--limit] [--cursor] [--platform] [--start-date] [--end-date]
```

### topics — Social Topics (Enterprise Tier)
LinkedIn-only. Returns **people** who engaged with content matching keywords.
Engagement backfill: Day 1, Day 3, Day 5. Topics expire after 30 days.

```
trigify topics create              --name <n> --keywords <kw> [--exclude]
trigify topics list                [--page] [--page-size]
trigify topics get                 <id>
trigify topics update              <id> [--name] [--status active|paused]
trigify topics delete              <id>
trigify topics engagements         <id> [--page] [--page-size]
trigify topics post-engagements    <topicId> <postId> [--page] [--page-size]
trigify topics credits-summary     <id>
```

### profiles — Profile Data & Engagement Tracking (Enterprise Tier)
Pull what specific people are posting and track them for ongoing signals.

```
trigify profiles enrich                --url <linkedin-url>
trigify profiles posts                 --url <url> | --urn <urn>  [--limit (max 50)]
trigify profiles engagement-bulk       --profiles <urns> [--tag]
trigify profiles engagement-results    [--urn] [--tag] [--page] [--page-size]
trigify profiles engagement-post-results  [--urn] [--tag] [--page] [--page-size]
trigify profiles engagement-remove     --urn <urn>
```

### posts — Post-Level Data (Enterprise Tier)
Deep-dive into a specific LinkedIn post's engagement and discussion.

```
trigify posts engagements       --url <url> | --urn <urn>  [--limit] [--cursor]
trigify posts comments          --url <url> | --urn <urn>  [--limit] [--cursor]
trigify posts comment-replies   --post-urn <urn> --comment-urn <urn>  [--limit] [--cursor]
```

### social — Social Mapping (Enterprise Tier)
Query the engagement graph with firmographic ICP filters.

```
trigify social mapping  --keywords <kw> [--company-size] [--industry] [--job-title] [--seniority] [--location] [--limit] [--cursor] [--exclude]
```

**Company size values:** `"1-10"` `"11-50"` `"51-200"` `"201-500"` `"501-1000"` `"1001-5000"` `"5001-10000"` `"10001+"`

### enrich — Enrichment Helpers
```
trigify enrich company   --url <linkedin-company-url>
```

---

## Output Options

```bash
# Compact JSON (default — pipe-friendly)
trigify topics engagements <id> | jq '.data[] | {name, company, engagement_count}'

# Pretty-printed (human-readable)
trigify social mapping --keywords "outbound" --pretty

# Specific fields only
trigify topics engagements <id> --fields "name,headline,company,engagement_count"

# Quiet mode (exit code only — for scripts)
trigify searches delete <id> --quiet && echo "Deleted"
```

---

## Rate Limits & Credits

**Rate limit**: 100 requests / 60-second window. The CLI auto-retries 429 errors with exponential backoff.

**Credit model** — pay-as-you-go, only charged on data extraction:

| Operation | Cost |
|-----------|------|
| Create a search | 1 credit |
| Profile posts | 1 credit/post (max 50/call) |
| Post engagements | 1 credit/engager |
| Post comments | 1 credit/comment |
| Comment replies | 1 credit/reply |
| Social Topics | 1 credit/new post + 5 credits/new engagement |
| Social Mapping | Credits per result |
| All list/read/CRUD operations | **Free** |
| Profile engagement bulk upload | **Free** (deferred) |

**Tips:**
- Use `--limit` on first calls to sample before expanding
- Call `topics_credits_summary` before pulling large datasets
- `topics_engagements` is free — data cost was at collection time
- `searches_results` is always free — create once, poll forever

---

## Workflow Examples

### Intent-Based Prospecting
Find people actively signaling pain your product solves:
```bash
# 1. Create intent topic (Day 1/3/5 backfill, 30-day window)
trigify topics create \
  --name "Intent: [your pain point]" \
  --keywords "pain keyword 1,pain keyword 2,problem statement" \
  --exclude "hiring,job"

# 2. Wait for data (poll until engagements_found > 0)
trigify topics get <id> --fields "posts_found,engagements_found"

# 3. Pull all engagers (free — deduplicated)
trigify topics engagements <id> --page-size 100 --pretty

# 4. Filter by ICP criteria
trigify social mapping \
  --keywords "pain keyword 1,pain keyword 2" \
  --seniority "VP,Director" \
  --company-size "51-200" \
  --limit 50
```

### Competitor Audience Capture
```bash
# Create multi-platform search for brand mentions
trigify searches create \
  --name "Comp: [CompetitorName]" \
  --keywords "[CompetitorName] alternative,switching from [CompetitorName],[CompetitorName] problems" \
  --platforms "linkedin,twitter,reddit"

# Create LinkedIn topic to capture engagers
trigify topics create \
  --name "Comp: [CompetitorName] LinkedIn" \
  --keywords "[CompetitorName],[CompetitorName] users" \
  --exclude "hiring,job"

# Get competitors' audience with ICP filter
trigify social mapping \
  --keywords "[CompetitorName]" \
  --seniority "VP,Director,Manager" \
  --company-size "51-200,201-500" \
  --limit 50
```

### ABM Account Tracking
```bash
# Enrich and bulk-upload champion contacts
trigify profiles enrich --url "https://linkedin.com/in/champion-name"
trigify profiles engagement-bulk \
  --profiles "urn:li:member:12345678" \
  --tag "target-acme-q1"

# Monitor for buying signals
trigify profiles engagement-post-results --tag "target-acme-q1" --pretty

# Research their recent posts
trigify profiles posts --urn "urn:li:member:12345678" --limit 5 --pretty
```

### Viral Post Intelligence
```bash
# Get all engagers (paginate fully)
trigify posts engagements --url "<post_url>" --limit 100

# Get comments + top replies
trigify posts comments --urn "<post_urn>" --limit 50 --pretty
trigify posts comment-replies \
  --post-urn "<post_urn>" \
  --comment-urn "<comment_urn>" \
  --limit 20
```

---

## MCP Server — AI Agent Integration

Every CLI command is automatically available as an MCP tool. Start the server once and all 25 tools are live.

```bash
trigify mcp
```

### Claude Desktop

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "trigify": {
      "command": "node",
      "args": ["/absolute/path/to/node_modules/.bin/trigify", "mcp"],
      "env": {
        "TRIGIFY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Or via npx (no install required):
```json
{
  "mcpServers": {
    "trigify": {
      "command": "npx",
      "args": ["trigify-cli", "mcp"],
      "env": {
        "TRIGIFY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "trigify": {
      "command": "npx",
      "args": ["trigify-cli", "mcp"],
      "env": {
        "TRIGIFY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Windsurf / Other MCP Clients

```json
{
  "mcpServers": {
    "trigify": {
      "command": "npx",
      "args": ["trigify-cli", "mcp"],
      "env": {
        "TRIGIFY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Once connected, your AI agent has access to all 25 Trigify tools:
`searches_create`, `searches_results`, `topics_create`, `topics_engagements`, `social_mapping`, `profiles_posts`, `posts_engagements`, and more. See [AGENTS.md](AGENTS.md) for the complete tool reference with workflow playbooks.

---

## Integrations

Trigify data pairs naturally with:

| Tool | Use Case |
|------|---------|
| **Clay** | Enrich Trigify people (URN/profile_url) with email, phone, full firmographics |
| **Instantly / Smartlead** | Sequence Trigify prospects via email |
| **HeyReach / La Growth Machine** | LinkedIn outreach to Trigify prospects |
| **HubSpot / Salesforce** | Log signals as CRM activities, create contacts |
| **Slack** | Alert teams on high-intent signals in real time |
| **Outreach / Salesloft** | Add to cadences triggered by Trigify signals |
| **Notion / Airtable** | Build signal dashboards and research databases |

**Example: Trigify → Clay → Instantly pipeline**
```bash
# 1. Export ICP-matched prospects from Trigify
trigify social mapping \
  --keywords "outbound sales" \
  --seniority "VP,Director" \
  --company-size "51-200" \
  --limit 100 \
  --fields "name,headline,profile_url,company,urn"

# 2. Pass profile_url column to Clay for email enrichment
# 3. Pass enriched CSV to Instantly for sequencing
```

---

## Architecture

```
src/
├── index.ts              # CLI entry point (trigify binary)
├── mcp.ts                # MCP server entry point (trigify mcp)
├── core/
│   ├── types.ts          # CommandDefinition + TrigifyClient interfaces
│   ├── client.ts         # HTTP client (x-api-key auth, retry, timeout, backoff)
│   ├── config.ts         # ~/.trigify/config.json management
│   ├── auth.ts           # Key resolution: flag > env > config
│   ├── errors.ts         # Typed error classes (AuthError, RateLimitError, etc.)
│   ├── output.ts         # JSON formatting (--pretty, --fields, --quiet)
│   └── handler.ts        # HTTP request builder from CommandDefinition
├── commands/
│   ├── index.ts          # Single source of truth — all commands registered here
│   ├── auth/             # login, logout
│   ├── searches/         # list, get, create, update, delete, results
│   ├── topics/           # list, get, create, update, delete, engagements,
│   │                     #   post-engagements, credits-summary
│   ├── profiles/         # posts, enrich, engagement-bulk, engagement-results,
│   │                     #   engagement-post-results, engagement-remove
│   ├── posts/            # engagements, comments, comment-replies
│   ├── social/           # mapping
│   ├── enrich/           # company
│   └── mcp/              # mcp server command
└── mcp/
    └── server.ts         # Auto-registers all CommandDefinitions as MCP tools
```

**Design principle:** Each `CommandDefinition` drives both the CLI command and the MCP tool — zero duplication, single source of truth.

---

## Development

```bash
git clone https://github.com/bcharleson/trigify-cli
cd trigify-cli
npm install

# Run without building (development)
npm run dev -- searches list --pretty
npm run dev -- social mapping --keywords "AI tools" --pretty

# Build to dist/
npm run build

# Type-check only
npm run typecheck
```

---

## API Coverage

All 25 known Trigify API endpoints are implemented (21 documented + 2 undocumented enrichment helpers):

| Endpoint | Method | CLI Command |
|----------|--------|-------------|
| `/v1/searches` | POST | `searches create` |
| `/v1/searches` | GET | `searches list` |
| `/v1/searches/{id}` | GET | `searches get` |
| `/v1/searches/{id}` | PATCH | `searches update` |
| `/v1/searches/{id}` | DELETE | `searches delete` |
| `/v1/searches/{id}/results` | GET | `searches results` |
| `/v1/topics` | POST | `topics create` |
| `/v1/topics` | GET | `topics list` |
| `/v1/topics/{id}` | GET | `topics get` |
| `/v1/topics/{id}` | PATCH | `topics update` |
| `/v1/topics/{id}` | DELETE | `topics delete` |
| `/v1/topics/{id}/engagements` | GET | `topics engagements` |
| `/v1/topics/{id}/posts/{postId}/engagements` | GET | `topics post-engagements` |
| `/v1/topics/{id}/credits-summary` | GET | `topics credits-summary` |
| `/v1/profile/posts` | POST | `profiles posts` |
| `/v1/profile/enrich` | POST | `profiles enrich` |
| `/v1/profile/engagement/bulk` | POST | `profiles engagement-bulk` |
| `/v1/profile/engagement/results` | POST | `profiles engagement-results` |
| `/v1/profile/engagement/post-results` | POST | `profiles engagement-post-results` |
| `/v1/profile/engagement/remove` | POST | `profiles engagement-remove` |
| `/v1/post/engagements` | POST | `posts engagements` |
| `/v1/post/comments` | POST | `posts comments` |
| `/v1/post/comments/replies` | POST | `posts comment-replies` |
| `/v1/social/mapping` | POST | `social mapping` |
| `/v1/company/enrich` | POST | `enrich company` |

---

## Links

- **npm**: https://www.npmjs.com/package/trigify-cli
- **GitHub**: https://github.com/bcharleson/trigify-cli
- **Trigify Platform**: https://trigify.io
- **API Docs**: https://docs.trigify.io
- **Agent Reference**: [AGENTS.md](AGENTS.md)

---

## License

MIT
