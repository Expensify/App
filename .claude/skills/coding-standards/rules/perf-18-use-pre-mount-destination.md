---
ruleId: PERF-18
title: Use usePreMountDestination for RHP-to-fullscreen pre-mounting
---

## [PERF-18] Use usePreMountDestination for RHP-to-fullscreen pre-mounting

### Reasoning

Modal-to-destination flows need the destination mounted before the RHP dismisses. Otherwise users see a gap on narrow layout or a flash of the previous page on wide layout.

`usePreMountDestination` centralizes this lifecycle:

- Idle-priority pre-insert on narrow layout, with a fallback timer so the work is not starved
- Reveal-before-dismiss fallback on wide layout or if narrow pre-insert has not finished
- Automatic cleanup for back-out and unmount paths

When reviewing these flows, focus on whether the navigation lifecycle is correct for the user path:

- The destination route is stable at mount time
- `reveal()` is called only after validation, synchronous writes, and target-route selection are complete
- The caller handles flow-specific no-op cases before calling `reveal()`
- Cleanup or preservation is handled on back-out and unmount

### Incorrect

```tsx
const destinationRoute = buildDestinationRoute(itemID);
const {reveal} = usePreMountDestination(destinationRoute);

const handleSubmit = () => {
    reveal(() => {
        saveDataRequiredByDestination();
    });
};
```

### Correct

```tsx
const destinationRoute = buildDestinationRoute(itemID);
const {reveal} = usePreMountDestination(destinationRoute);

const handleSubmit = () => {
    saveDataRequiredByDestination();
    reveal();
};
```

---

### Hook API

**Reveal methods:**

- `reveal(afterTransition?)`: if the hook owns a pre-inserted narrow route, clears the pre-insert flag and dismisses the RHP over that route. Otherwise, inserts the destination under the RHP and then dismisses it.
- `cleanupPreMount()`: removes the owned pre-inserted destination before a back-out path closes the RHP without revealing the destination.

**Caller responsibilities:**

- Keep flow-specific checks and synchronous work outside the hook.
- Handle no-op cases before calling `reveal()`, such as when the destination route is already the active fullscreen route behind the modal.
- Pass `reveal(afterTransition)` only for work that must run after the dismiss/reveal transition.
- Call `cleanupPreMount()` on every back-out path that closes the RHP without calling `reveal()`.

**Scheduling:**

- Mount-time pre-insert always waits for the RHP open transition before scheduling idle pre-insert work.
- If no upcoming transition starts within 500ms, the hook proceeds with idle pre-insert scheduling. This only prevents missing the RHP open transition; broader transition timing changes should be discussed separately.

### Review Focus

Prioritize judgment-based issues:

- Whether the flow is actually an RHP/modal-to-different-fullscreen reveal
- Whether the destination is stable and known when the hook mounts
- Whether the caller keeps flow-specific checks and synchronous writes outside `reveal()`
- Whether the caller handles no-op cases where the destination is already active
- Whether a back-out path calls `cleanupPreMount()`
- Whether an unmount-before-submit flow needs `shouldPreservePreInsertedRouteOnUnmount`

### When to use

Use `usePreMountDestination` when **all** of these are true:

- The flow dismisses an RHP/modal to reveal a **different** fullscreen destination
- The destination route is **known at mount time**
- The user spends enough time on the confirmation screen for pre-insert to complete before dismiss (narrow layout)

### When NOT to use

- Destination is not known in advance
- There is no modal/RHP to dismiss
- The destination is already the screen behind the modal
- The transition is already fast enough. Profile first, do not add complexity speculatively
- Flow-specific dismiss strategies that do not use pre-insert/reveal. Keep those helpers

### Review Metadata

Flag when:

- `usePreMountDestination` is used in a flow that does not dismiss an RHP/modal to reveal a different fullscreen destination
- `usePreMountDestination` is used with a destination that is not stable/known at mount time
- A caller relies on `reveal(afterTransition)` for work that must happen before navigation, such as validation, target-route selection, or a synchronous write needed before the destination is revealed
- A back-out path closes the RHP without calling `cleanupPreMount()` when the component owns a pre-inserted route
- A submit path unmounts the component before `reveal()` runs but does not preserve the pre-inserted route with `shouldPreservePreInsertedRouteOnUnmount`
- New code reimplements pre-insert timing, back-out cleanup, or reveal-before-dismiss orchestration inline instead of using the hook, even if it avoids a direct `preInsertFullscreenUnderRHP` call

**DO NOT flag if:**

- The code uses `usePreMountDestination` correctly with the matching reveal method for the flow
- The flow uses specialized dismiss helpers that intentionally bypass pre-insert/reveal

**Search patterns:**

- `preInsertFullscreenUnderRHP`
- `usePreMountDestination`
- `revealRouteBeforeDismissingModal`
- `PRE_INSERT_FULLSCREEN_DELAY`
