### Async vs. Sync Code

Async code is everywhere in our app: API calls, storage access, background tasks, test scripts, GitHub Actions, and more. This document explains how and when to use sequential vs. parallel async flows, and why our rules exist.

## Why this matters

- Clarity: Async/await makes inherently sequential logic easier to read and review.
- Performance: Parallelizing independent work avoids unnecessary delays.
- Consistency: Shared rules make it easier for contributors inside and outside Expensify to write reliable code.

## Rules

### - Sequential flows SHOULD use async/await
   When order matters, `async/await` expresses intent in a clear, linear style.
   Example: Upload a file → Parse it → Save results.

    ```ts
    const uploaded = await uploadFile(file);
    const parsed = await parseReceipt(uploaded.url);
    await saveExpense(parsed);
    ```

### - Independent steps MUST be run in parallel
   If two operations don’t depend on each other, start them together. Here are the different ways to run them in parallel:

   - **`Promise.all`**: All must succeed, fails fast on first rejection. Use when you need every result.

     ```ts
     const [user, permissions] = await Promise.all([
      getUser(),
      getPermissions(),
     ]);
     ```

   - **`Promise.allSettled`**: Wait for everything, regardless of failures. Use when you don't need all results.

     ```ts
     const results = await Promise.allSettled([syncReceipts(), syncInvoices(), syncReports()]);
     const succeeded = results.filter(r => r.status === 'fulfilled');
     const failed = results.filter(r => r.status === 'rejected');
     ```

   - **`Promise.any`**: Return the first successful result, ignore failures until one resolves. Great for redundant sources.

     ```ts
     const fastConfig = await Promise.any([
       fetchFromCDN(),
       fetchFromBackup(),
       fetchFromLocalMirror(),
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

  ```ts
  function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
      setTimeout(resolve, ms);
  });
  }
  ```

   * Creating deferred promises (signals like “ready” or “loaded”).

  ```ts
  let resolveReady: () => void;

  const isReady = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });

  // later in the code
  resolveReady();
  ```

## More Examples

### 1) Error handling SHOULD use `.catch()`

Error handling style depends on context. If you’re handling a single async operation, `.catch()` is concise and effective.

```ts
// PREFERRED
async function getData(url: string) {
  const data = await fetch(url).catch(() => fetchFallback(url));
  return process(data);
}
```

```ts
// BAD — needs an outer let just to span try/catch, adds noise and requires a mutable variable
async function getData(url: string) {
  let data: DataType | undefined;
  try{
      data = await fetch(url)
  } catch (e){
      data = fetchFallback(url)
  }
  return process(data);
}
```

If you need to handle multiple sequential async operations, `try/catch` provides cleaner flow and better readability.

```ts
async function getData(url: string) {
  try {
    const response = await fetch(url);
    const data = await response.json();
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
const dataPromise = useMemo(() => loadDashboard(), []);
use(dataPromise);
```
