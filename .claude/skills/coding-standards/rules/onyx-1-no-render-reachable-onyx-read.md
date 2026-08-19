---
ruleId: ONYX-1
title: Keep synchronous Onyx reads off the render path
---

## [ONYX-1] Keep synchronous Onyx reads off the render path

### Reasoning

`Onyx.get()` reads the cache synchronously and never subscribe. During render it is a defect: the value freezes at that render, so the UI stays stale.

`no-unsafe-onyx-read` catches a read written inside a component, a hook or module scope. It reads one file at a time, so it cannot catch a read written correctly in a library function that a component or hook then calls. That is this rule. Full procedure: [caller-sweep.md](../../onyx-get/caller-sweep.md).

### Incorrect

```ts
// src/libs/ReportOwnerUtils.ts
function getReportOwnerAccountID(reportID: string) {
    return Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)?.ownerAccountID; // fine here
}

// src/hooks/useOwnerName.ts
function useOwnerName(reportID: string) {
    return getReportOwnerAccountID(reportID); // makes that read run during render
}
```

### Correct

```ts
function useOwnerName(reportID: string) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    return report?.ownerAccountID;
}
```

---

### Review Metadata

Two directions. A PR can arrive as either.

**Forward.** Flag when ALL are true:

- The diff adds a synchronous read to a function
- Some caller reaches it from a render position: a component or hook body at statement level, a `useMemo` callback, a `useOnyx` selector, a `useState` or `useReducer` lazy initializer, an IIFE, or a local function the body invokes
- Comment on the read, naming the calling file and line
- A caller that is itself a plain function is not a verdict: repeat the search on its name, until every path ends in a handler, an effect or an action creator

**Reverse.** Flag when ALL are true:

- The diff adds a call inside a component or a hook
- The callee's file contains a synchronous read
- The added call sits at a render position, not in a handler or an effect
- Comment on the added call

Search with the Grep tool, not `Bash`: this workflow allows `Bash` only for `gh pr diff`, `gh pr view` and `check-compiler.sh`. Callers of a read: Grep `src/` over `**/*.{ts,tsx}` for the function's name, ignoring imports and re-exports. Callee of a call: Grep that file for `Onyx.get`.

**DO NOT flag if:**

- The read sits in a `useCallback` body, an effect body, an event handler, a promise continuation or a timer that render does not invoke
- The reading function is not exported and nothing in its own file calls it from a render position
- The read is `useOnyx`, `Onyx.connect` or `Onyx.connectWithoutView`
- The value only reaches a handler argument or a request field and is never rendered

**Search Patterns** (hints for reviewers):
- `Onyx.get(`
