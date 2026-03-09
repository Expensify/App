# PR #79834 `@ikevin127` review checklist for Feb 27, 2026

Source PR: https://github.com/Expensify/App/pull/79834

Date note:
- GitHub API shows these inline review comments at `2026-02-26 23:29:36Z` through `2026-02-26 23:52:17Z`.
- In `UTC+01:00`, that is `2026-02-27 00:29:36` through `2026-02-27 00:52:17`, which matches the Feb 27 review batch you asked for.

Reviewer guidance:
- `@ikevin127` later summarized the batch here: https://github.com/Expensify/App/pull/79834#issuecomment-3969923665
- Summary: `🔴 / 🟠 / 🟡` items should be addressed. `NAB` items are optional nice-to-haves.

Ranking note:
- Ordered from easiest to hardest to implement.
- Severity is copied from the review comment and does not reflect implementation effort.
- Checkbox state below reflects the current workspace snapshot verified on `2026-03-09`.
- `Status: Partial` means related refactoring exists, but the review ask is not fully satisfied yet.

## Ranked checklist

1. [x] Rename the blur active input element test file to follow the existing naming convention.
Severity: `🟢 NAB`
Why this is easiest: file naming cleanup only; no behavior change expected.
Requested outcome: use `BlurActiveInputElementTest.ts`.
Verification: done. `tests/unit/libs/Accessibility/BlurActiveInputElementTest.ts` exists and the old `blurActiveInputElementTest.ts` filename is no longer present.
Comment: https://github.com/Expensify/App/pull/79834#discussion_r2861851900
Affected area: `tests/unit/libs/Accessibility/`

2. [x] Add `wasOpenedViaKeyboard` to the custom `React.memo` comparison in `PopoverMenu`.
Severity: `🟡`
Why this is easy: localized comparator update with a straightforward validation path.
Risk if skipped: stale props can block re-rendering and preserve incorrect initial focus behavior.
Verification: done. `prevProps.wasOpenedViaKeyboard === nextProps.wasOpenedViaKeyboard` is present in `src/components/PopoverMenu.tsx`.
Comment: https://github.com/Expensify/App/pull/79834#discussion_r2861850706
Affected file: `src/components/PopoverMenu.tsx`

3. [ ] Remove or justify the unused exported `NavigationFocusManager` API surface.
Severity: `🟠`
Why this is still relatively small: this is mostly cleanup, but it requires checking tests and making sure no real consumer depends on the exported symbols.
Symbols called out by the review:
- `RetrievalMode`
- `getRetrievalModeForRoute`
- `getRouteFocusMetadata`
Verification: not done. These exports still exist in `src/libs/NavigationFocusManager/types.ts`, `src/libs/NavigationFocusManager/index.ts`, and `src/libs/NavigationFocusManager/index.web.ts`. Current workspace search shows app/runtime usage only in tests, which matches the reviewer concern.
Comment: https://github.com/Expensify/App/pull/79834#discussion_r2861799908
Affected area: `src/libs/NavigationFocusManager/`

4. [ ] Replace the forbidden double-cast in `ButtonWithDropdownMenu` with a properly typed ref and narrowing.
Severity: `🔴`
Why this is medium effort: the change is localized, but it touches cross-platform ref typing and focus restoration behavior.
Requested direction: use a union ref type such as `View | HTMLDivElement`, then narrow before calling `focus()`.
Risk if skipped: TypeScript is bypassed and native/runtime behavior can diverge or fail silently.
Verification: not done. The exact cast remains in `src/components/ButtonWithDropdownMenu/index.tsx`:
`(dropdownAnchor.current as unknown as HTMLElement)?.focus?.();`
Comment: https://github.com/Expensify/App/pull/79834#discussion_r2861798142
Affected file: `src/components/ButtonWithDropdownMenu/index.tsx`

5. [ ] Add shared `types.ts` files for the platform-specific module pairs that currently duplicate contracts.
Severity: `🔴`
Why this is medium effort: it spans multiple files and requires aligning shared types across web/native entry points.
Modules called out by the review:
- `src/components/ConfirmModal/focusRestore/index.ts` and `src/components/ConfirmModal/focusRestore/index.web.ts`
- `src/libs/Accessibility/blurActiveInputElement/index.ts` and `src/libs/Accessibility/blurActiveInputElement/index.native.ts`
Risk if skipped: platform contracts can drift independently.
Status: Partial.
Verification: the platform-specific module split exists, but the requested shared `types.ts` files do not. `src/components/ConfirmModal/focusRestore/index.ts` and `index.web.ts` still each declare `InitialFocusParams` separately, and neither flagged directory currently contains a `types.ts` file.
Comment: https://github.com/Expensify/App/pull/79834#discussion_r2861799632
Affected areas:
- `src/components/ConfirmModal/focusRestore/`
- `src/libs/Accessibility/blurActiveInputElement/`

6. [ ] Extract the duplicated focusability checks into a shared utility.
Severity: `🟡 NAB`
Why this is medium-to-harder effort: it is a small refactor, but it needs careful consolidation so both callers keep the same semantics.
Duplicate logic called out by the review:
- `isElementFocusable()` in `src/components/FocusTrap/FocusTrapForScreen/index.web.tsx`
- `isFocusableActionablePopoverCandidate()` in `src/components/PopoverMenu.tsx`
Requested direction: extract shared helpers such as `isElementFocusable()` and `isFocusableActionable()`.
Verification: not done. Both helpers still exist as local functions in their respective files and there is no shared focus utility in `src/libs/` or `src/components/`.
Comment: https://github.com/Expensify/App/pull/79834#discussion_r2861846146
Affected files:
- `src/components/FocusTrap/FocusTrapForScreen/index.web.tsx`
- `src/components/PopoverMenu.tsx`

7. [x] Split `NavigationFocusManager` into platform-specific entry points.
Severity: `🟠`
Why this is the most work: this is a structural refactor that changes module layout, shared types, import paths, and test coverage expectations.
Requested structure:
- `src/libs/NavigationFocusManager/index.ts`
- `src/libs/NavigationFocusManager/index.web.ts`
- `src/libs/NavigationFocusManager/types.ts`
Why the reviewer wants it: the current implementation is DOM-heavy and imported from all platforms even when native only needs no-op behavior.
Verification: done. The workspace now has `src/libs/NavigationFocusManager/index.ts`, `index.web.ts`, and `types.ts`, and the old standalone `src/libs/NavigationFocusManager.ts` file is deleted in the current worktree.
Additional verification: on `2026-03-09`, a headed Chrome run against `http://localhost:8082/workspaces/B339AE5B0FF347ED/categories` confirmed RHP-back focus restoration to `Add category` and `More` (`More` → `Settings` → RHP `Back`) in `3/3` runs each.
Comment: https://github.com/Expensify/App/pull/79834#discussion_r2861847706
Affected area: `src/libs/NavigationFocusManager`

## Suggested execution order if you want lowest churn

1. Do items `1`, `2`, and `4` first.
2. Decide whether item `3` should be handled as standalone cleanup or folded into item `7`.
3. Do item `5` before any further platform-module expansion.
4. Leave item `6` for last unless you want the NAB cleanup in the same pass as `PopoverMenu` work.
