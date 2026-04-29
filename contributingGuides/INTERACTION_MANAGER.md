# InteractionManager Migration

## Why

`InteractionManager` is being removed from React Native. We currently maintain a patch to keep it working, but that's a temporary measure and upstream libraries will also drop support over time.

Rather than keep patching, we're replacing `InteractionManager.runAfterInteractions` with purpose-built alternatives that are more precise.

## Current state

`runAfterInteractions` is used across the codebase for a wide range of reasons: waiting for navigation transitions, deferring work after modals close, managing input focus, delaying scroll operations, and many other cases that are hard to classify.

## The problem

`runAfterInteractions` is a global queue with no granularity. This made it a convenient catch-all, but the intent behind each call is often unclear. Many usages exist simply because it "just worked" as a timing workaround, not because it was the right tool for the job.

This makes the migration non-trivial: you have to understand *what each call is actually waiting for* before you can pick the right replacement.

## The approach

**TransitionTracker** is the backbone. It tracks navigation transitions explicitly, so other APIs can hook into transition lifecycle without relying on a global queue.

On top of TransitionTracker, existing APIs gain transition-aware callbacks:

- Navigation methods accept `afterTransition` — a callback that runs after the triggered navigation transition completes
- Navigation methods accept `waitForTransition` — the call waits for all ongoing transitions to finish before navigating
- Keyboard methods accept `afterTransition` — a callback that runs after the keyboard transition completes
- `useConfirmModal` hook's `showConfirmModal` returns a Promise that resolves **after the modal close transition completes**, so any work awaited after it naturally runs post-transition — no explicit `afterTransition` callback needed

This makes the code self-descriptive: instead of a generic `runAfterInteractions`, each call site says exactly what it's waiting for and why.

> **Note:** `TransitionTracker.runAfterTransitions` is an internal primitive. Application code should use the higher-level APIs (`Navigation`, `useConfirmModal`, etc.) rather than importing TransitionTracker directly.

## How
The migration is split into 9 issues. Current status of the migration can be found in the parent Github issue [here](https://github.com/Expensify/App/issues/71913). 

## Primitives comparison

For reference, here's how the available timing primitives compare:

### `requestAnimationFrame` (rAF)

- Fires **before the next paint** (~16ms at 60fps)
- Guaranteed to run every frame if the thread isn't blocked
- Use for: UI updates that need to happen on the next frame (scroll, layout measurement, enabling a button after a state flush)

### `requestIdleCallback`

- Fires when the runtime has **idle time** — no pending frames, no urgent work
- May be delayed indefinitely if the main thread stays busy
- Accepts a `timeout` option to force execution after a deadline
- Use for: Non-urgent background work (Pusher subscriptions, search API calls, contact imports)

### `InteractionManager.runAfterInteractions` (legacy — do not use)

- React Native-specific. Fires after all **ongoing interactions** (animations, touches) complete
- Tracks interactions via `createInteractionHandle()` — anything that calls `handle.done()` unblocks the queue
- In practice, this means "run after the current navigation transition finishes"
- Problem: it's a global queue with no granularity — you can't say "after _this specific_ transition"

### Summary

|                        | Timing                    | Granularity               | Platform              |
| ---------------------- | ------------------------- | ------------------------- | --------------------- |
| `rAF`                  | Next frame (~16ms)        | None — just "next paint"  | Web + RN              |
| `requestIdleCallback`  | When idle (unpredictable) | None — "whenever free"    | Web + RN (polyfilled) |
| `runAfterInteractions` | After animations finish   | Global — all interactions | RN only               |
