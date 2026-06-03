# Sentry release adoption scripts

## `release-adoption-older-than.mjs`

Deterministic check for how many **production** New Expensify users (by Sentry **error** events) were on a release **strictly older** than a given version.

### Setup

1. Create a Sentry user auth token with `org:read` (and access to the `app` project):
   https://sentry.io/settings/account/api/auth-tokens/
2. Export it:

```bash
export SENTRY_AUTH_TOKEN='sntrys_...'
```

### Examples

Since `9.3.79-4` shipped on 2026-05-22, use either a fixed window or a rolling period:

```bash
cd App

# Rolling 14 days (default)
node scripts/sentry/release-adoption-older-than.mjs --threshold 9.3.79-4

# Since deploy
node scripts/sentry/release-adoption-older-than.mjs \
  --threshold 9.3.79-4 \
  --start 2026-05-22T00:00:00Z \
  --end 2026-06-03T23:59:59Z

# Snapshot (last 24h)
node scripts/sentry/release-adoption-older-than.mjs --threshold 9.3.79-4 --period 24h

# JSON for dashboards / CI
node scripts/sentry/release-adoption-older-than.mjs --threshold 9.3.79-4 --json
```

### What it measures

| Output | Meaning |
|--------|---------|
| `totalUniqueUsers` | `count_unique(user)` with `environment:production` in the window |
| `uniqueUsersOnOlderReleases` | Same, but filtered to `release:[...]` for all `new.expensify@*` builds **&lt; threshold** seen in the window |
| `percentOnOlderReleases` | Ratio of the two |

Version order matches Expensify mobile builds: `major.minor.patch-build` (e.g. `9.3.79-3` &lt; `9.3.79-4` &lt; `9.3.80-0`).

### Caveats

- **Proxy metric**: Sentry only sees users who emitted at least one error in the window, not all DAU/MAU.
- **Upgrades**: A user who errors on `9.3.78` and later on `9.3.90` counts toward both the per-release table and the “older” bucket for the OR query.
- **Long OR lists**: Many distinct old builds may force chunked queries; the script warns when sums may over-count.

For the same question via Cursor, the Sentry MCP `search_events` tool uses the same Discover API and logic.
