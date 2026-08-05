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

**Layout strategies (`narrowDestinationStrategy`, default `PRE_INSERT`):**

- `PRE_INSERT` (narrow layout only): eagerly pre-mounts the destination behind the RHP after the open transition, at idle priority.
- `REVEAL`: skips eager pre-mount; the destination is inserted and revealed together when `reveal()` runs. This is also the fallback used on wide layout always, and on narrow layout if pre-insert hasn't finished yet - correctness is identical either way, only the perf win differs.

**Reveal methods:**

- `reveal(afterTransition?)`: if the hook owns a pre-inserted narrow route, clears the pre-insert flag and dismisses the RHP over that route. Otherwise, inserts the destination under the RHP and then dismisses it (the `REVEAL`-strategy path above).
- `cleanupPreMount()`: removes the owned pre-inserted destination before a back-out path closes the RHP without revealing the destination. Safe to call unconditionally - no-ops if this instance never pre-inserted anything.

**Other invariants:**

- Only one component may own a pre-inserted route at a time. `reveal()` logs a warning if the global pre-insert flag is set by a different flow when it runs - a sign the previous owner didn't clean up.
- A **report** destination pushes as a route between origin and RHP (`[origin, RHP] -> [origin, destination, RHP]`); a **tab** target (e.g. Search) is a tab switch instead (`[Tab(A), RHP] -> [Tab(B), RHP]`). Determined by the destination route, not caller-configured.

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

Pre-inserting is a real second screen mounted concurrently with the RHP - its own Onyx connections, effects, and any API calls it fires on mount all run whether or not the user ever reveals it. If they back out, `cleanupPreMount()` removes the route but not the work that mount already triggered. Weigh that cost, don't just check the preconditions:

- Destination is not known in advance
- There is no modal/RHP to dismiss
- The destination is already the screen behind the modal
- The destination is heavy or rarely actually reached from this dismiss path (most users back out rather than submit) - pre-inserting on every open pays the concurrent-mount cost far more often than it pays off. Profile the actual dismiss-to-reveal ratio, not just transition speed
- The RHP is a fast, single-step flow with little dwell time - idle-priority pre-insert needs a real window to land before dismiss, or you pay the mount cost with none of the perf win
- The transition is already fast enough on its own. Profile first, do not add complexity speculatively
- Flow-specific dismiss strategies that do not use pre-insert/reveal already handle this correctly (e.g. `dismissModalWithReport`, a strategy in `submitDismissStrategies.ts`). Keep those helpers rather than replacing working code to use the "standard" hook
- The caller is reaching for `shouldPreservePreInsertedRouteOnUnmount` as a default way to sidestep cleanup ordering rather than because a genuinely different component finishes the dismiss - this option was pushed back on hard during the hook's original review ("it seems like this flag being set would defeat the purpose of the hook") and should be justified, not default

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
