# AI Review Error Reporter

A collection of scripts to analyze and aggregate errors from GitHub Actions workflow runs for the `claude-review.yml` workflow.

## Overview

This toolset helps identify and track common errors in AI review workflows by:
1. Collecting workflow run data from GitHub
2. Extracting error messages from job summaries
3. Aggregating and ranking errors by frequency

## Scripts

### 1. `ai_review_error_reporter.sh` (Main Orchestrator)
Main entry point that runs the entire pipeline.

**Usage:**
```bash
./ai_review_error_reporter.sh [runs_limit] [output_file]
```

**Parameters:**
- `runs_limit`: Number of workflow runs to fetch (default: 100)
- `output_file`: Output file for the error report (default: `job_error_report.md`)

**Example:**
```bash
./ai_review_error_reporter.sh 50 my_report.md
```
<details>
<summary> Internal scripts details </summary>

### 2. `claude_review_collector.sh` (Data Collection)
Fetches workflow run data from GitHub and caches it locally.

**Usage:**
```bash
./claude_review_collector.sh [limit]
```

**Parameters:**
- `limit`: Number of workflow runs to fetch (default: 100)

### 3. `job_error_aggregator.sh` (Analysis)
Aggregates and ranks error messages from cached data.

**Usage:**
```bash
./job_error_aggregator.sh [directory] [output_file]
```

**Parameters:**
- `directory`: Directory containing error title files (default: `job_errors_titles`)
- `output_file`: Output markdown report (default: `job_error_report.md`)

</details>


## Setup

### Prerequisites

1. **GitHub CLI (`gh`)** - Must be installed and authenticated
   ```bash
   # Install (macOS)
   brew install gh
   
   # Authenticate
   gh auth login
   ```

2. **jq** - JSON processor
   ```bash
   # Install (macOS)
   brew install jq
   ```

3. **curl** - Usually pre-installed on macOS/Linux

### Environment Variables

The scripts require the following environment variable:

```bash
export GITHUB_USER_SESSION="your_github_session_token"
```

#### How to Get Your GitHub Session Token:

1. Log in to GitHub in your browser
2. Open Developer Tools (F12 or Cmd+Opt+I)
3. Go to the "Application" or "Storage" tab
4. Find "Cookies" → "https://github.com"
5. Look for the `user_session` cookie
6. Copy its value

**⚠️ Security Warning:** 
- Never commit this token to version control
- Keep it in your local environment or a `.env` file (which should be gitignored)
- This token provides access to your GitHub account - treat it like a password

#### Recommended: Use a `.env` file

Create a `.env` file in the project root (make sure it's in `.gitignore`):

```bash
# .env
GITHUB_USER_SESSION=your_session_token_here
```

Then source it before running the scripts:

```bash
source .env
./ai_review_error_reporter.sh
```

## Output & Caching

### Cache Directories

The scripts create the following directories for caching (one file per workflow run):

#### `job_summary_url/`
**Content:** Raw URLs to job summary pages  
**Format:** Text files named `{run_id}.txt`  
**Example:** `18589302302.txt` → `/Expensify/App/actions/runs/18589302302/jobs/41169259293/summary_raw`  
**Purpose:** Avoids re-scraping HTML pages to find job summary URLs  
**Use Case:** URL mapping for direct access to job summaries

#### `job_summary_md/`
**Content:** Complete job summary markdown from GitHub  
**Format:** Markdown files named `{run_id}.md`  
**Example:** `18589302302.md` → Full AI review summary including errors, warnings, and statistics  
**Purpose:** Preserves the complete context of each review  
**Size:** Typically 5-50 KB per file  
**Use Case:** Full historical record of all AI review outputs

#### `job_errors/`
**Content:** Extracted error blocks from job summaries (between `---` delimiters)  
**Format:** Markdown files named `{run_id}.md`  
**Example:** Contains only the error sections with full context:
```markdown
---
❌ **Error:** This command requires approval
**File:** src/libs/actions/Report.ts
**Details:** Command execution blocked by security policy
---
```
**Purpose:** Structured error data with surrounding context  
**Use Case:** Contextual error analysis, pattern detection, debugging

#### `job_errors_titles/`
**Content:** Just the error message titles (one per line)  
**Format:** Text files named `{run_id}.txt`  
**Example:**
```
❌ **Error:** This command requires approval
❌ **Error:** could not determine current branch
```
**Purpose:** Quick frequency analysis without full context  
**Use Case:** Current aggregation reports, trend analysis

### Cached Data for Advanced Analysis

> **💡 Pro Tip:** The cached data in `job_errors/` and `job_summary_md/` contains rich contextual information beyond just error titles. This data can be leveraged for:
>
> - **Contextual Error Analysis:** Understanding which files, functions, or code patterns trigger specific errors
> - **Error Co-occurrence:** Identifying errors that frequently appear together in the same run
> - **Temporal Patterns:** Analyzing how errors evolve over time or correlate with code changes
> - **PR/Author Correlation:** Linking errors to specific pull requests or authors
> - **Error Classification:** Automatically categorizing errors by type (permissions, syntax, rate limits, etc.)
> - **Root Cause Analysis:** Tracing errors back to specific code changes using the full context
> - **Predictive Analysis:** Building models to predict potential errors before they occur
>
> The current aggregator focuses on frequency, but the cached data supports much deeper analysis. Consider building additional tools that parse `job_errors/` for contextual insights.

### Final Report

The final report (`job_error_report.md` by default) includes:
- **Generation timestamp** - When the report was created
- **Source information** - Which cache directory was analyzed
- **Files processed** - Number of workflow runs included
- **Summary statistics:**
  - Total error count
  - Unique error types
- **Frequency-ranked table** - Errors sorted by occurrence count
- **Error messages** - Full error text for each unique error

Example report structure:
```markdown
# Error Frequency Report

**Generated:** 2024-10-17 13:00:18
**Source Directory:** `job_errors_titles`
**Files Processed:** 50

## Summary
- **Total errors:** 127
- **Unique errors:** 15

## Error Breakdown
| Count | Error Message |
|------:|---------------|
| 45    | `This command requires approval` |
| 23    | `could not determine current branch` |
...
```

### Caching Behavior

The scripts use aggressive caching to avoid redundant API calls:
- ✅ **Once a workflow run is processed, all its data is cached locally**
- ✅ **Re-running the scripts will use cached data for previously processed runs**
- ✅ **New runs are automatically fetched and added to the cache**
- ✅ **Cache persists across script invocations** (stored on disk)
- ⚠️ **To force a refresh of specific runs, delete their corresponding cache files**
- ⚠️ **To start fresh, delete entire cache directories**

**Cache Efficiency:**
- First run (100 workflows): ~8-10 minutes
- Subsequent run (same 100): ~30 seconds (uses cache)
- Adding 10 new runs: ~1 minute (only fetches new data)

## Usage Examples

### Quick Analysis (Last 10 runs)
```bash
./ai_review_error_reporter.sh 10
```

### Comprehensive Analysis (Last 200 runs)
```bash
./ai_review_error_reporter.sh 200 comprehensive_report.md
```

### Re-analyze Cached Data
```bash
# Just run the aggregator on already-cached data
./job_error_aggregator.sh job_errors_titles updated_report.md
```

## Known Issues & Limitations

This section documents the current limitations and burning issues with the AI Review Error Reporter scripts.

### 🔥 Critical Issues

#### 1. **Authentication Method: Cookie-Based (Fragile)**
**Severity:** 🔴 High  
**Impact:** Script fails when cookie expires (typically every 30 days)

**Problem:**
- Uses `GITHUB_USER_SESSION` cookie which requires manual extraction from browser
- Cookie expires periodically, requiring manual renewal
- Not suitable for automated/CI environments
- Tied to a personal GitHub account

**Workaround:**
```bash
# Manual process required:
# 1. Open GitHub in browser
# 2. Open DevTools > Application > Cookies
# 3. Find user_session cookie
# 4. Copy and export:
export GITHUB_USER_SESSION="new_cookie_value"
```

---

#### 2. **HTML Scraping Instead of Official API**
**Severity:** 🔴 High  
**Impact:** Breaks if GitHub changes their HTML structure

**Problem:**
- Scrapes HTML pages to find job summary URLs:
  ```bash
  grep -oE -m 1 "/Expensify/App/actions/runs/${run_id}/jobs/[0-9]+/summary_raw"
  ```
- Fragile: Any change to GitHub's HTML breaks the script
- Requires authentication cookies (can't use API tokens)
- Slower than direct API access
- Not officially supported by GitHub

**Why:** Job summaries are not available through the official GitHub Actions API.

**Better Solution Available:**
Make the reviewer output its logs to GH artifacts instead as well as in summary. Artifacts can be retrieved via official GH CLI.

---

#### 3. **No Rate Limiting Handling**
**Severity:** 🟡 Medium  
**Impact:** Script fails silently when hitting GitHub API rate limits

**Problem:**
- No detection of rate limit status
- No retry logic when rate limited
- No waiting/backoff mechanism
- Silent failures that are hard to debug

**Manifestation:**
```bash
# Runs fine for 50-60 requests, then:
Processing run: 12345678
  No job summary found, skipping...  # Actually rate limited!
```

---

### ⚠️ Medium Priority Issues

#### 4. **Hardcoded Repository Path**
**Severity:** 🟡 Medium  
**Impact:** Can't easily use with other repositories

**Problem:**
```bash
# Hardcoded in the regex:
/Expensify/App/actions/runs/${run_id}/jobs/[0-9]+/summary_raw
```

**Workaround:** Edit the script to change repository path

---

#### 5. **Sequential Processing (Slow for Large Batches)**
**Severity:** 🟡 Medium  
**Impact:** Takes ~10-15 minutes to process 100 workflow runs

**Problem:**
- Processes one run at a time in a while loop
- Network latency multiplied by number of runs
- Could be parallelized for 5-10x speedup

**Current Performance:**
- 10 runs: ~1 minute
- 50 runs: ~5 minutes
- 100 runs: ~10 minutes
- 500 runs: ~50 minutes

**Potential Solution:** Implement parallel processing with `xargs -P` or GNU `parallel`.

---

#### 6. **No CI/CD Integration**
**Severity:** 🟡 Medium  
**Impact:** Can't run automatically in GitHub Actions or other CI systems

**Problem:**
- Requires manual cookie setup (not available in CI)
- No GitHub Actions workflow provided
- Can't leverage Actions cache for faster runs
- No automatic scheduling

---

#### 7. **Limited Error Context in Reports**
**Severity:** 🟡 Medium  
**Impact:** Hard to understand root causes from aggregated reports

**Problem:**
- Current aggregator only shows error titles
- Loses valuable context from `job_errors/` directory:
  - Which files triggered errors
  - Which PRs/branches were involved
  - Full error details and stack traces
  - Temporal patterns

**Example - What's Available:**
```markdown
| Count | Error Message |
|------:|---------------|
| 45    | `This command requires approval` |
```

**Example - What Could Be Available:**
```markdown
| Count | Error | Common Files | Common PRs | Trend |
|------:|-------|--------------|------------|-------|
| 45    | Command approval | src/libs/actions/*.ts | #12345, #12389 | ↑ +15% |
```

**Potential Solution:** Build enhanced analyzer that parses `job_errors/` for contextual data. See "Cached Data for Advanced Analysis" section above for ideas.

---

### 📝 Minor Issues

#### 8. **No Progress Indicators for Long Operations**
**Severity:** 🟢 Low  
**Impact:** Appears stuck during long runs

**Problem:**
```bash
Processing run: 18589302302
  Fetching job summary: https://github.com/...
  # Appears frozen here for 5-10 seconds
```

**Workaround:** Be patient, check network activity

**Potential Solution:** Add progress bars or timestamps to output

---

#### 9. **Cache Directories Not in .gitignore**
**Severity:** 🟢 Low  
**Impact:** Risk of committing large cache files

**Problem:**
- Cache directories (`job_summary_url/`, `job_summary_md/`, etc.) not automatically ignored
- Could accidentally commit 100s of cached files
- Increases repository size

**Solution:** Add to `.gitignore`:
```gitignore
# AI Review Error Reporter cache
/job_summary_url/
/job_summary_md/
/job_errors/
/job_errors_titles/
/job_error_report.md
```

---

#### 10. **No Automatic Cleanup of Old Cache**
**Severity:** 🟢 Low  
**Impact:** Cache grows unbounded over time

**Problem:**
- Old workflow run data cached forever
- Cache can grow to 100s of MB over months
- No automatic cleanup mechanism

**Workaround:** Manually delete old cache files periodically
```bash
# Delete cache files older than 30 days
find job_* -type f -mtime +30 -delete
```

---