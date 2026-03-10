# trigify-cli

CLI and MCP server for the [Trigify.io](https://trigify.io) social listening and signal intelligence platform. Monitor LinkedIn, Twitter, Reddit, YouTube, and Podcasts for keyword mentions, track profile engagement, and query the engagement graph with firmographic filters.

Agent-native: every CLI command is also an MCP tool for use with Claude, Cursor, and other AI agents.

## Installation

```bash
npm install -g trigify-cli
```

Or run without installing:
```bash
npx trigify-cli --help
```

## Authentication

Three methods, in priority order:

**1. Flag (highest priority)**
```bash
trigify --api-key <your-key> searches list
```

**2. Environment variable**
```bash
export TRIGIFY_API_KEY=your-api-key
trigify searches list
```

**3. Stored config (recommended)**
```bash
trigify login
# Saves to ~/.trigify/config.json
```

Get your API key at: https://app.trigify.io/settings

## Quick Start

```bash
# Authenticate
trigify login --api-key <your-key>

# List your searches
trigify searches list --pretty

# Create a new search (1 credit)
trigify searches create --name "AI mentions" --keywords "AI,LLM,machine learning"

# Get search results
trigify searches results <id> --platform linkedin --pretty

# Create a Social Topic for LinkedIn engagement tracking
trigify topics create --name "GTM keywords" --keywords "outbound,cold email,SDR"

# Get topic engagers
trigify topics engagements <id> --pretty

# Find ICP engagers via Social Mapping
trigify social mapping --keywords "AI tools" --company-size "51-200" --seniority "VP,Director" --pretty

# Get a profile's recent LinkedIn posts
trigify profiles posts --url "https://www.linkedin.com/in/username" --limit 10 --pretty

# Get engagements on a LinkedIn post
trigify posts engagements --url "https://www.linkedin.com/feed/update/urn:li:activity:123" --pretty
```

## Commands

### Authentication
```bash
trigify login [--api-key <key>]    # Store API key
trigify logout                      # Remove stored key
```

### searches — Social Listening (Standard)
```bash
trigify searches list [--page] [--page-size]
trigify searches get <id>
trigify searches create --name <name> --keywords <kw> [--platforms] [--exclude-keywords]
trigify searches update <id> [--name] [--keywords] [--status] [--platforms]
trigify searches delete <id>
trigify searches results <id> [--limit] [--cursor] [--platform] [--start-date] [--end-date]
```

### topics — Social Topics (Enterprise)
```bash
trigify topics list [--page] [--page-size]
trigify topics get <id>
trigify topics create --name <name> --keywords <kw> [--exclude]
trigify topics update <id> [--name] [--status active|paused]
trigify topics delete <id>
trigify topics engagements <id> [--page] [--page-size]
trigify topics post-engagements <topicId> <postId> [--page] [--page-size]
trigify topics credits-summary <id>
```

### profiles — Profile Data & Engagement Tracking (Enterprise)
```bash
trigify profiles posts --url <linkedin-url> [--urn] [--limit]
trigify profiles enrich --url <linkedin-url>
trigify profiles engagement-bulk --profiles <urns> [--tag]
trigify profiles engagement-results [--urn] [--tag] [--page] [--page-size]
trigify profiles engagement-post-results [--urn] [--tag] [--page] [--page-size]
trigify profiles engagement-remove --urn <urn>
```

### posts — Post Data (Enterprise)
```bash
trigify posts engagements --url <post-url> [--urn] [--limit] [--cursor]
trigify posts comments --url <post-url> [--urn] [--limit] [--cursor]
trigify posts comment-replies --post-urn <urn> --comment-urn <urn> [--limit] [--cursor]
```

### social — Social Mapping (Enterprise)
```bash
trigify social mapping --keywords <kw> [--company-size] [--industry] [--job-title] [--seniority] [--location] [--limit] [--cursor]
```

### enrich — Enrichment Helpers
```bash
trigify enrich company --url <linkedin-company-url>
```

## Output Options

```bash
# Compact JSON (default — machine-readable, pipe-friendly)
trigify searches list | jq '.[].name'

# Pretty-printed (human-readable)
trigify searches list --pretty

# Select specific fields
trigify searches list --fields "id,name,status"

# Quiet mode (exit code only)
trigify searches delete abc123 --quiet && echo "Deleted"
```

## MCP Server (AI Agent Integration)

Every CLI command is automatically available as an MCP tool.

```bash
trigify mcp
```

**Claude Desktop** (`~/.claude/claude_desktop_config.json`):
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

**Cursor** (`~/.cursor/mcp.json`):
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

Once connected, agents can use all 25 tools: `searches_list`, `searches_create`, `topics_create`, `social_mapping`, etc. See [AGENTS.md](AGENTS.md) for the full tool reference.

## API Rate Limits & Credits

- **Rate limit**: 100 requests per 60-second window (auto-retried with backoff)
- **Social Listening**: 1 credit to create a search
- **Profile Posts**: 1 credit per post (max 50/request)
- **Post Engagements/Comments/Replies**: 1 credit per result
- **Social Topics**: 1 credit/new post, 5 credits/new engagement
- **Social Mapping**: credits per result

## Architecture

```
src/
├── index.ts              # CLI entry point
├── mcp.ts                # MCP server entry point
├── core/
│   ├── types.ts          # CommandDefinition + TrigifyClient interfaces
│   ├── client.ts         # HTTP client (x-api-key auth, retry, timeout)
│   ├── config.ts         # ~/.trigify/config.json management
│   ├── auth.ts           # API key resolution (flag > env > config)
│   ├── errors.ts         # Typed error classes
│   ├── output.ts         # JSON output formatting
│   └── handler.ts        # HTTP request builder from CommandDefinition
├── commands/
│   ├── index.ts          # Command registry (CLI + MCP source of truth)
│   ├── auth/             # login, logout
│   ├── searches/         # list, get, create, update, delete, results
│   ├── topics/           # list, get, create, update, delete, engagements, post-engagements, credits-summary
│   ├── profiles/         # posts, enrich, engagement-bulk, engagement-results, engagement-post-results, engagement-remove
│   ├── posts/            # engagements, comments, comment-replies
│   ├── social/           # mapping
│   ├── enrich/           # company
│   └── mcp/              # MCP server command
└── mcp/
    └── server.ts         # MCP server (auto-registers all CommandDefinitions as tools)
```

## Development

```bash
git clone https://github.com/bcharleson/trigify-cli
cd trigify-cli
npm install
npm run dev -- searches list --pretty     # Run without building
npm run build                              # Build to dist/
npm run typecheck                          # Type-check only
```

## License

MIT
