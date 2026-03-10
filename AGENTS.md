# Trigify CLI — Agent Reference

> **Trigify** is an agentic social listening and signal intelligence platform for modern B2B teams. It transforms raw social mentions into **signal-led intelligence** — monitoring LinkedIn, Twitter, Reddit, YouTube, and Podcasts for keyword mentions, tracking who engages with specific content, and mapping the engagement graph with firmographic filters.
>
> **For AI agents**: Read this document fully before calling any tools. It explains what each signal type means, when to use each tool, how to chain calls efficiently, and how to avoid wasting credits.

---

## Platform Mental Model

Trigify operates across three distinct data layers. Understand which layer you need before picking a tool:

| Layer | What it gives you | Tools |
|-------|-------------------|-------|
| **Mentions** | Posts/content that match keywords across all platforms | `searches_*` |
| **Engagers** | People who engaged with LinkedIn content matching keywords | `topics_*`, `social_mapping` |
| **Profile Intel** | A specific person's posts, reactions, and activity | `profiles_*`, `posts_*` |

**The key distinction agents miss:**
- `searches` → returns **content** (posts, articles, mentions)
- `topics` → returns **people** (who engaged with content matching your keywords)
- `social_mapping` → returns **people** filtered by firmographic ICP criteria

---

## Quick Decision Guide

| Goal | Tool Chain |
|------|-----------|
| Monitor brand/competitor mentions (all platforms) | `searches_create` → `searches_results` |
| Find people engaging with LinkedIn topic X | `topics_create` → `topics_engagements` |
| Find ICP-matched people engaging with topic X | `social_mapping` |
| See what a specific prospect is posting | `profiles_enrich` → `profiles_posts` |
| Get everyone who engaged with a specific post | `posts_engagements` |
| Track a list of prospects for buying signals | `profiles_engagement_bulk` → `profiles_engagement_post_results` |
| Deep-dive a post's comments + discussion | `posts_comments` → `posts_comment_replies` |
| Enrich a company URL for firmographic data | `enrich_company` |
| Check credit spend before pulling a large dataset | `topics_credits_summary` |

---

## Authentication

Three methods, in priority order:

```bash
# 1. Flag (highest priority — good for one-off calls)
trigify --api-key <key> searches list

# 2. Environment variable (good for CI/scripts/MCP config)
export TRIGIFY_API_KEY=your-api-key

# 3. Stored config (recommended for interactive use)
trigify login --api-key <key>
# Saved to ~/.trigify/config.json with 0600 permissions
```

Get your API key at: https://app.trigify.io/settings

---

## Rate Limits & Credits

**Rate limit**: 100 requests / 60-second window. The CLI auto-retries 429s with exponential backoff — agents never need to implement retry logic.

**Credit model** — pay-as-you-go, only charged on data extraction:

| Operation | Credits | Notes |
|-----------|---------|-------|
| `searches_create` | 1 | One-time to create the search |
| `profiles_posts` | 1 per post | Max 50/call — always set `--limit` |
| `posts_engagements` | 1 per engager | Always set `--limit` before expanding |
| `posts_comments` | 1 per comment | Always set `--limit` |
| `posts_comment_replies` | 1 per reply | Always set `--limit` |
| `topics_create` | 0 upfront | 1/new post found + 5/new engagement found |
| `social_mapping` | varies per result | Use `--limit` to control |
| `profiles_enrich` | varies | Undocumented; use to resolve URL → URN |
| `enrich_company` | varies | Undocumented; use to resolve company URL |
| All list/get/read calls | **0** | Free |
| All search/topic CRUD | **0** | Free |
| `profiles_engagement_bulk` | **0** | Free to upload; cost deferred to collection |

**Agent credit discipline:**
- Always use `--limit` on first call to sample before expanding
- Call `topics_credits_summary` before pulling large topic datasets
- `topics_engagements` is free to read — data cost was at collection time
- `searches_results` is always free — create once, poll indefinitely

---

## Signal Types & What They Mean

Trigify surfaces six core signal types. Understanding them helps agents decide which tool to use and how to act on results:

| Signal Type | What It Means | Best Tool | GTM Action |
|-------------|--------------|-----------|------------|
| **Brand Mention Surge** | Volume spike on your brand keywords | `searches_results` | Alert marketing, review sentiment shift |
| **Competitor Intel** | Competitor launches, announcements, or criticism appearing on social | `searches_create` (competitor keywords) | Build battle cards, route to sales |
| **Intent Spike** | Target accounts/people engaging with pain-point content | `topics_engagements`, `social_mapping` | Trigger personalized outbound sequence |
| **Sentiment Shift** | Audience mood change (positive or negative) | `searches_results` + filter by platform | Alert PR/comms team |
| **Risk Detection** | Crisis signals, negative sentiment clustering | `searches_results` | Immediate escalation |
| **Product Feedback** | Users publicly discussing features, bugs, requests | `searches_results` + `posts_comments` | Route to product team |

---

## All 25 Tools — Complete Reference

### AUTH

#### `trigify login`
```bash
trigify login --api-key <key>    # Non-interactive (scripts/CI)
trigify login                     # Interactive TTY prompt (Node 20+ only)
```

#### `trigify logout`
```bash
trigify logout
```

---

### GROUP: searches — Social Listening (Standard Tier)

Monitors keyword mentions across LinkedIn, Twitter, Reddit, YouTube, and Podcasts. Returns **content/posts** (not people). Create once, read results for free indefinitely.

**When to use:** Brand monitoring, competitor tracking, content research, market pulse, PR crisis detection.

---

#### `searches_create`
Create a keyword-based monitor. Costs 1 credit.
```bash
# Brand monitoring
trigify searches create \
  --name "Brand: Trigify" \
  --keywords "Trigify" \
  --platforms "linkedin,twitter,reddit"

# Competitor intelligence
trigify searches create \
  --name "Competitor: HubSpot" \
  --keywords "HubSpot CRM,HubSpot Sales Hub" \
  --exclude-keywords "hiring,job,career,internship"

# Pain-point signals (intent monitoring)
trigify searches create \
  --name "Pain: outbound problems" \
  --keywords "cold email not working,outbound dead,SDR quota" \
  --platforms "linkedin,twitter"

# Market research
trigify searches create \
  --name "Market: AI sales tools" \
  --keywords "AI SDR,AI for sales,AI outbound" \
  --platforms "linkedin,reddit,podcasts"
```
**Options:** `--name` (req), `--keywords` (req), `--platforms`, `--exclude-keywords`

---

#### `searches_list`
```bash
trigify searches list
trigify searches list --fields "id,name,status" --pretty
trigify searches list --page 2 --page-size 20
```

---

#### `searches_get`
```bash
trigify searches get <id> --pretty
```

---

#### `searches_update`
```bash
trigify searches update <id> --status paused
trigify searches update <id> --keywords "new,keywords,added"
trigify searches update <id> --exclude-keywords "jobs,hiring,apply"
trigify searches update <id> --name "Renamed search"
```
**Options:** `--name`, `--keywords`, `--platforms`, `--status` (active|paused), `--exclude-keywords`

---

#### `searches_delete`
```bash
trigify searches delete <id>
trigify searches delete <id> --quiet
```

---

#### `searches_results`
Get mentions/posts for a search. **Always free.** Cursor-paginated.
```bash
# Basic pull
trigify searches results <id> --pretty

# Filter to LinkedIn only
trigify searches results <id> --platform linkedin --limit 100

# Time-scoped (last 7 days)
trigify searches results <id> --start-date 2025-03-03 --end-date 2025-03-10

# Paginate
trigify searches results <id> --limit 100
trigify searches results <id> --limit 100 --cursor "<next_cursor_from_previous>"
```
**Options:** `--limit`, `--cursor`, `--platform` (linkedin|twitter|reddit|youtube|podcasts), `--start-date`, `--end-date`

**Response shape:**
```json
{
  "data": [
    {
      "id": "mention_abc",
      "platform": "linkedin",
      "url": "https://linkedin.com/feed/update/...",
      "content": "Cold email is dead. Here's what we're doing instead...",
      "author": {
        "name": "Jane Smith",
        "url": "https://linkedin.com/in/janesmith",
        "headline": "VP Sales at GrowthCo"
      },
      "published_at": "2025-03-08T09:00:00Z",
      "engagement": { "likes": 847, "comments": 93, "shares": 41 }
    }
  ],
  "next_cursor": "cursor_abc123"
}
```

---

### GROUP: topics — Social Topics (Enterprise Tier)

LinkedIn-only keyword monitors that return **who engaged** (people, not posts). Backfill cadence: Day 1, Day 3, Day 5 after creation. Topics auto-expire after 30 days.

**When to use:** Intent-based prospecting, finding active buyers, building ICP lists from engagement behavior, competitor content audience capture.

**Agent pattern:** Create → wait for backfill (check `topics_get` → `engagements_found` > 0) → pull `topics_engagements` for free.

---

#### `topics_create`
```bash
# Intent signals — people engaging with your pain points
trigify topics create \
  --name "Intent: outbound pain" \
  --keywords "cold email not converting,outbound ROI,pipeline generation" \
  --exclude "job,hiring,career"

# Competitor audience capture
trigify topics create \
  --name "Competitor: Salesloft users" \
  --keywords "Salesloft,Salesloft users,switching from Salesloft" \
  --exclude "job,hiring"

# Category keywords (broad ICP)
trigify topics create \
  --name "ICP: RevOps leaders talking shop" \
  --keywords "revenue operations,RevOps stack,GTM motion,revenue efficiency"

# Thought leader content (people engaging with influencer posts)
trigify topics create \
  --name "TL: Outbound influencers" \
  --keywords "Morgan Ingram,Krysten Conner,Nick Abraham" \
  --exclude "hiring,job posting"
```
**Options:** `--name` (req), `--keywords` (req), `--exclude`
**Cost:** 0 upfront. 1 credit/new post, 5 credits/new engagement as data arrives over 30 days.

---

#### `topics_list`
```bash
trigify topics list --fields "id,name,status,posts_found,engagements_found"
trigify topics list --page 2 --page-size 20
```

---

#### `topics_get`
```bash
trigify topics get <id> --pretty
```
**Agent use:** Poll this to check if data has collected before calling `topics_engagements`.

**Response shape:**
```json
{
  "id": "topic_abc",
  "name": "Intent: outbound pain",
  "keywords": ["cold email not converting", "outbound ROI"],
  "status": "active",
  "posts_found": 412,
  "engagements_found": 2847,
  "created_at": "2025-03-01T00:00:00Z",
  "expires_at": "2025-03-31T00:00:00Z",
  "backfill_status": "complete"
}
```

---

#### `topics_update`
```bash
trigify topics update <id> --status paused
trigify topics update <id> --status active
trigify topics update <id> --name "Renamed topic"
```

---

#### `topics_delete`
Soft-delete — stops monitoring, retains historical data.
```bash
trigify topics delete <id>
```

---

#### `topics_engagements`
Get deduplicated list of people who engaged with posts matching this topic. **Free to read.**
```bash
trigify topics engagements <id> --pretty
trigify topics engagements <id> --page 1 --page-size 100
trigify topics engagements <id> --page 2 --page-size 100
```

**Response shape:**
```json
{
  "data": [
    {
      "urn": "urn:li:member:12345678",
      "name": "Alex Rivera",
      "headline": "VP of Sales at Acme Corp",
      "profile_url": "https://linkedin.com/in/alexrivera",
      "company": "Acme Corp",
      "engagement_count": 5,
      "last_engaged_at": "2025-03-07T14:00:00Z"
    }
  ],
  "total": 2847,
  "page": 1,
  "page_size": 100
}
```

**Deduplication note:** A person who engaged with 10 posts appears once with `engagement_count: 10`. Use `engagement_count` as an intent-strength signal.

---

#### `topics_post_engagements`
Get engagers for a specific post within a topic. **Free.**
```bash
trigify topics post-engagements <topicId> <postId> --pretty
```
**Agent use:** First call `topics_engagements` to find high-engagement posts, then drill into specific posts.

---

#### `topics_credits_summary`
```bash
trigify topics credits-summary <id> --pretty
```
**Response shape:**
```json
{
  "topic_id": "topic_abc",
  "posts_found": 412,
  "engagements_found": 2847,
  "credits_from_posts": 412,
  "credits_from_engagements": 14235,
  "total_credits_consumed": 14647
}
```

---

### GROUP: profiles — Profile Data & Engagement Tracking (Enterprise Tier)

Two sub-capabilities:
1. **Profile Data** — pull what a specific person is posting on LinkedIn
2. **Engagement Tracking** — monitor a list of people and get notified when they post

---

#### `profiles_enrich`
Resolve a LinkedIn profile URL → URN + structured data. Call this first if you only have a URL.
```bash
trigify profiles enrich --url "https://www.linkedin.com/in/johndoe" --pretty
```
**Response shape:**
```json
{
  "urn": "urn:li:member:12345678",
  "name": "John Doe",
  "headline": "CEO at Acme Corp",
  "profile_url": "https://linkedin.com/in/johndoe",
  "company": "Acme Corp",
  "location": "San Francisco, CA"
}
```

---

#### `profiles_posts`
Get a person's recent LinkedIn posts. 1 credit/post.
```bash
# Via URL (will resolve internally)
trigify profiles posts --url "https://www.linkedin.com/in/johndoe" --limit 5

# Via URN (preferred — faster)
trigify profiles posts --urn "urn:li:member:12345678" --limit 10 --pretty

# Max pull (50 posts, most expensive)
trigify profiles posts --urn "urn:li:member:12345678" --limit 50
```
**Options:** `--url` or `--urn` (one required), `--limit` (max 50)

**Response shape:**
```json
{
  "data": [
    {
      "urn": "urn:li:activity:987654321",
      "url": "https://linkedin.com/feed/update/urn:li:activity:987654321",
      "content": "We just hit $1M ARR. Here's what we learned...",
      "published_at": "2025-03-05T08:00:00Z",
      "likes": 1243,
      "comments": 87,
      "shares": 34
    }
  ]
}
```

---

#### `profiles_engagement_bulk`
Upload a list of LinkedIn profiles to monitor for ongoing engagement. Free to upload.
```bash
# Single profile with tag
trigify profiles engagement-bulk \
  --profiles "urn:li:member:12345678" \
  --tag "champion-acme-corp"

# Batch upload by segment
trigify profiles engagement-bulk \
  --profiles "urn:li:member:111,urn:li:member:222,urn:li:member:333" \
  --tag "icp-tier-1-q1-2025"

# Multiple segments
trigify profiles engagement-bulk --profiles "urn:li:member:444" --tag "at-risk-customers"
trigify profiles engagement-bulk --profiles "urn:li:member:555" --tag "open-opps-stage-3"
```
**Tag naming strategy:** Use tags to segment by deal stage, ICP tier, campaign, cohort date, or customer segment.

---

#### `profiles_engagement_results`
Profile-level summary: how many posts, total engagements, last active. **Free.**
```bash
trigify profiles engagement-results --tag "icp-tier-1-q1-2025" --pretty
trigify profiles engagement-results --urn "urn:li:member:12345678"
trigify profiles engagement-results --page 2 --page-size 50
```

**Response shape:**
```json
{
  "data": [
    {
      "urn": "urn:li:member:12345678",
      "name": "Sarah Chen",
      "tag": "icp-tier-1-q1-2025",
      "posts_tracked": 7,
      "total_engagements": 412,
      "last_post_at": "2025-03-08T11:00:00Z",
      "trending": true
    }
  ]
}
```

---

#### `profiles_engagement_post_results`
Individual post feed from tracked profiles. **Free.**
```bash
trigify profiles engagement-post-results --tag "icp-tier-1-q1-2025" --pretty
trigify profiles engagement-post-results --urn "urn:li:member:12345678"
```

**Response shape:**
```json
{
  "data": [
    {
      "profile_urn": "urn:li:member:12345678",
      "profile_name": "Sarah Chen",
      "post_urn": "urn:li:activity:111222333",
      "post_url": "https://linkedin.com/feed/update/...",
      "content_preview": "Just signed our biggest deal ever. The signal that tipped it...",
      "published_at": "2025-03-07T09:00:00Z",
      "likes": 891,
      "comments": 64
    }
  ]
}
```

---

#### `profiles_engagement_remove`
Stop tracking a profile.
```bash
trigify profiles engagement-remove --urn "urn:li:member:12345678"
```

---

### GROUP: posts — Post-Level Data (Enterprise Tier)

Deep-dive into a specific LinkedIn post. Need the post URL or URN (get it from `profiles_posts`, `searches_results`, or `topics_engagements`).

---

#### `posts_engagements`
Get people who liked/reacted to a post. 1 credit/engager.
```bash
# Start with small limit to qualify the post first
trigify posts engagements \
  --url "https://www.linkedin.com/feed/update/urn:li:activity:123456789" \
  --limit 25

# Expand if relevant
trigify posts engagements --urn "urn:li:activity:123456789" --limit 100

# Paginate
trigify posts engagements \
  --urn "urn:li:activity:123456789" \
  --limit 100 \
  --cursor "<next_cursor>"
```

**Response shape:**
```json
{
  "data": [
    {
      "urn": "urn:li:member:99999",
      "name": "Mike Johnson",
      "headline": "Director of Sales at TechCo",
      "profile_url": "https://linkedin.com/in/mikejohnson",
      "reaction_type": "like",
      "engaged_at": "2025-03-06T15:30:00Z"
    }
  ],
  "next_cursor": "cursor_xyz"
}
```

---

#### `posts_comments`
Get comments on a post. 1 credit/comment.
```bash
trigify posts comments --urn "urn:li:activity:123456789" --limit 25 --pretty
trigify posts comments --url "https://linkedin.com/feed/update/..." --limit 50
```

**Response shape:**
```json
{
  "data": [
    {
      "urn": "urn:li:comment:456",
      "author_urn": "urn:li:member:77777",
      "author_name": "Dana Park",
      "author_url": "https://linkedin.com/in/danapark",
      "content": "We had the same problem — switched to Trigify 3 months ago and pipeline is up 40%",
      "likes": 12,
      "reply_count": 3,
      "published_at": "2025-03-06T16:00:00Z"
    }
  ],
  "next_cursor": "cursor_abc"
}
```

---

#### `posts_comment_replies`
Get replies to a specific comment. 1 credit/reply.
```bash
trigify posts comment_replies \
  --post-urn "urn:li:activity:123456789" \
  --comment-urn "urn:li:comment:456" \
  --limit 10
```

---

### GROUP: social — Social Mapping (Enterprise Tier)

Query the Trigify engagement graph directly with firmographic filters. The most targeted tool for building ICP lists from LinkedIn engagement behavior.

**When to use:** You need people who engage with a topic AND match your ICP criteria. More precise than `topics_engagements` because you can filter by company size, seniority, industry, location.

---

#### `social_mapping`
```bash
# Find VP Sales at mid-market SaaS companies talking about outbound
trigify social mapping \
  --keywords "outbound sales,cold email,SDR" \
  --seniority "VP,Director,Head of Sales" \
  --company-size "51-200" \
  --industry "SaaS" \
  --limit 50 \
  --pretty

# Find founders in SF engaging with Series A content
trigify social mapping \
  --keywords "Series A,just raised,we raised our" \
  --job-title "founder,co-founder,CEO" \
  --location "San Francisco Bay Area" \
  --company-size "1-10,11-50" \
  --limit 25

# Find RevOps leaders at companies 200-500 employees
trigify social mapping \
  --keywords "revenue operations,RevOps,GTM motion" \
  --seniority "VP,Director,Manager" \
  --job-title "RevOps,Revenue Operations,GTM" \
  --company-size "201-500" \
  --limit 50

# Competitor audience — enterprise buyers evaluating alternatives
trigify social mapping \
  --keywords "Salesforce,switching from Salesforce,Salesforce too expensive" \
  --seniority "VP,C-Level,Director" \
  --company-size "201-500,501-1000" \
  --limit 50

# Paginate with cursor
trigify social mapping \
  --keywords "AI tools for sales" \
  --seniority "VP,Director" \
  --limit 50 \
  --cursor "<cursor_from_previous_response>"
```

**Company size values:** `"1-10"` `"11-50"` `"51-200"` `"201-500"` `"501-1000"` `"1001-5000"` `"5001-10000"` `"10001+"`

**Response shape:**
```json
{
  "data": [
    {
      "urn": "urn:li:member:12345678",
      "name": "Alex Rivera",
      "headline": "VP of Sales at GrowthCo",
      "profile_url": "https://linkedin.com/in/alexrivera",
      "company": "GrowthCo",
      "company_size": "51-200",
      "industry": "SaaS",
      "seniority": "VP",
      "location": "Austin, TX",
      "engagement_score": 94
    }
  ],
  "next_cursor": "cursor_xyz"
}
```

---

### GROUP: enrich — Enrichment Helpers

---

#### `enrich_company`
Resolve a LinkedIn company URL → company ID + firmographic data.
```bash
trigify enrich company --url "https://www.linkedin.com/company/openai" --pretty
trigify enrich company --url "https://linkedin.com/company/hubspot"
```

**Response shape:**
```json
{
  "id": "company_123",
  "name": "OpenAI",
  "url": "https://linkedin.com/company/openai",
  "industry": "Artificial Intelligence",
  "size": "1001-5000",
  "location": "San Francisco, CA",
  "followers": 1200000,
  "description": "OpenAI's mission is to ensure that artificial general intelligence..."
}
```

---

## Output Options

```bash
# Compact JSON (default — pipe-friendly)
trigify searches list | jq '.data[] | {id, name}'

# Pretty-printed for reading
trigify topics engagements <id> --pretty

# Specific fields only
trigify topics engagements <id> --fields "name,headline,company,engagement_count"

# Quiet mode (exit code only — for scripting)
trigify searches delete <id> --quiet && echo "Deleted"
```

---

## Agent Workflow Playbooks

### Playbook 1: Signal-Led Sales Prospecting (Intent-Based Outbound)

**Goal:** Find people actively signaling they have a pain your product solves, and build a qualified outreach list.

**Best for:** SDRs, AEs, demand gen teams building ICP lists.

```bash
# Step 1: Create intent-signal topics (free upfront)
trigify topics create \
  --name "Pain: [your pain point]" \
  --keywords "pain point keyword 1,pain point keyword 2,problem statement" \
  --exclude "hiring,job,career"

# Step 2: Check data has landed (poll until engagements_found > 0)
trigify topics get <id> --fields "posts_found,engagements_found,backfill_status"

# Step 3: Check credit spend first
trigify topics credits-summary <id>

# Step 4: Pull all engagers (free — already paid at collection)
trigify topics engagements <id> --page-size 100 --pretty
trigify topics engagements <id> --page 2 --page-size 100
# Continue until returned array length < page_size

# Step 5: For highest-intent people (high engagement_count), research their posts
trigify profiles posts --urn "urn:li:member:XXXXX" --limit 5 --pretty

# Step 6: Optionally filter by ICP using social mapping
trigify social mapping \
  --keywords "your pain point keywords" \
  --seniority "VP,Director" \
  --company-size "51-200" \
  --industry "SaaS" \
  --limit 50
```

**Agent signal interpretation:**
- `engagement_count: 1` → mild interest (liked one post)
- `engagement_count: 3-5` → strong interest (actively engaging with this topic)
- `engagement_count: 5+` → very high intent (buy signal — prioritize immediately)

---

### Playbook 2: Competitor Audience Capture

**Goal:** Find people who follow, engage with, or complain about competitors — then target them.

```bash
# Step 1: Create competitor keyword searches (multi-platform)
trigify searches create \
  --name "Competitor: [CompetitorName]" \
  --keywords "[CompetitorName],[CompetitorName] alternative,switching from [CompetitorName]" \
  --platforms "linkedin,twitter,reddit" \
  --exclude-keywords "job,hiring,internship"

# Step 2: Create LinkedIn-specific topic to capture engagers
trigify topics create \
  --name "Comp: [CompetitorName] LinkedIn engagers" \
  --keywords "[CompetitorName],[CompetitorName] users,[CompetitorName] pricing" \
  --exclude "hiring,job"

# Step 3: Get mentions (content — for market intelligence)
trigify searches results <searches_id> --platform linkedin --limit 100 --pretty

# Step 4: Get engagers (people — for outreach)
trigify topics engagements <topics_id> --page-size 100 --pretty

# Step 5: Layer firmographic ICP filter on the audience
trigify social mapping \
  --keywords "[CompetitorName]" \
  --seniority "VP,Director,Manager" \
  --company-size "51-200,201-500" \
  --limit 50
```

---

### Playbook 3: Brand Intelligence & Sentiment Monitoring

**Goal:** Real-time brand health monitoring — catch crises early, identify advocates, surface PR opportunities.

**Best for:** Marketing, PR, comms teams.

```bash
# Step 1: Create brand monitoring searches
trigify searches create \
  --name "Brand: [YourBrand] - all platforms" \
  --keywords "[YourBrand],[YourBrand.io],[YourBrand] reviews" \
  --platforms "linkedin,twitter,reddit,youtube"

# Separate searches for different signal types
trigify searches create \
  --name "Brand: [YourBrand] - negative signals" \
  --keywords "[YourBrand] problem,[YourBrand] bad,[YourBrand] doesn't work,cancel [YourBrand]"

trigify searches create \
  --name "Brand: [YourBrand] - advocates" \
  --keywords "love [YourBrand],recommend [YourBrand],[YourBrand] is amazing,[YourBrand] changed"

# Step 2: List all brand searches
trigify searches list --fields "id,name,status"

# Step 3: Monitor results with time scoping
trigify searches results <id> --start-date 2025-03-01 --limit 100 --platform twitter
trigify searches results <id> --start-date 2025-03-01 --limit 100 --platform reddit

# Step 4: For high-engagement posts about your brand, get who's engaging
trigify posts engagements --url "<viral_brand_post_url>" --limit 50
trigify posts comments --url "<viral_brand_post_url>" --limit 25 --pretty
```

---

### Playbook 4: Account-Based Marketing (ABM) Signal Tracking

**Goal:** Monitor a named list of target accounts and their champions for buying signals.

**Best for:** AEs working strategic accounts, ABM marketing programs.

```bash
# Step 1: Enrich profile URLs to get URNs for each champion
trigify profiles enrich --url "https://linkedin.com/in/champion-at-account1"
trigify profiles enrich --url "https://linkedin.com/in/champion-at-account2"

# Step 2: Bulk upload all champions with account tags
trigify profiles engagement-bulk \
  --profiles "urn:li:member:111,urn:li:member:222" \
  --tag "target-account-acme-q1"

trigify profiles engagement-bulk \
  --profiles "urn:li:member:333" \
  --tag "target-account-globex-q1"

# Step 3: Check account activity (profile level)
trigify profiles engagement-results --tag "target-account-acme-q1" --pretty

# Step 4: Read their posts (post level — what are they talking about?)
trigify profiles engagement-post-results --tag "target-account-acme-q1" --pretty

# Step 5: For a high-engagement post from a champion, deep-dive it
trigify profiles posts --urn "urn:li:member:111" --limit 5 --pretty

# Step 6: Get who engaged with their post (network intelligence)
trigify posts engagements --urn "urn:li:activity:XXXXX" --limit 25

# Step 7: Enrich their company for firmographic context
trigify enrich company --url "https://linkedin.com/company/acme-corp" --pretty

# Step 8: When deal closes/goes cold, remove from tracking
trigify profiles engagement-remove --urn "urn:li:member:111"
```

**Buying signal indicators:**
- Champion posts about the problem your product solves → high-priority outreach trigger
- Champion post gets high engagement from others at the account → multi-threaded opportunity
- Champion engages with competitor content → risk signal for existing customers, opportunity for prospects

---

### Playbook 5: Thought Leader Audience Capture

**Goal:** Find everyone engaging with key influencers in your space — these are your most engaged potential buyers.

```bash
# Step 1: Create topics targeting influencer names + content themes
trigify topics create \
  --name "TL: [Influencer Name] audience" \
  --keywords "[Influencer Name],[Influencer Company],posts by [Influencer]"

# Step 2: Layer with ICP keywords (people engaging with BOTH their content AND pain points)
trigify topics create \
  --name "ICP + TL: [space] leaders" \
  --keywords "[influencer keyword 1],[influencer keyword 2],outbound,cold email"

# Step 3: Pull engagers
trigify topics engagements <id> --page-size 100

# Step 4: For highest-engagement people, get their recent posts
trigify profiles posts --urn "<high_engager_urn>" --limit 5

# Step 5: Social mapping — find ICP people from this audience
trigify social mapping \
  --keywords "[influencer topic keywords]" \
  --company-size "51-200" \
  --seniority "VP,Director" \
  --limit 50
```

---

### Playbook 6: Product Feedback & Market Research

**Goal:** Surface what real users are saying about your product category, features, and competitors.

**Best for:** Product managers, PMMs, founders doing customer discovery.

```bash
# Step 1: Monitor product category conversations
trigify searches create \
  --name "Product: feature requests" \
  --keywords "wish [product category] could,[product category] needs,missing feature [product]" \
  --platforms "reddit,linkedin,twitter"

trigify searches create \
  --name "Product: pain points" \
  --keywords "[problem space] is broken,[pain point] still sucks,why can't [product category]" \
  --platforms "reddit,twitter"

# Step 2: Monitor competitor complaints (= your feature gaps)
trigify searches create \
  --name "Product: competitor gaps" \
  --keywords "[Competitor] doesn't have,[Competitor] missing,[Competitor] can't do" \
  --platforms "reddit,twitter,linkedin"

# Step 3: Pull results for analysis
trigify searches results <id> --platform reddit --limit 100 --pretty
trigify searches results <id> --platform twitter --limit 100

# Step 4: For high-engagement product discussion posts, get full comment thread
trigify posts comments --url "<high_engagement_product_post>" --limit 50 --pretty

# Step 5: Get replies to top comments (often richest feedback)
trigify posts comment_replies \
  --post-urn "urn:li:activity:XXXXX" \
  --comment-urn "urn:li:comment:YYYYY" \
  --limit 20
```

---

### Playbook 7: Sales Trigger — Viral Post Intelligence

**Goal:** A relevant post just went viral (competitor announcement, industry news, pain-point content). Rapidly capture everyone who engaged.

```bash
# Step 1: Get all engagers (reactions/likes) — paginate fully
trigify posts engagements --url "<viral_post_url>" --limit 100
trigify posts engagements --urn "<post_urn>" --limit 100 --cursor "<cursor>"

# Step 2: Get all comments (often higher-quality signals than likes)
trigify posts comments --urn "<post_urn>" --limit 50 --pretty

# Step 3: Get replies to top comments (highest-intent discussion)
trigify posts comment_replies \
  --post-urn "<post_urn>" \
  --comment-urn "<top_comment_urn>" \
  --limit 20

# Step 4: For the most relevant commenters, pull their recent posts
trigify profiles posts --urn "<commenter_urn>" --limit 3

# Step 5: Enrich their company
trigify enrich company --url "<commenter_company_linkedin_url>"
```

---

### Playbook 8: Multi-Segment GTM Intelligence Dashboard

**Goal:** Run parallel monitors across multiple ICP segments to build a continuous signal feed.

```bash
# Create segment-specific topics
trigify topics create --name "Seg: Mid-market RevOps" \
  --keywords "RevOps,revenue operations,GTM motion,revenue efficiency"

trigify topics create --name "Seg: Enterprise Sales Leaders" \
  --keywords "enterprise sales,complex sales,sales transformation,sales methodology"

trigify topics create --name "Seg: Startup Founders fundraising" \
  --keywords "just raised,Series A,seed round,we closed our"

trigify topics create --name "Seg: SDR/BDR managers" \
  --keywords "SDR team,BDR team,outbound team,sales development"

# Monitor all segments at once
trigify topics list --fields "id,name,posts_found,engagements_found,status"

# Check which segments are most active (best ROI)
trigify topics credits-summary <seg1_id>
trigify topics credits-summary <seg2_id>

# Pull data from highest-signal segment first
trigify topics engagements <most_active_id> --page-size 100 --fields "name,headline,company,engagement_count"

# Social map against best-performing segment keywords
trigify social mapping \
  --keywords "RevOps,revenue operations" \
  --company-size "201-500" \
  --seniority "VP,Director" \
  --limit 50
```

---

### Playbook 9: Churn & Expansion Intelligence (Customer Success)

**Goal:** Monitor existing customers' public social activity for churn signals and expansion opportunities.

```bash
# Step 1: Upload your customer contacts for monitoring
trigify profiles engagement-bulk \
  --profiles "urn:li:member:111,urn:li:member:222,urn:li:member:333" \
  --tag "customers-enterprise-tier"

trigify profiles engagement-bulk \
  --profiles "urn:li:member:444,urn:li:member:555" \
  --tag "customers-at-risk"

# Step 2: Monitor what they're posting
trigify profiles engagement-results --tag "customers-enterprise-tier" --pretty
trigify profiles engagement-post-results --tag "customers-enterprise-tier" --pretty

# Step 3: Search for churn signals (customers publicly complaining or evaluating alternatives)
trigify searches create \
  --name "Churn: customer signals" \
  --keywords "[YourProduct] problems,[YourProduct] canceling,switching from [YourProduct],looking for alternative to [YourProduct]"

# Step 4: Search for expansion signals
trigify searches create \
  --name "Expand: customer growth signals" \
  --keywords "growing our team,we're hiring,just closed [customer company],expanding to"

# Step 5: Pull churn signal results
trigify searches results <churn_search_id> --platform linkedin --pretty

# Step 6: For at-risk customers, check their recent posts for competitor mentions
trigify profiles posts --urn "<at_risk_customer_urn>" --limit 10
```

**Signal interpretation:**
- Customer posts about a competitor → **risk flag** (notify CSM immediately)
- Customer posts about growth/hiring → **expansion opportunity**
- Customer goes quiet (no posts for 30 days) → **engagement risk** (check in)
- Customer publicly praises your product → **advocate signal** (invite to case study/reference program)

---

### Playbook 10: Content Strategy Intelligence

**Goal:** Understand what content is resonating in your category to inform content strategy.

```bash
# Step 1: Monitor category content performance
trigify searches create \
  --name "Content: what's resonating in [category]" \
  --keywords "[category keyword 1],[category keyword 2],[category keyword 3]" \
  --platforms "linkedin"

# Step 2: Create topics to see who engages with top content
trigify topics create \
  --name "Content: [category] top engagers" \
  --keywords "[category keyword 1],[category keyword 2]"

# Step 3: Pull high-engagement content
trigify searches results <id> --platform linkedin --limit 50 --pretty
# Look for items with high engagement in response

# Step 4: For the highest-performing posts, analyze who engaged
trigify posts engagements --url "<top_post_url>" --limit 50

# Step 5: Get the full comment thread from top posts
trigify posts comments --url "<top_post_url>" --limit 50 --pretty

# Step 6: Understand which content themes drive ICP engagement
trigify topics engagements <id> --fields "name,headline,company,engagement_count"
```

---

## Pagination Reference

**Cursor-based** (searches results, posts engagements/comments):
```bash
# Page 1
trigify searches results <id> --limit 100
# Extract next_cursor from response, then:
trigify searches results <id> --limit 100 --cursor "<next_cursor>"
# Stop when next_cursor is null or absent
```

**Page-number-based** (topics, profiles, social mapping):
```bash
trigify topics engagements <id> --page 1 --page-size 100
trigify topics engagements <id> --page 2 --page-size 100
# Stop when returned array length < page_size
```

---

## Integration Patterns

Trigify data pipes naturally into these tools:

| Downstream Tool | Use Case | Data to Pass |
|-----------------|----------|-------------|
| **Clay** | Enrich Trigify people with full contact data | URN, profile_url, name, headline |
| **Instantly / Smartlead** | Sequence Trigify prospects | Email (from Clay), name, company |
| **HeyReach / La Growth Machine** | LinkedIn outreach to Trigify prospects | profile_url, URN |
| **HubSpot / Salesforce** | Log signals as CRM activities | urn, name, company, signal_type |
| **Slack** | Alert teams on high-intent signals | name, headline, engagement_count, post_url |
| **Outreach / Salesloft** | Add to cadences | name, company, email, signal context |
| **Notion / Airtable** | Build signal dashboards | Full response objects |

**Example pipeline (Trigify → Clay → Instantly):**
```bash
# 1. Get ICP-matched people from Trigify
trigify social mapping \
  --keywords "outbound sales,cold email" \
  --seniority "VP,Director" \
  --company-size "51-200" \
  --limit 50 \
  --fields "name,headline,profile_url,company,urn" > prospects.json

# 2. Pass profile_url to Clay for email enrichment
# 3. Pass enriched contacts to Instantly for sequencing
```

---

## MCP Server Setup

Start the server (all 25 commands become MCP tools):
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

**Via npx (after npm install):**
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

**Cursor** (`~/.cursor/mcp.json`) — same format.

---

## Complete Tool Index

| MCP Tool | CLI Command | Credits | Tier |
|----------|-------------|---------|------|
| `searches_create` | `trigify searches create` | 1 | Standard |
| `searches_list` | `trigify searches list` | Free | Standard |
| `searches_get` | `trigify searches get <id>` | Free | Standard |
| `searches_update` | `trigify searches update <id>` | Free | Standard |
| `searches_delete` | `trigify searches delete <id>` | Free | Standard |
| `searches_results` | `trigify searches results <id>` | Free | Standard |
| `topics_create` | `trigify topics create` | 1/post + 5/eng | Enterprise |
| `topics_list` | `trigify topics list` | Free | Enterprise |
| `topics_get` | `trigify topics get <id>` | Free | Enterprise |
| `topics_update` | `trigify topics update <id>` | Free | Enterprise |
| `topics_delete` | `trigify topics delete <id>` | Free | Enterprise |
| `topics_engagements` | `trigify topics engagements <id>` | Free | Enterprise |
| `topics_post_engagements` | `trigify topics post-engagements <tid> <pid>` | Free | Enterprise |
| `topics_credits_summary` | `trigify topics credits-summary <id>` | Free | Enterprise |
| `profiles_enrich` | `trigify profiles enrich` | Varies | Enterprise |
| `profiles_posts` | `trigify profiles posts` | 1/post | Enterprise |
| `profiles_engagement_bulk` | `trigify profiles engagement-bulk` | Free (deferred) | Enterprise |
| `profiles_engagement_results` | `trigify profiles engagement-results` | Free | Enterprise |
| `profiles_engagement_post_results` | `trigify profiles engagement-post-results` | Free | Enterprise |
| `profiles_engagement_remove` | `trigify profiles engagement-remove` | Free | Enterprise |
| `posts_engagements` | `trigify posts engagements` | 1/engager | Enterprise |
| `posts_comments` | `trigify posts comments` | 1/comment | Enterprise |
| `posts_comment_replies` | `trigify posts comment-replies` | 1/reply | Enterprise |
| `social_mapping` | `trigify social mapping` | Varies/result | Enterprise |
| `enrich_company` | `trigify enrich company` | Varies | Enterprise |

---

## Error Reference

| Code | Meaning | Action |
|------|---------|--------|
| `AUTH_ERROR` | Invalid/missing API key | Run `trigify login` or set `TRIGIFY_API_KEY` |
| `RATE_LIMIT` | 100 req/60s exceeded | CLI auto-retries; reduce parallelism if persistent |
| `NOT_FOUND` | Resource ID doesn't exist | Verify with `list` command |
| `VALIDATION_ERROR` | Bad request parameters | Check required fields and value formats |
| `TIMEOUT` | API unresponsive (>30s read, >15s write) | Retry; may indicate large result set |
| `NETWORK_ERROR` | Connection failed | Check internet / API availability |
