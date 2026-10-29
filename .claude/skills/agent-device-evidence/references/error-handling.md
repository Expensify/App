# Error handling matrix

Lookup table for handling specific failure modes. Read this when a phase or gate fails and you need to choose between exit, retry, mark-and-continue, or warn-and-proceed.

| Situation | Action |
| --- | --- |
| Source URL missing or not a recognised PR/issue URL | Exit `8 BAD_INPUT` |
| Steps section missing or empty (PR `### Tests` / issue `## Action Performed:`) | Exit `3 NO_FLOWS` |
| Only out-of-scope platforms checked on issue (e.g. `MacOS: Chrome / Safari` only) | Exit `4 PLATFORM_UNSUPPORTED` |
| mWeb / Desktop / Windows explicitly requested via `--platforms` | Exit `4 PLATFORM_UNSUPPORTED` |
| Bring-up fails (HybridApp gate, missing dev build, Metro start, etc.) | Surface parent skill's error verbatim; exit `7 BRING_UP_FAILED` |
| Phase 1 step uninterpretable by LLM | Mark flow `phase1_failed`, log the step that failed, continue to next flow |
| Phase 1 a11y empty (0 nodes) on a screen | Use coordinate fallback; log `warnings: ["a11y_fallback:<screen>"]` |
| Phase 1 `$TEST_FLOW.ad` empty after warm-up | Mark flow `phase1_failed`, continue |
| Phase 2 `replay` fails on a step | Mark flow `phase2_failed`, continue. |
| `record stop` produces 0-byte file | Retry Phase 2 once for that flow; if still empty, mark `phase2_failed` |
| Android flow exceeds 3-min cap | Mark `phase2_failed`, continue (per-flow MP4s should rarely hit this; if they do, the Tests section is too coarse-grained) |
