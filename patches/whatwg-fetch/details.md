# `whatwg-patches` patches

### [whatwg-fetch+3.6.2+001+use-microtask-queue-for-xhr-events.patch](whatwg-fetch+3.6.2+001+use-microtask-queue-for-xhr-events.patch)

- Reason:
  
    ```
    This patch replaces setTimeout(0) with queueMicrotask for XHR event handlers within the whatwg-fetch polyfill.
    ```
  
- Upstream PR/issue: https://github.com/JakeChampion/fetch/issues/1484
- E/App issue: https://github.com/Expensify/App/issues/90309
- PR introducing patch: https://github.com/Expensify/App/pull/94399
