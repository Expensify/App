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

**Layout strategies:**

- `PRE_INSERT` (narrow layout only): eagerly pre-mounts the destination behind the RHP after the open transition, at idle priority.
- `REVEAL`: skips eager pre-mount; the destination is inserted and revealed together when `reveal()` runs. This fallback is used:
    - on wide layout always
    - on narrow layout if pre-insert hasn't finished yet

**Reveal methods:**

- `reveal(afterTransition?)`: if the hook owns a pre-inserted route, clears the pre-insert flag and dismisses the RHP over that route. Otherwise, inserts the destination under the RHP then dismisses it.
- `cleanupPreMount()`: removes the owned pre-inserted destination before a back-out path closes the RHP without revealing the destination. Safe to call unconditionally - no-ops if this instance never pre-inserted anything.

**Other invariants:**

- Only one component may own a pre-inserted route at a time. `reveal()` logs a warning if the global pre-insert flag is set by a different flow when it runs - a sign the previous owner didn't clean up.
- When the destination resolves to one of the app's root tabs (Home, Inbox, Search, Settings, or Workspaces), pre-insert switches to that tab instead of pushing (`[Tab(A), RHP] -> [Tab(B), RHP]`), with the original tab saved for restore-on-cancel. For any other destination, it pushes a new route between the origin and the RHP (`[origin, RHP] -> [origin, destination, RHP]`). Determined by the destination route, not caller-configured.

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

Pre-inserting is a real second screen mounted concurrently. Its effects run whether or not the user ever reveals it. If they back out, `cleanupPreMount()` removes the route but not the work that mount already triggered:

- Destination is not known in advance
- There is no modal/RHP to dismiss
- The destination is already the screen behind the modal
- The destination is heavy or rarely actually reached from this dismiss path. In these cases, pre-inserting on every open pays the concurrent-mount cost more often than it pays off
- The transition is already fast enough on its own
- Flow-specific dismiss strategies that do not use pre-insert/reveal already handle this correctly (e.g. `dismissModalWithReport`, a strategy in `submitDismissStrategies.ts`). Keep those helpers rather than replacing working code to use the "standard" hook
- The caller is reaching for `shouldPreservePreInsertedRouteOnUnmount` to sidestep cleanup ordering. It exists only for the case where a genuinely different component finishes the dismiss after this one unmounts - anywhere else it leaves a pre-inserted route with no owner left to clean it up

### Review Metadata

Flag when:

- `usePreMountDestination` is used in a flow that does not dismiss an RHP/modal to reveal a different fullscreen destination
- `usePreMountDestination` is used with a destination that is not stable/known at mount time
- A caller relies on `reveal(afterTransition)` for work that must happen before navigation, such as validation, target-route selection, or a synchronous write needed before the destination is revealed
- A back-out path closes the RHP without calling `cleanupPreMount()` when the component owns a pre-inserted route
- A submit path unmounts the component before `reveal()` runs but does not preserve the pre-inserted route with `shouldPreservePreInsertedRouteOnUnmount`
- `shouldPreservePreInsertedRouteOnUnmount` is passed without a clear reason a *different* component finishes the dismiss - if nothing else picks up the pre-insert, this just delays cleanup rather than serving its purpose
- New code reimplements pre-insert timing, back-out cleanup, or reveal-before-dismiss orchestration inline instead of using the hook, even if it avoids a direct `preInsertFullscreenUnderRHP` call

**DO NOT flag if:**

- The code uses `usePreMountDestination` correctly with the matching reveal method for the flow
- The flow uses specialized dismiss helpers that intentionally bypass pre-insert/reveal

**Search patterns:**

- `preInsertFullscreenUnderRHP`
- `usePreMountDestination`
- `revealRouteBeforeDismissingModal`
- `PRE_INSERT_FULLSCREEN_DELAY`
