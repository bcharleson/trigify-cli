# Trigify CLI — Agent & Human Reference

> **For AI agents**: Read this document in full before calling any Trigify tools. It explains when to use each tool, how to chain them, and how to avoid wasting credits.

Trigify.io is a social listening and signal intelligence platform. It monitors LinkedIn, Twitter, Reddit, YouTube, and Podcasts for keyword mentions, tracks who engages with specific LinkedIn content, and lets you query the engagement graph with firmographic filters (ICP matching).

---

## Quick Decision Guide — Which Tool to Use?

| Goal | Best Tool(s) |
|------|-------------|
| Monitor brand/keyword mentions across social | `searches_create` → `searches_results` |
| Find people engaging with LinkedIn topics (ICP signal) | `topics_create` → `topics_engagements` |
| Track specific profiles and what they're posting | `profiles_engagement_bulk` → `profiles_engagement_results` |
| Scrape posts from a known LinkedIn profile | `profiles_enrich` → `profiles_posts` |
| Get engagers from a specific LinkedIn post | `posts_engagements` |
| Build a list of ICP people from keyword engagement | `social_mapping` |
| Go deep on a specific post's comments | `posts_comments` → `posts_comment_replies` |
| Enrich a company URL to get firmographic ID | `enrich_company` |

**Key distinction:**
- **`searches`** = broad social monitoring (multi-platform, keyword-level, returns posts/mentions)
- **`topics`** = LinkedIn-only, returns the *people* who engaged (engager intelligence)
- **`social mapping`** = query the engagement graph directly with ICP filters (most targeted)

---

## Authentication

Three methods, in priority order:

1. **Flag**: `--api-key <key>` (highest priority)
2. **Environment variable**: `TRIGIFY_API_KEY=<key>`
3. **Stored config**: `trigify login` (saves to `~/.trigify/config.json`)

```bash
trigify login --api-key <your-key>   # Store once
trigify searches list                 # Works automatically after login
```

Get your API key at: https://app.trigify.io/settings

---

## Rate Limits & Credit Costs

**Rate limit**: 100 requests per 60-second fixed window. The CLI automatically retries 429s with exponential backoff — agents do not need to implement retry logic.

**Credit costs** (only charged on data retrieval, not reads):

| Operation | Credits | Notes |
|-----------|---------|-------|
| `searches_create` | 1 | One-time cost to create |
| `profiles_posts` | 1 per post | Max 50 posts per call |
| `posts_engagements` | 1 per engager | Use `--limit` to control |
| `posts_comments` | 1 per comment | Use `--limit` to control |
| `posts_comment_replies` | 1 per reply | Use `--limit` to control |
| `topics_create` | 0 upfront | 1/new post + 5/new engagement as data arrives |
| `social_mapping` | varies | Per result returned |
| All GET/list/results calls | 0 | Free to read existing data |
| All topic/search management | 0 | CRUD ops are free |
| `profiles_engagement_bulk` | 0 | Free to upload; charged when data collects |

**Credit optimization tips for agents:**
- Always use `--limit` to cap credit-bearing calls before you know result quality
- `topics_engagements` is free to read after the topic has collected data
- `searches_results` is free — create once, read many times
- Check `topics_credits_summary` before pulling large datasets

---

## All 25 MCP Tools + CLI Commands

### Authentication

#### `trigify login` / `trigify logout`
```bash
trigify login --api-key <key>   # Store credentials
trigify logout                   # Remove credentials
```

---

### GROUP: searches — Social Listening (Standard tier)

Monitor keyword mentions across **LinkedIn, Twitter, Reddit, YouTube, Podcasts**.
Returns posts/mentions. Create once, poll results for free.

---

#### `searches_create` — Create a search
```bash
trigify searches create --name "AI tools buzz" --keywords "AI tools,LLM,Claude"
trigify searches create --name "Brand" --keywords "Trigify" --platforms "linkedin,twitter"
trigify searches create --name "Market signal" --keywords "outbound sales" --exclude-keywords "job posting,hiring,apply"
```
**Options:** `--name` (required), `--keywords` (required), `--platforms`, `--exclude-keywords`
**Cost:** 1 credit

---

#### `searches_list` — List all searches
```bash
trigify searches list
trigify searches list --pretty
trigify searches list --fields "id,name,status"
trigify searches list --page 2 --page-size 20
```
**Cost:** Free

---

#### `searches_get` — Get search details
```bash
trigify searches get <id>
trigify searches get <id> --pretty
```
**Cost:** Free

---

#### `searches_update` — Update a search
```bash
trigify searches update <id> --name "New name"
trigify searches update <id> --status paused
trigify searches update <id> --keywords "updated,keywords"
trigify searches update <id> --exclude-keywords "spam,jobs"
```
**Options:** `--name`, `--keywords`, `--platforms`, `--status` (active|paused), `--exclude-keywords`
**Cost:** Free

---

#### `searches_delete` — Delete a search
```bash
trigify searches delete <id>
trigify searches delete <id> --quiet
```
**Cost:** Free

---

#### `searches_results` — Get results/mentions for a search
```bash
trigify searches results <id>
trigify searches results <id> --limit 50 --pretty
trigify searches results <id> --platform linkedin
trigify searches results <id> --cursor "nextcursortoken"   # Paginate
trigify searches results <id> --start-date 2025-01-01 --end-date 2025-03-01
```
**Options:** `--limit`, `--cursor`, `--platform` (linkedin|twitter|reddit|youtube|podcasts), `--start-date`, `--end-date`
**Cost:** Free

**Response shape (array of mentions):**
```json
{
  "data": [
    {
      "id": "mention_id",
      "platform": "linkedin",
      "url": "https://linkedin.com/...",
      "content": "Post text here...",
      "author": { "name": "John Doe", "url": "https://linkedin.com/in/johndoe" },
      "published_at": "2025-03-01T12:00:00Z",
      "engagement": { "likes": 42, "comments": 7 }
    }
  ],
  "next_cursor": "cursor_for_next_page"
}
```

---

### GROUP: topics — Social Topics (Enterprise tier)

LinkedIn-only. Returns **who engaged** (people), not just posts. Backfill runs Day 1, Day 3, Day 5 after creation. Topics auto-expire after 30 days.

**Agent guidance:** Create a topic, wait for data to collect (check `topics_get` to see post/engagement counts), then call `topics_engagements` to get the people.

---

#### `topics_create` — Create a topic
```bash
trigify topics create --name "GTM signals" --keywords "outbound,cold email,SDR,AE"
trigify topics create --name "Competitor watch" --keywords "HubSpot,Salesforce" --exclude "job,hiring,career"
trigify topics create --name "ICP content" --keywords "RevOps,revenue operations,GTM"
```
**Options:** `--name` (required), `--keywords` (required), `--exclude`
**Cost:** 0 upfront. 1 credit/new post found, 5 credits/new engagement found as data collects.

---

#### `topics_list` — List all topics
```bash
trigify topics list
trigify topics list --page 2 --page-size 20
```
**Cost:** Free

---

#### `topics_get` — Get topic details and status
```bash
trigify topics get <id>
trigify topics get <id> --pretty
```
**Cost:** Free
**Agent use:** Poll this to know when a topic has collected data before calling `topics_engagements`.

**Response shape:**
```json
{
  "id": "topic_id",
  "name": "GTM signals",
  "keywords": ["outbound", "cold email"],
  "status": "active",
  "posts_found": 847,
  "engagements_found": 3241,
  "created_at": "2025-03-01T00:00:00Z",
  "expires_at": "2025-03-31T00:00:00Z"
}
```

---

#### `topics_update` — Update topic name or status
```bash
trigify topics update <id> --status paused
trigify topics update <id> --status active
trigify topics update <id> --name "New topic name"
```
**Options:** `--name`, `--status` (active|paused)
**Cost:** Free

---

#### `topics_delete` — Soft-delete a topic
```bash
trigify topics delete <id>
```
Stops monitoring. Historical data is retained.
**Cost:** Free

---

#### `topics_engagements` — Get deduplicated engagers for a topic
```bash
trigify topics engagements <id>
trigify topics engagements <id> --pretty
trigify topics engagements <id> --page 2 --page-size 100
```
**Options:** `--page`, `--page-size`
**Cost:** Free (data was charged when collected)

**Response shape (deduplicated people who engaged):**
```json
{
  "data": [
    {
      "urn": "urn:li:member:12345678",
      "name": "Jane Smith",
      "headline": "VP of Sales at Acme Corp",
      "profile_url": "https://linkedin.com/in/janesmith",
      "company": "Acme Corp",
      "engagement_count": 3,
      "last_engaged_at": "2025-03-05T10:00:00Z"
    }
  ],
  "total": 3241,
  "page": 1,
  "page_size": 50
}
```

---

#### `topics_post_engagements` — Get engagers for a specific post in a topic
```bash
trigify topics post-engagements <topicId> <postId>
trigify topics post-engagements abc123 post456 --pretty
```
**Cost:** Free
**Agent use:** First call `topics_engagements` to find high-engagement posts, then drill into a specific post.

---

#### `topics_credits_summary` — Get credit usage breakdown
```bash
trigify topics credits-summary <id>
trigify topics credits-summary <id> --pretty
```
**Cost:** Free
**Agent use:** Call before pulling data to estimate remaining cost.

**Response shape:**
```json
{
  "topic_id": "abc123",
  "posts_found": 847,
  "engagements_found": 3241,
  "credits_consumed": 847,
  "credits_from_engagements": 16205,
  "total_credits": 17052
}
```

---

### GROUP: profiles — Profile Data & Engagement Tracking (Enterprise tier)

---

#### `profiles_enrich` — Enrich a LinkedIn profile URL → get URN
```bash
trigify profiles enrich --url "https://www.linkedin.com/in/johndoe"
```
**Agent use:** Call this first when you have a LinkedIn URL but need the URN (e.g., before calling `profiles_posts` with `--urn` or bulk-uploading to tracking).
**Cost:** Unknown (undocumented endpoint)

**Response shape:**
```json
{
  "urn": "urn:li:member:12345678",
  "name": "John Doe",
  "headline": "CEO at Acme",
  "profile_url": "https://linkedin.com/in/johndoe"
}
```

---

#### `profiles_posts` — Get recent LinkedIn posts for a profile
```bash
trigify profiles posts --url "https://www.linkedin.com/in/johndoe"
trigify profiles posts --url "https://linkedin.com/in/johndoe" --limit 10
trigify profiles posts --urn "urn:li:member:12345678" --limit 25 --pretty
```
**Options:** `--url` or `--urn` (one required), `--limit` (max 50)
**Cost:** 1 credit per post. Use `--limit` to control spend.

**Agent guidance:** To get posts from a known profile URL, call `profiles_enrich` first to get the URN, then use the URN with `profiles_posts`. Or pass the URL directly.

**Response shape:**
```json
{
  "data": [
    {
      "urn": "urn:li:activity:123456789",
      "url": "https://linkedin.com/feed/update/urn:li:activity:123456789",
      "content": "Post text here...",
      "published_at": "2025-03-01T09:00:00Z",
      "likes": 234,
      "comments": 18,
      "shares": 7
    }
  ]
}
```

---

#### `profiles_engagement_bulk` — Bulk upload profiles to track
```bash
trigify profiles engagement-bulk --profiles "urn:li:member:111,urn:li:member:222,urn:li:member:333"
trigify profiles engagement-bulk --profiles "urn:li:member:111" --tag "icp-tier-1"
trigify profiles engagement-bulk --profiles "urn:li:member:444" --tag "competitors"
```
**Options:** `--profiles` (comma-separated URNs, required), `--tag`
**Cost:** Free to upload. Credits charged as engagement data is collected.
**Agent use:** Use tags to segment different profile groups. Then filter results by tag.

---

#### `profiles_engagement_results` — Get profile-level engagement summary
```bash
trigify profiles engagement-results
trigify profiles engagement-results --urn "urn:li:member:12345678"
trigify profiles engagement-results --tag "icp-tier-1" --pretty
trigify profiles engagement-results --page 2 --page-size 50
```
**Options:** `--urn`, `--tag`, `--page`, `--page-size`
**Cost:** Free

**Response shape:**
```json
{
  "data": [
    {
      "urn": "urn:li:member:12345678",
      "name": "John Doe",
      "tag": "icp-tier-1",
      "posts_tracked": 14,
      "total_engagements": 89,
      "last_post_at": "2025-03-08T10:00:00Z"
    }
  ]
}
```

---

#### `profiles_engagement_post_results` — Get post-level engagement data
```bash
trigify profiles engagement-post-results --tag "icp-tier-1"
trigify profiles engagement-post-results --urn "urn:li:member:12345678" --pretty
```
**Options:** `--urn`, `--tag`, `--page`, `--page-size`
**Cost:** Free

**Response shape:**
```json
{
  "data": [
    {
      "profile_urn": "urn:li:member:12345678",
      "post_urn": "urn:li:activity:987654321",
      "post_url": "https://linkedin.com/feed/update/...",
      "content_preview": "We just closed our Series A...",
      "published_at": "2025-03-05T08:00:00Z",
      "likes": 412,
      "comments": 63
    }
  ]
}
```

---

#### `profiles_engagement_remove` — Stop tracking a profile
```bash
trigify profiles engagement-remove --urn "urn:li:member:12345678"
trigify profiles engagement-remove --urn "urn:li:member:12345678" --quiet
```
**Options:** `--urn` (required)
**Cost:** Free

---

### GROUP: posts — Post Data (Enterprise tier)

Get people and comments from a specific LinkedIn post URL or URN.

---

#### `posts_engagements` — Get people who engaged with a post
```bash
trigify posts engagements --url "https://www.linkedin.com/feed/update/urn:li:activity:123456789"
trigify posts engagements --urn "urn:li:activity:123456789" --limit 50
trigify posts engagements --urn "urn:li:activity:123456789" --cursor "nextpage" --limit 25
```
**Options:** `--url` or `--urn` (one required), `--limit`, `--cursor`
**Cost:** 1 credit per engager returned. Always set `--limit`.

**Response shape:**
```json
{
  "data": [
    {
      "urn": "urn:li:member:12345678",
      "name": "Sarah Chen",
      "headline": "Head of Growth at Startup Co",
      "profile_url": "https://linkedin.com/in/sarahchen",
      "reaction_type": "like",
      "engaged_at": "2025-03-02T14:30:00Z"
    }
  ],
  "next_cursor": "cursor_string"
}
```

---

#### `posts_comments` — Get comments on a post
```bash
trigify posts comments --url "https://www.linkedin.com/feed/update/urn:li:activity:123456789"
trigify posts comments --urn "urn:li:activity:123456789" --limit 25 --pretty
```
**Options:** `--url` or `--urn` (one required), `--limit`, `--cursor`
**Cost:** 1 credit per comment returned.

**Response shape:**
```json
{
  "data": [
    {
      "urn": "urn:li:comment:456",
      "author_urn": "urn:li:member:99999",
      "author_name": "Mike Johnson",
      "author_url": "https://linkedin.com/in/mikejohnson",
      "content": "Great post! We've been thinking about this too.",
      "likes": 4,
      "reply_count": 2,
      "published_at": "2025-03-02T15:00:00Z"
    }
  ],
  "next_cursor": "cursor_string"
}
```

---

#### `posts_comment_replies` — Get replies to a specific comment
```bash
trigify posts comment-replies --post-urn "urn:li:activity:123456789" --comment-urn "urn:li:comment:456"
trigify posts comment-replies --post-url "https://..." --comment-urn "urn:li:comment:456" --limit 10
```
**Options:** `--post-url` or `--post-urn` (one required), `--comment-urn` (required), `--limit`, `--cursor`
**Cost:** 1 credit per reply returned.

---

### GROUP: social — Social Mapping (Enterprise tier)

Query the Trigify engagement graph directly. Find people who engage with LinkedIn content matching keywords, filtered by ICP firmographic criteria.

---

#### `social_mapping` — Find ICP-matched LinkedIn engagers
```bash
trigify social mapping --keywords "AI,machine learning" --pretty
trigify social mapping --keywords "GTM,outbound,cold email" --company-size "51-200" --industry "SaaS"
trigify social mapping --keywords "revenue operations" --seniority "VP,Director,Head of" --limit 50
trigify social mapping --keywords "Series A,fundraising" --location "San Francisco Bay Area" --job-title "founder"
trigify social mapping --keywords "AI tools" --company-size "11-50" --seniority "C-Level" --limit 25
```
**Options:** `--keywords` (required), `--limit`, `--cursor`, `--company-size`, `--industry`, `--job-title`, `--seniority`, `--location`, `--exclude`
**Cost:** Credits per result. Use `--limit` to control spend.

**Company size values:** `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1000"`, `"1001-5000"`, `"5001-10000"`, `"10001+"`

**Response shape:**
```json
{
  "data": [
    {
      "urn": "urn:li:member:12345678",
      "name": "Alex Rivera",
      "headline": "VP Sales at GrowthCo",
      "profile_url": "https://linkedin.com/in/alexrivera",
      "company": "GrowthCo",
      "company_size": "51-200",
      "industry": "SaaS",
      "location": "Austin, TX",
      "seniority": "VP",
      "engagement_score": 94
    }
  ],
  "next_cursor": "cursor_string"
}
```

---

### GROUP: enrich — Enrichment Helpers

---

#### `enrich_company` — Enrich a LinkedIn company URL
```bash
trigify enrich company --url "https://www.linkedin.com/company/openai"
trigify enrich company --url "https://linkedin.com/company/trigify" --pretty
```
**Agent use:** Get company ID and firmographic data to cross-reference with social mapping or topic engagers.
**Cost:** Unknown (undocumented endpoint)

**Response shape:**
```json
{
  "id": "company_123",
  "name": "OpenAI",
  "url": "https://linkedin.com/company/openai",
  "industry": "Artificial Intelligence",
  "size": "1001-5000",
  "location": "San Francisco, CA",
  "followers": 850000
}
```

---

## Global Output Options

```bash
# Compact JSON (default — pipe-friendly, use with jq)
trigify searches list | jq '.data[] | {id, name}'

# Pretty-printed (human-readable)
trigify searches list --pretty

# Select specific fields only
trigify searches list --fields "id,name,status"

# Quiet mode (exit code only — for scripting)
trigify searches delete abc123 --quiet && echo "Deleted"
```

---

## Agent Workflow Playbooks

These are step-by-step patterns for common GTM and sales intelligence tasks.

---

### Playbook 1: ICP Lead Generation via Keyword Engagement (Social Mapping)

**Goal**: Find VP-level SaaS leaders who actively engage with "outbound sales" content on LinkedIn.

```bash
# Step 1: Query the engagement graph with ICP filters
trigify social mapping \
  --keywords "outbound sales,cold email,SDR" \
  --company-size "51-200" \
  --seniority "VP,Director,Head of Sales" \
  --industry "SaaS" \
  --limit 50 \
  --pretty

# Step 2: Paginate for more results using the cursor from Step 1
trigify social mapping \
  --keywords "outbound sales,cold email,SDR" \
  --company-size "51-200" \
  --seniority "VP,Director,Head of Sales" \
  --industry "SaaS" \
  --cursor "cursor_from_previous_response" \
  --limit 50
```

**Agent note**: Social mapping is the fastest path to a filtered ICP list. Use `--limit` to control cost. Paginate with `--cursor`.

---

### Playbook 2: Monitor Brand/Competitor Mentions (Social Listening)

**Goal**: Track when people mention your brand or competitors across all social channels.

```bash
# Step 1: Create searches (1 credit each)
trigify searches create --name "Trigify mentions" --keywords "Trigify" --platforms "linkedin,twitter,reddit"
trigify searches create --name "Competitor - HubSpot" --keywords "HubSpot CRM,HubSpot Sales" --exclude-keywords "hiring,job"

# Step 2: List your searches to get IDs
trigify searches list --fields "id,name,status"

# Step 3: Poll results (free, paginate with cursor)
trigify searches results <id> --limit 100 --platform linkedin
trigify searches results <id> --cursor "<next_cursor>" --limit 100
```

**Agent note**: Create searches once, poll results for free indefinitely. Use `--start-date`/`--end-date` to scope results by time range.

---

### Playbook 3: Topic Engagement Intelligence (Who's Talking About X on LinkedIn)

**Goal**: Build a list of people actively engaging with "AI tools for sales" content on LinkedIn, with engagement backfill.

```bash
# Step 1: Create the topic (credits charged as data collects, not upfront)
trigify topics create \
  --name "AI sales tools" \
  --keywords "AI sales,AI SDR,AI for outbound,AI prospecting" \
  --exclude "job posting,hiring"

# Step 2: Get topic ID and monitor data collection
trigify topics list --fields "id,name,posts_found,engagements_found"

# Step 3: Check credit usage before pulling (optional)
trigify topics credits-summary <id>

# Step 4: Get deduplicated engagers (free after data is collected)
trigify topics engagements <id> --page-size 100 --pretty

# Step 5: Paginate all engagers
trigify topics engagements <id> --page 2 --page-size 100
trigify topics engagements <id> --page 3 --page-size 100

# Step 6: Drill into a specific post's engagers
trigify topics post-engagements <topicId> <postId> --pretty
```

**Agent note**: Topics backfill on Day 1, 3, 5. Check `topics_get` (field: `engagements_found`) to confirm data has landed before pulling. Engagements are deduplicated across all posts — one person won't appear twice.

---

### Playbook 4: Profile Research — What Is a Prospect Posting?

**Goal**: Given a LinkedIn profile URL, get their recent posts to understand their talking points and buying signals.

```bash
# Step 1: Enrich the URL to get URN (if you only have the URL)
trigify profiles enrich --url "https://www.linkedin.com/in/johndoe" --pretty

# Step 2: Fetch their recent posts (1 credit/post)
trigify profiles posts --urn "urn:li:member:12345678" --limit 10 --pretty

# Step 3: For a high-value post, get who engaged with it (1 credit/engager)
trigify posts engagements --urn "urn:li:activity:987654321" --limit 25

# Step 4: Get comments to understand conversation (1 credit/comment)
trigify posts comments --urn "urn:li:activity:987654321" --limit 10 --pretty
```

**Agent note**: Start with `--limit 10` on posts to preview. If the content is relevant, expand. Always enrich first if you only have a URL.

---

### Playbook 5: Track ICP Accounts for Buying Signals

**Goal**: Monitor a list of ICP contacts, get notified when they post about relevant topics.

```bash
# Step 1: Enrich LinkedIn URLs to get URNs
trigify profiles enrich --url "https://linkedin.com/in/prospect1"
trigify profiles enrich --url "https://linkedin.com/in/prospect2"

# Step 2: Bulk upload for tracking (free, tagged by ICP tier)
trigify profiles engagement-bulk \
  --profiles "urn:li:member:111,urn:li:member:222,urn:li:member:333" \
  --tag "icp-tier-1-q1-2025"

# Step 3: Later — check profile-level engagement activity
trigify profiles engagement-results --tag "icp-tier-1-q1-2025" --pretty

# Step 4: Get specific posts from active profiles
trigify profiles engagement-post-results --tag "icp-tier-1-q1-2025" --pretty

# Step 5: For a hot prospect, deep-dive their posts
trigify profiles posts --urn "urn:li:member:111" --limit 5 --pretty

# Step 6: Remove from tracking when deal is closed/lost
trigify profiles engagement-remove --urn "urn:li:member:111"
```

**Agent note**: Tags let you segment by cohort (deal stage, ICP tier, campaign, date). Filter all results by `--tag` to stay organized.

---

### Playbook 6: Post-Level Intelligence — Viral Content Deep Dive

**Goal**: A competitor's post went viral. Get everyone who engaged and commented.

```bash
# Step 1: Get all engagers (like/react) — 1 credit each, paginate
trigify posts engagements \
  --url "https://www.linkedin.com/feed/update/urn:li:activity:123456789" \
  --limit 50

trigify posts engagements \
  --urn "urn:li:activity:123456789" \
  --cursor "<next_cursor>" \
  --limit 50

# Step 2: Get all comments — 1 credit each
trigify posts comments --urn "urn:li:activity:123456789" --limit 50 --pretty

# Step 3: Get replies to top comments (use comment URN from Step 2)
trigify posts comment-replies \
  --post-urn "urn:li:activity:123456789" \
  --comment-urn "urn:li:comment:456" \
  --limit 20

# Step 4: Enrich a company mentioned in comments
trigify enrich company --url "https://www.linkedin.com/company/some-company"
```

---

### Playbook 7: Multi-Topic GTM Intelligence Dashboard

**Goal**: Run parallel topic monitors for multiple market segments, track credit efficiency.

```bash
# Create topics for different segments
trigify topics create --name "Segment: RevOps" --keywords "RevOps,revenue operations,GTM motion"
trigify topics create --name "Segment: SDR Leaders" --keywords "SDR manager,sales development,BDR team"
trigify topics create --name "Segment: Series A founders" --keywords "Series A,just raised,we raised"

# Get all topics and their data status at once
trigify topics list --fields "id,name,status,posts_found,engagements_found"

# Check cost before pulling large datasets
trigify topics credits-summary <segment1_id>
trigify topics credits-summary <segment2_id>

# Pull engagers for each segment
trigify topics engagements <segment1_id> --page-size 100
trigify topics engagements <segment2_id> --page-size 100
```

---

## Pagination Guide for Agents

**Searches results** — cursor-based:
```bash
# Page 1
result=$(trigify searches results <id> --limit 100)
cursor=$(echo $result | jq -r '.next_cursor')

# Page 2 (if cursor exists)
trigify searches results <id> --limit 100 --cursor "$cursor"
```

**Topics / Profiles / Social mapping** — page-number-based:
```bash
# Page through all engagers
trigify topics engagements <id> --page 1 --page-size 100
trigify topics engagements <id> --page 2 --page-size 100
# Stop when returned array length < page_size
```

**Posts engagements/comments** — cursor-based:
```bash
result=$(trigify posts engagements --urn <urn> --limit 50)
cursor=$(echo $result | jq -r '.next_cursor')
trigify posts engagements --urn <urn> --limit 50 --cursor "$cursor"
```

---

## MCP Server Setup

Start the MCP server — all 25 commands become tools:
```bash
trigify mcp
```

**Claude Desktop** (`~/.claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "trigify": {
      "command": "node",
      "args": ["/absolute/path/to/trigify-cli/dist/mcp.js"],
      "env": {
        "TRIGIFY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Via npx** (after publishing):
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

**Cursor** (`~/.cursor/mcp.json`) — same format as above.

---

## Complete Tool Reference (MCP Names)

| MCP Tool | CLI Command | Cost | Tier |
|----------|-------------|------|------|
| `searches_list` | `trigify searches list` | Free | Standard |
| `searches_get` | `trigify searches get <id>` | Free | Standard |
| `searches_create` | `trigify searches create` | 1 credit | Standard |
| `searches_update` | `trigify searches update <id>` | Free | Standard |
| `searches_delete` | `trigify searches delete <id>` | Free | Standard |
| `searches_results` | `trigify searches results <id>` | Free | Standard |
| `topics_list` | `trigify topics list` | Free | Enterprise |
| `topics_get` | `trigify topics get <id>` | Free | Enterprise |
| `topics_create` | `trigify topics create` | 1/post + 5/engagement | Enterprise |
| `topics_update` | `trigify topics update <id>` | Free | Enterprise |
| `topics_delete` | `trigify topics delete <id>` | Free | Enterprise |
| `topics_engagements` | `trigify topics engagements <id>` | Free | Enterprise |
| `topics_post_engagements` | `trigify topics post-engagements <topicId> <postId>` | Free | Enterprise |
| `topics_credits_summary` | `trigify topics credits-summary <id>` | Free | Enterprise |
| `profiles_posts` | `trigify profiles posts` | 1 credit/post | Enterprise |
| `profiles_enrich` | `trigify profiles enrich` | Varies | Enterprise |
| `profiles_engagement_bulk` | `trigify profiles engagement-bulk` | Free (deferred) | Enterprise |
| `profiles_engagement_results` | `trigify profiles engagement-results` | Free | Enterprise |
| `profiles_engagement_post_results` | `trigify profiles engagement-post-results` | Free | Enterprise |
| `profiles_engagement_remove` | `trigify profiles engagement-remove` | Free | Enterprise |
| `posts_engagements` | `trigify posts engagements` | 1 credit/engager | Enterprise |
| `posts_comments` | `trigify posts comments` | 1 credit/comment | Enterprise |
| `posts_comment_replies` | `trigify posts comment-replies` | 1 credit/reply | Enterprise |
| `social_mapping` | `trigify social mapping` | Varies/result | Enterprise |
| `enrich_company` | `trigify enrich company` | Varies | Enterprise |

---

## Error Reference

| Code | Meaning | Fix |
|------|---------|-----|
| `AUTH_ERROR` | Invalid or missing API key | Run `trigify login` or set `TRIGIFY_API_KEY` |
| `RATE_LIMIT` | 100 req/60s exceeded | CLI auto-retries; if persistent, reduce parallelism |
| `NOT_FOUND` | ID doesn't exist | Verify ID with `list` command |
| `VALIDATION_ERROR` | Bad request parameters | Check required fields |
| `TIMEOUT` | API took >15s (writes) or >30s (reads) | Retry; may indicate large result set |
| `NETWORK_ERROR` | Connection failed | Check internet connectivity |
