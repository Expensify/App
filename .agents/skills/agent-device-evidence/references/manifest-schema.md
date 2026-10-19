# Manifest schema

`manifest.json` is written to the run root after all platforms complete. Read this when populating or consuming the manifest.

```json
{
  "source": {
    "kind": "pr",
    "number": 89475,
    "url": "https://github.com/Expensify/App/pull/89475",
    "title": "<source title>"
  },
  "platforms_requested": ["ios", "android"],
  "platforms_run": ["ios", "android"],
  "flows": {
    "ios": [
      {
        "id": 1,
        "title": "Test case 1: ...",
        "kind": "video",
        "path": "ios/flow-1.mp4",
        "stills": ["ios/flow-1-step-2-tap-signin.png"],
        "expected": "App will show error when creating new agent without name.",
        "status": "ok",
        "cached": true,
        "fingerprint": "a3f9b2c4...",
        "warnings": [],
        "params": {"email": "test+ci-89475-1@expensify.com"}
      }
    ],
    "android": [...]
  }
}
```

## Field semantics

- `source.kind` - `"pr"` or `"issue"`.
- `source.number` / `source.url` / `source.title` - identifying metadata, captured at fetch time.
- `platforms_requested` - what the invocation asked for (via `--platforms` or inferred from the body).
- `platforms_run` - subset of requested that actually executed (e.g. iOS-only when Android bring-up failed).
- `flows.<platform>[]` - one entry per declared flow on that platform.

## Per-flow fields

- `id` - 1-indexed flow number, stable within a run.
- `title` - flow label from the source body or LLM summary.
- `kind` - `"video"` (Phase 2 records MP4) or `"still"` (single screenshot, verify-only).
- `path` - artifact path relative to the run directory.
- `stills` - candidate per-step PNGs captured as a Phase 1 side effect.
- `expected` - free-form expected outcome from an issue's `## Expected Result:` block. Populated for issues, absent for PRs.
- `status` - one of: `ok`, `phase1_failed`, `phase2_failed`, `skipped_after_failure`.
- `cached` - `true` when the `.ad` came from the Phase 1 cache (Phase 1 skipped); `false` when Phase 1 ran fresh.
- `fingerprint` - the `sha256(precondition + json(steps) + platform)` used as the cache key.
- `warnings[]` - non-fatal annotations (e.g. `a11y_fallback:<screen>` when coordinate fallback was used).
- `params` - any context-derived values the driver chose (e.g. test email), captured for reproducibility.
