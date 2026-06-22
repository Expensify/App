# `expo-task-manager` patches

### [expo-task-manager+55.0.2+001+guard-null-headless-loader.patch](expo-task-manager+55.0.2+001+guard-null-headless-loader.patch)

- Reason:

    ```
    Fixes a fatal Android crash (Sentry APP-4FK) when expo-location delivers a background GPS update
    through expo-task-manager while the HybridApp process has no registered JS task manager.

    Trigger: the app registers a single TaskManager task (`background-location-tracking`) for GPS
    distance tracking via `Location.startLocationUpdatesAsync`. Android persists that registration
    across process death. When JobScheduler later wakes the app to deliver a location batch,
    `LocationTaskConsumer` → `TaskService.executeTask()` runs.

    Root cause: if `getTaskManager(appScopeKey)` is null (JS runtime not loaded), `executeTask()`
    falls into the headless path and calls `getAppLoader().loadApp(...)` without checking whether
    `getAppLoader()` returned null. That happens when `mContextRef` has been cleared after the
    process was killed.

    Patch: align with upstream PR #46449 — null-guard `getAppLoader()` in both
    `executeTask()` and `getAppLoader()` (including `mContextRef` itself). When the
    headless loader is unavailable, drop the queued event from `mTasksAndEventsRepository`
    and return so JobService finishes without crashing.
    ```

- Upstream PR/issue: https://github.com/expo/expo/pull/46449
- E/App issue: https://github.com/Expensify/App/issues/92416
- PR introducing patch: TBD