## Proposal (revised)

### Please re-state the problem that we are trying to solve in this issue.

APP-HQP: on web, during first load on `/home`, an unhandled promise rejection is captured whose value is the bare string `No data found for key reportActions_undefined`. Because the rejection value is a string rather than an `Error`, Sentry has nothing to symbolicate, so the producer cannot be identified from the event itself.

### What is the root cause of that problem?

**First, the evidence @brunovjk asked for twice — where the string is, and is not, produced.**

The literal text `No data found for key ` does not exist anywhere in the shipping client:

| Searched | Hits |
| --- | --- |
| App `main` @ `8785718`, entire repo excluding `node_modules/` and `.git/` | 0 |
| Entire `node_modules/` tree of a clean install | 0 |
| `react-native-onyx` published tarballs, 16 versions sampled from 2.0.50 → 3.0.98 | 0 |
| GitHub code search `org:Expensify "No data found for key"` | 0 code results |

The obvious candidate is worth ruling out explicitly, because #66878 makes it tempting: **this is not the Onyx `canBeMissing` alert.** That alert read `useOnyx returned no data for key with canBeMissing set to false.` (react-native-onyx 2.0.95), later `…no data for key with canBeMissing set to false for key ${key}` (2.0.110+). Different wording, and it was a `Logger.logAlert` — it never rejected a promise. It is also gone: the identifier `canBeMissing` appears **nowhere** in the runtime of react-native-onyx `3.0.98`, the version App pins. So a `useOnyx({canBeMissing: false})` subscription resolving to `reportActions_undefined` cannot be the producer of this event, and guarding such a subscription would not fix APP-HQP.

That points to the rejection value originating outside the App bundle. I want to be straight about the consequence: **no App-side change can be *proven* to close APP-HQP until one event carries a stack.** But the path this rejection travels has two real defects that (a) guarantee any such rejection surfaces unhandled, and (b) do serious damage when one occurs. Both are worth fixing on their own merits.

**Defect 1 — the Pusher apply result is discarded.** This confirms the candidate @MelvinBot flagged above.

[`User.ts:913`](https://github.com/Expensify/App/blob/878571878b1ca5a22015f9abcdc1cd82382ff3ec/src/libs/actions/User.ts#L913) calls `applyOnyxUpdatesReliably(updates);` and drops the returned `Promise<void>`. Tracing the chain: `applyOnyxUpdatesReliably` → `OnyxUpdates.apply` → [`advanceLastUpdateIDAfterApply`](https://github.com/Expensify/App/blob/878571878b1ca5a22015f9abcdc1cd82382ff3ec/src/libs/actions/OnyxUpdates.ts#L211-L222), whose `.catch()` logs `[OnyxUpdateManagerError]` and then deliberately **rethrows** at `L221`. There is no `.catch()` boundary anywhere after that, so the rejection reaches `window.onunhandledrejection` with its value verbatim — matching the Sentry mechanism `auto.browser.global_handlers.onunhandledrejection` and the bare-string capture.

**Defect 2 — one rejected batch permanently poisons the Pusher queue.** I don't think this has been raised yet, and it is the more serious of the two.

[`pusherEventsPromise`](https://github.com/Expensify/App/blob/878571878b1ca5a22015f9abcdc1cd82382ff3ec/src/libs/actions/OnyxUpdates.ts#L51) is a module-level promise that [`applyPusherOnyxUpdates`](https://github.com/Expensify/App/blob/878571878b1ca5a22015f9abcdc1cd82382ff3ec/src/libs/actions/OnyxUpdates.ts#L105-L117) reassigns using `.then()` only — there is no `.catch()` in the chain. Once it rejects, every later batch is chained off a rejected promise, so the `reduce`'s `.then()` callbacks never run and `PusherUtils.triggerMultiEventHandler` is never invoked again. **For the remainder of the session the client applies no Pusher updates at all** — new messages, report updates and status changes stop arriving until the user reloads — and each subsequent event emits another unhandled rejection off the same poisoned chain. [`applyAirshipOnyxUpdates`](https://github.com/Expensify/App/blob/878571878b1ca5a22015f9abcdc1cd82382ff3ec/src/libs/actions/OnyxUpdates.ts#L119-L131) has the identical shape. This failure mode is independent of whatever produced the first rejection.

### What changes do you think we should make in order to solve the problem?

**1. `src/libs/actions/OnyxUpdates.ts` — make the serialized queues self-healing.**

In `applyPusherOnyxUpdates`, keep returning the rejecting promise to the caller so `advanceLastUpdateIDAfterApply` still declines to move the watermark, but reset the module-level `pusherEventsPromise` that sequences the *next* batch back to a resolved promise. Apply the same treatment to `airshipEventsPromise`. This restores correctness regardless of what the producer turns out to be, and it is the change I would prioritise.

**2. `src/libs/actions/User.ts:913` — handle the promise at the call site.**

Attach a `.catch()` to `applyOnyxUpdatesReliably(updates)` in the `MULTIPLE_EVENTS` handler. Normalize a non-`Error` rejection into `new Error(String(reason))` preserving the original text, and `Log.alert` it with `lastUpdateID` / `previousUpdateID` and the update event types so the next occurrence carries actionable context.

Deliberately **not** included: forcing a reconnect here. Recovery already exists by design — [`OnyxUpdates.ts:191-193`](https://github.com/Expensify/App/blob/878571878b1ca5a22015f9abcdc1cd82382ff3ec/src/libs/actions/OnyxUpdates.ts#L191-L193) states that keeping the watermark where it is "lets the next reconnect refetch and reapply the missed updates". Firing a reconnect per failed batch would storm as soon as a batch starts failing repeatedly.

**3. `src/setup/telemetry/setupSentry.ts` — land @MelvinBot's `beforeSend` normalization too.**

I originally listed this as an alternative and dismissed it as merely diagnostic. On reflection that was the wrong call: since the producer sits outside the bundle, this is the only change that will actually let us identify it. Steps 1 and 2 make the client resilient; step 3 makes the next occurrence diagnosable. I'd treat them as one PR rather than competing options.

**Tests**

- `tests/unit/OnyxUpdatesTest.ts` — reject one Pusher batch, then assert (a) that batch still rejects to its caller, (b) `lastUpdateIDAppliedToClient` is not advanced, and (c) a following valid batch is still applied. (c) fails on `main` today; that is the regression test for Defect 2.
- `tests/unit/PusherSubscribeTest.ts` — assert the `MULTIPLE_EVENTS` callback produces no unhandled rejection when the apply rejects, and that a `Log.alert` carrying the normalized `Error` and update context is emitted.
- A unit test on the `beforeSend` hook fed `hint.originalException = 'No data found for key reportActions_undefined'`, modeled on the APP-5J precedent at `tests/unit/RequestTest.ts:91-102`, asserting the event comes out carrying an `Error` with a stack and the original text preserved.

### What alternative solutions did you explore? (Optional)

- **Guarding a `useOnyx` subscription against an undefined report ID** — ruled out by the evidence above: subscriptions don't reject, and the alert that used to fire for them has different wording and no longer exists in `3.0.98`.
- **Catching inside `applyOnyxUpdatesReliably` rather than at the call site** — rejected, because it also serves [`subscribeToPushNotifications.ts:116`](https://github.com/Expensify/App/blob/878571878b1ca5a22015f9abcdc1cd82382ff3ec/src/libs/Notification/PushNotification/subscribeToPushNotifications.ts#L115-L117), which returns the promise to a native handler that should keep seeing failures.
- **`beforeSend` alone** — makes the next event diagnosable but leaves the poisoned Pusher queue in place, which is a live correctness bug today.
