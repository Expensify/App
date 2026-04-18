---
ruleId: CLEAN-REACT-PATTERNS-6
title: Conditional mounting over conditional effects
---

## [CLEAN-REACT-PATTERNS-6] Conditional mounting over conditional effects

### Reasoning

When an effect's primary logic is wrapped in a readiness guard (e.g., `if (!isLoading) doThing()`), the effect runs on every change to the guard value but only does useful work when the condition is met. This creates unnecessary complexity and subtle bugs — the effect may fire too early, too often, or accumulate stale closures.

Instead, split into a wrapper that controls **when** the child mounts, and a child that runs setup on mount. This gives you clear lifecycle boundaries: the child can assume its preconditions are always met.

### Incorrect

```tsx
function VideoPlayer({ isLoading, videoId }) {
  useEffect(() => {
    // Guard: does nothing until loading is done
    if (isLoading) {
      return;
    }
    const player = initializePlayer(videoId);
    return () => player.destroy();
  }, [isLoading, videoId]);

  return <VideoView />;
}
```

Problems:
- Effect runs on every `isLoading` toggle, not just the meaningful transition
- Cleanup runs when `isLoading` flips back to `true`, even if the player should persist
- Dependency array mixes orchestration concerns (`isLoading`) with setup concerns (`videoId`)

### Correct

```tsx
function VideoPlayerWrapper({ isLoading, videoId }) {
  if (isLoading) {
    return <LoadingScreen />;
  }
  return <VideoPlayer videoId={videoId} />;
}

function VideoPlayer({ videoId }) {
  // Preconditions are guaranteed by the parent — no guards needed
  useEffect(() => {
    const player = initializePlayer(videoId);
    return () => player.destroy();
  }, [videoId]);

  return <VideoView />;
}
```

Benefits:
- `VideoPlayer` only exists when preconditions are met — simpler lifecycle
- No mixed concerns in dependency arrays
- Parent owns orchestration, child owns behavior (aligns with [CLEAN-REACT-PATTERNS-2](clean-react-2-own-behavior.md))

---

### Review Metadata

Flag ONLY when ALL of these are true:

- `useEffect` wraps its primary logic in a condition on props/state that represents "readiness" (e.g., `if (!isLoaded)`, `if (data === null)`)
- The component could be conditionally rendered by a parent instead
- The guard is not a minor early-return for an edge case, but the main control flow of the effect

**DO NOT flag if:**

- The effect genuinely needs to react to the value changing (not just on/off readiness)
- The condition is a minor null-check for safety, not the primary control flow
- The component is already at the top of the render tree (no parent to push the condition to)
- Splitting would require duplicating significant shared state or layout

**Search Patterns** (hints for reviewers):
- `useEffect`
- `if (!` or `if (` inside `useEffect`
