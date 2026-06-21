# Dialog

Globally-mounted, promise-returning dialogs built on **[react-call](https://react-call.desko.dev/)**. Each dialog is a Callable — a component that's also a namespace with `.call()`, `.upsert()`, `.end()`, and `.update()` methods.

## Contract

- **One Root mount per Callable, near the app root.** `App.tsx` renders `<Confirm />`, `<Decision />`, `<HoldMenu />`, and `<HRSyncResults />` as siblings inside the global provider chain. Mounting any of them in a second place throws _"Multiple instances of <Root> found!"_.
- **Call from anywhere on the client.** `await Confirm.call({...})` returns `Promise<DialogResponse>` (`{action: 'CONFIRM' | 'CLOSE' | 'ERROR'}`).
- **Stacking model.** `call()` always pushes a new Call onto the per-Callable stack and react-call renders **every** active Call simultaneously (verified in `react-call/dist/main.js`). There is NO library-level queue. If you need serial behavior, `await` each call before issuing the next.
- **Singletons via `upsert()`.** `upsert()` reuses the open Call if one exists and returns the same promise; otherwise it opens a fresh one. Use for rapid-tap offline confirms, single-instance toasts, progress.
- **Cross-Callable concurrency is unmanaged.** Firing `Decision.upsert(...)` and `HRSyncResults.call(...)` from unrelated callsites in the same render will mount both visually. The only coordination layer is the consumer — see `useHRSyncResultsOnComplete` for the `useIsAnyModalActive` gate pattern.
- **Submit lifecycle via `useMutationFlow`.** Plain confirms close on submit. If the caller passes `onConfirm` (a `MutationFn<DialogResponse>`), the dialog stays open during `pending` and on rejection — the wrapped handler resolves with `ERROR` (not silent global rejection). The handler owns when to call `call.end({...})`; it can dispatch CONFIRM, CLOSE, or any custom path.
- **Dismissal channels** (Escape, Android back, backdrop tap) flow to `call.end({action: 'CLOSE'})`. The exit animation runs while `call.ended === true`; the Callable unmounts after `EXIT_ANIMATION_DELAY_MS`.
- **Per-Callable ErrorBoundary scopes the entire body.** Each Callable's user-component returns `<DialogErrorBoundary><Inner /></DialogErrorBoundary>`; ALL hook calls live inside `<Inner>` so a throw from `useOnyx`/`useLocalize`/`useMutationFlow` resolves the awaiting promise with `{action: 'ERROR'}` instead of escaping to the App boundary and hanging.

## Usage

```tsx
import {Confirm, DialogActions} from '@components/Dialog';

async function onDelete() {
    const result = await Confirm.call({
        title: 'Delete?',
        prompt: 'This cannot be undone.',
        submit: {text: 'Delete', variant: 'danger'},
        cancel: {text: 'Cancel'},
    });
    if (result.action === DialogActions.CONFIRM) {
        // user confirmed
    } else if (result.action === DialogActions.ERROR) {
        // render or mutationFn threw — already logged
    }
}
```

### Singletons — `upsert()`

When the same dialog could be triggered repeatedly and shouldn't stack (e.g. rapid avatar taps while offline):

```tsx
Confirm.upsert({title: 'You appear to be offline', submit: {text: 'OK'}});
```

The first call mounts the Call; subsequent `upsert()`s patch the same Call's props and return the same promise. Use `call()` everywhere else.

### Async submit — `onConfirm`

When the submit button runs an async action and the dialog should stay open during pending, pass `onConfirm`:

```tsx
await Confirm.call({
    title: 'Confirm payment',
    submit: {text: 'Pay', variant: 'success'},
    onConfirm: async (call) => {
        await api.pay();
        call.end({action: DialogActions.CONFIRM});
    },
});
```

If `onConfirm` rejects, the dialog auto-resolves with `{action: 'ERROR'}` (the Confirm handler wraps `onConfirm` in a try/catch that logs and ends the Call with `ERROR`). Cancel still closes via `{action: 'CLOSE'}`. The submit button shows a loading state while `onConfirm` is pending.

## Callables

| Callable | Purpose |
|---|---|
| `Confirm` | Single-action confirm (optional cancel); supports `onConfirm` (`MutationFn<DialogResponse>`) for async submit. |
| `Decision` | Two-option (or sole-option) decision with discriminated `firstOptionText` union. |
| `HoldMenu` | Pay/approve hold-menu with discriminated partial/full variants; submit fires `useHoldMenuSubmit`. |
| `HRSyncResults` | Right-docked sync-result panel for HR providers (Gusto/TriNet). |

## Anti-patterns

- **Don't mount a Callable twice.** Each `<Confirm />` registers a Root; the second one throws on the first `Confirm.call()`. The single mount lives in `App.tsx`.
- **Don't reuse `call()` for things that shouldn't stack.** Use `upsert()` for offline confirms, single-instance toasts, progress indicators.
- **Don't assume serial behavior across Callables.** Two unrelated callsites firing different Callables in the same render commit will both mount. Gate on `useIsAnyModalActive()` when a visual race matters (see `useHRSyncResultsOnComplete`).
- **Don't put hooks outside `<Inner>`.** A throw in a hook above the boundary escapes to the App boundary and the awaited promise hangs forever. Restructure as `createCallable(({call, ...props}) => <DialogErrorBoundary><Inner call={call} {...props} /></DialogErrorBoundary>)`.
