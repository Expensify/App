---
name: onyx-get
description: Onyx.get() reads the Onyx cache synchronously and never subscribes. Use when writing or reviewing an Onyx read outside render, when a component or hook gains a call into a library function, or when converting a function off forwarded Onyx parameters or module-level caches.
---

`Onyx.get(key)` returns what is in the cache right now and never subscribes, so it belongs only in code that runs on an event: action creators, libraries, network handlers, and callbacks such as `useCallback`, `useEffect` and event handlers. Before reaching for it, prefer a pure function that takes the data as a parameter. `Onyx.get()` is the answer when threading the value through every caller is the only thing that parameter buys.

**The rules are in [ONYX-DATA-MANAGEMENT.md](../../../contributingGuides/philosophies/ONYX-DATA-MANAGEMENT.md#reading-onyx-data-useonyx-onyxget-and-onyxconnectwithoutview).** Read that section before writing or converting a read. Every rule there has to hold at the call site.

`npm run lint-changed` runs `no-unsafe-onyx-read`, which checks three of them: not during render, not at module scope, and not after an un-awaited write in the same body. A clean run is not a verdict on the rest.

The rest are in `ONYX-1` (`.claude/skills/coding-standards/rules/onyx-1-no-render-reachable-onyx-read.md`), which carries the caller sweep and the two shapes lint structurally cannot see: a read reached from render through a caller, and a write in the caller with the read one call away. Apply it when writing the read, not only when reviewing it.
