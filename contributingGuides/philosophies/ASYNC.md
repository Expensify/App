### Async vs. Sync Code

Async code is everywhere in our app: API calls, storage access, background tasks, test scripts, GitHub Actions, and more. This document explains how and when to use sequential vs. parallel async flows, and why our rules exist.

## Why this matters

- Clarity: Async/await makes inherently sequential logic easier to read and review.
- Performance: Parallelizing independent work avoids unnecessary delays.
- Consistency: Shared rules make it easier for contributors inside and outside Expensify to write reliable code.

## Rules

### -Use async/await for sequential flows
   When order matters, `async/await` expresses intent in a clear, linear style.
   Example: Upload a file → Parse it → Save results.

    ```ts
    const uploaded = await uploadFile(file);
    const parsed = await parseReceipt(uploaded.url);
    await saveExpense(parsed);
    ```

### - Independent steps MUST be run in parallel
   If two operations don’t depend on each other, start them together.
   Example: Fetch user data and permissions concurrently with `Promise.all`.

    ```ts
    const [user, permissions] = await Promise.all([
    getUser(),
    getPermissions(),
    ]);
    ```

### - UI SHOULD launch independent async calls in parallel
   Components should not wait for one API call before starting another unless there is a dependency. Rendering must never be blocked by network requests.

   Refer to [DATA-BINDING.md](./DATA-BINDING.md) for full details.

### - Sequential logic SHOULD be encapsulated outside the UI
   If a flow really must happen in order, write it in `src/libs/` or an action/helper. The UI should call that as a single logical operation.


### - `async/await `SHOULD be preferred over `.then/.catch`
   Use `async/await` unless you’re:

   * Wrapping callback-based APIs.
   * Creating deferred promises (signals like “ready” or “loaded”).

## More Examples

### 1) Error handling

```ts
async function getData(url: string) {
  const data = await fetch(url).catch(() => fetchFallback(url));
  return process(data);
}
```

OR

```ts
async function getData(url: string) {
  try {
    const data = await fetch(url);
    return process(data);
  } catch (error) {
    const data = fetchFallback(url);
    return process(data);
  }
}
```

### 2) Passing promises to `use` and other helpers

```ts
// An async function returns a promise and can be passed to helpers expecting a promise
const dataPromise = loadDashboard();
use(dataPromise);
```

### 3) When to use raw Promises

* Wrap callback-based APIs.
* Deferred promise for signaling readiness.

```ts
let resolveReady: () => void;

const isReady = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

// later in the code
resolveReady();
```