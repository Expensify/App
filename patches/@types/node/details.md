# `@types/node` patches

### [@types+node+26.6.5+001+promise-hooks-init-contract.patch](@types+node+26.6.5+001+promise-hooks-init-contract.patch)

- Reason:

    Port the existing two-hunk contract patch to the installed package. Correct two declarations in `@types/node` 26.6.5 `v8.d.ts` to match the native promise hooks used by the attachment and receipt validation tests. `Init.parent` is `Promise<unknown> | undefined`, because a newly created root has no parent. `PromiseHooks.onInit` returns `() => void`, because its cancellation function takes no arguments and synchronously removes that hook. The other hook declarations and all runtime implementations remain unchanged.

    The source is Node 26.12.1 `internal/promise_hooks`: `makeUseHook` binds both `stop` parameters, the hook list and callback. Normal `stop()` returns undefined and repeated cancellation is safe. The [Node 26.12.1 onInit documentation](https://nodejs.org/download/release/v26.12.1/docs/api/v8.html#promisehooksoninitinit) documents the returned cancellation function and requires a synchronous init callback. Native observations of that pinned runtime retain the actual root identity, absent parent and the root as parent of its continuation.

    The direct repository consumers are `observeAttachmentValidationRejection` in `tests/unit/hooks/useFilesValidation.test.ts` and `observeReceiptValidationRejection` in `tests/unit/hooks/useReceiptDrop.test.ts`. Both reject continuations, retain the real validation root, call `stop()` immediately after capture and repeat normal cancellation during finally cleanup. A native `nextTick` attaches nonthrowing transfer resolvers after initialization. `Init` also supplies `HookCallbacks.init`; no additional direct repository consumer was found.

    `v8.d.ts` declares `node:v8`, and `v8` re-exports it. `index.d.ts` references `v8.d.ts`; `ts5.6/index.d.ts` references `../v8.d.ts`. Both entry points use these same two hunks.

- Upstream PR/issue: None recorded. The declaration mismatch is source-backed; upstream publication has not been authorized.
- E/App issue: None recorded. Issue publication has not been authorized.
- PR introducing patch: Pending draft publication.

### Setup and checks

Apply this patch through `scripts/applyPatches.ts` in a new unbound installation with the exact package and lock contents, Node 26.12.1 runtime and local-package topology. Require no patch warning or failure, and inspect both resulting declarations and module entry-point resolution. Preserve the currently protected installation and caches. The owner records setup and resolution evidence and binds the replacement before independent focused verification.

Run focused App and Jest type checks with all authorized roots and applicable declarations, disabled emit and incremental writes; run focused lint and both observer suites. The observer tests explicitly reference the installed Node types. An observation against the old installation cannot establish that this declaration patch passes. Exact final-source compiler caches require separate setup before wrapper verification.

### Removal

Remove the patch only when the installed upstream declaration admits an undefined `Init.parent` and a precise zero-argument callable `onInit` cancellation return. Verify that `v8`, `node:v8`, `index.d.ts` and `ts5.6/index.d.ts` resolve those declarations. Both observer suites must retain actual native roots, immediate synchronous cancellation and finally cleanup, and focused type, lint and runtime checks must pass without the patch. A package-version upgrade alone does not establish these facts.
