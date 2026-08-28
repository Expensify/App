---
name: onyx-get
description: Onyx.get() reads an Onyx key once, asynchronously, and never subscribes. Use when writing or reviewing an Onyx read outside render, when a component or hook gains a call into a library function, or when converting a function off forwarded Onyx parameters or module-level caches.
---

`await Onyx.get(key)` reads a key once and never subscribes, so it belongs in code that runs on an event: action creators, libraries, network handlers, and callbacks such as `useCallback`, `useEffect` and event handlers. Prefer a pure function that takes the data as a parameter first. `Onyx.get()` is the answer when threading the value through every caller is the only thing that parameter buys.

**The rules are in [ONYX-DATA-MANAGEMENT.md](../../../contributingGuides/philosophies/ONYX-DATA-MANAGEMENT.md#reading-onyx-data-useonyx-onyxget-and-onyxconnectwithoutview).** Read that section before writing or converting a read.

In EApp every read goes through `@libs/OnyxUtils.get`, which takes a `ReadableOnyxKey`: the Search snapshot keys do not compile. One that is only a `string` until runtime still reaches the wrapper, which throws in development and reports in production.

`npm run lint-changed` runs `no-unsafe-onyx-read`, which checks three things: not during render, not at module scope, and not after an un-awaited write in the same body. It does not check anything below.

The rules rest on two properties of the read. It samples the cache when it is called and the Promise only defers delivery, so `await` cannot wait for a write queued before it. Its result is the cached object itself rather than a copy, so mutating a single-key result corrupts the cache with no subscriber notified.

`Onyx.get` resolves only after `Onyx.init`.

The rest are in `ONYX-1` (`.claude/skills/coding-standards/rules/onyx-1-no-render-reachable-onyx-read.md`), which carries the caller sweep and the shapes lint cannot see: a read reached from render through a caller, a write in the caller with the read one call away, and a mutated read result. Apply it when writing the read, not only when reviewing it.
