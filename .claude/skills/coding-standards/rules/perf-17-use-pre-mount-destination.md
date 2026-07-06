---
ruleId: PERF-17
title: Use usePreMountDestination for RHP-to-fullscreen pre-mounting
---

## [PERF-17] Use usePreMountDestination for RHP-to-fullscreen pre-mounting

### Reasoning

Modal-to-destination flows need the destination mounted before the RHP dismisses, otherwise users see a gap (narrow layout) or a flash of the previous page (wide layout). `usePreMountDestination` centralizes the lifecycle: idle-priority pre-insert on narrow layout, reveal-before-dismiss on wide layout, and automatic back-out cleanup. Numeric timeout timing exists only to match current legacy call sites until they are migrated.

When reviewing these flows, focus on whether the navigation lifecycle is correct for the user path: the destination is stable at mount time, reveal is called at the right moment, synchronous work stays outside `reveal()`, and cleanup/preservation is handled on back-out or unmount.

### Incorrect

```tsx
const {reveal} = usePreMountDestination(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID));

const handleSubmit = () => {
    reveal(() => {
        submitWriteThatMustRunBeforeNavigation();
    });
};
```

### Correct

```tsx
const {reveal} = usePreMountDestination(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID));

const handleSubmit = () => {
    submitWriteThatMustRunBeforeNavigation();
    reveal();
};
```

---

### Hook API (compatibility surface)

**Narrow pre-insert scheduling:**

| Option | Matches current usage |
|--------|----------------------|
| `preInsertTiming: 'idle'` (default) | New flows — React scheduler idle priority |
| `preInsertTiming: 300` | `IOURequestStepConfirmation` pre-insert timer parity |
| `preInsert: false` | Reveal-only usage where mount-time pre-insert should be skipped |

**Reveal methods:**

| Method | Matches current usage |
|--------|----------------------|
| `reveal(afterTransition?)` | pre-inserted narrow dismiss, wide reveal-before-dismiss, missed pre-insert fallback |
| `cleanupPreMount()` | `IOURequestStartPage.navigateBack` explicit cleanup before closing the RHP |

Keep flow-specific checks and synchronous work outside the hook. For example, "destination report is already focused" should be handled by the caller before calling `reveal()`. Pass `reveal(afterTransition)` only for work that must run after the dismiss/reveal transition.

Call `cleanupPreMount()` on every back-out path that closes the RHP without calling `reveal()`. This removes any pre-inserted destination before the modal closes.

Mount-time pre-insert always waits for the RHP open transition before scheduling pre-insert work. If no upcoming transition starts within 500ms, the hook proceeds with the configured pre-insert timing.

### Review Focus

Prioritize judgment-based issues:

- Whether the flow is actually an RHP/modal-to-different-fullscreen reveal
- Whether the destination is stable and known when the hook mounts
- Whether the caller keeps flow-specific checks and synchronous writes outside `reveal()`
- Whether a back-out path calls `cleanupPreMount()`
- Whether an unmount-before-submit flow needs `shouldPreservePreInsertedRouteOnUnmount`

### When to use

Use `usePreMountDestination` when **all** of these are true:

- The flow dismisses an RHP/modal to reveal a **different** fullscreen destination
- The destination route is **known at mount time** (static `ROUTES.*` builder)
- The user spends enough time on the confirmation screen for pre-insert to complete before dismiss (narrow layout)
- The transition currently has a visible gap or flash worth fixing

### When NOT to use

- Destination is not known in advance
- There is no modal/RHP to dismiss
- The destination is already the screen behind the modal
- The transition is already fast enough — profile first, do not add complexity speculatively
- Flow-specific dismiss strategies that do not use pre-insert/reveal (`dismissRHPToReport`, `dismissSuperWideRHP`, `dismissNarrowWithReport`) — keep those helpers

### Review Metadata

Flag when:

- `usePreMountDestination` is used in a flow that does not dismiss an RHP/modal to reveal a different fullscreen destination
- `usePreMountDestination` is used with a destination that is not stable/known at mount time
- A caller relies on `reveal(afterTransition)` for work that must happen before navigation, such as validation, target-route selection, or a synchronous write needed before the destination is revealed
- A back-out path closes the RHP without calling `cleanupPreMount()` when the component owns a pre-inserted route
- A submit path unmounts the component before `reveal()` runs but does not preserve the pre-inserted route with `shouldPreservePreInsertedRouteOnUnmount`
- New code reimplements pre-insert timing, back-out cleanup, or reveal-before-dismiss orchestration inline instead of using the hook, even if it avoids a direct `preInsertFullscreenUnderRHP` call

**DO NOT flag if:**

- The code uses `usePreMountDestination` correctly with the matching pre-insert timing and reveal method for the flow
- The call site is an approved exception (`IOURequestStepConfirmation`, `useSkipConfirmationPreInsert` until migrated)
- The flow uses specialized dismiss helpers that intentionally bypass pre-insert/reveal

**Search Patterns**:

- `preInsertFullscreenUnderRHP`
- `usePreMountDestination`
- `revealRouteBeforeDismissingModal`
- `PRE_INSERT_FULLSCREEN_DELAY`
