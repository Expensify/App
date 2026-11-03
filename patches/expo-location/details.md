# `expo-location` patches

### [expo-location+57.0.6+001+guard-failed-last-location-task.patch](expo-location+57.0.6+001+guard-failed-last-location-task.patch)

- Reason:

    ```
    Fixes a fatal Android crash when the user revokes the location permission while a GPS distance
    trip is being tracked and then returns to the app.

    Trigger: the app registers a background location task (`background-location-tracking`) via
    `Location.startLocationUpdatesAsync` for GPS distance tracking. Android keeps delivering
    location broadcasts to `LocationTaskConsumer.didReceiveBroadcast` after the permission is
    revoked. When a broadcast carries no `LocationResult`, the consumer falls back to querying
    `mLocationClient.lastLocation`, which now fails with a `SecurityException`.

    Root cause: `didReceiveBroadcast` reads `task.result` inside an `addOnCompleteListener`
    callback. `task.result` calls `getResult()`, which rethrows the task's failure as a
    `RuntimeExecutionException`. The callback runs asynchronously on the main looper, long after
    the enclosing `try` block has returned, so the surrounding `catch (e: SecurityException)` can
    never catch it and the exception reaches the main thread unhandled:

        FATAL EXCEPTION: main
        com.google.android.gms.tasks.RuntimeExecutionException: java.lang.SecurityException:
          uid 10845 does not have any of [ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION].
            at com.google.android.gms.tasks.zzw.getResult(...)
            at expo.modules.location.taskConsumers.LocationTaskConsumer.didReceiveBroadcast$lambda$2

    Nothing on the JS side can prevent this, because the broadcast is delivered to the native
    receiver independently of JS and keeps arriving after location updates are declined.

    Patch: check `task.isSuccessful` and bail out with a log line before reading `task.result`.
    The existing outer `try/catch` is kept, because `lastLocation` can also throw synchronously.

    Note: `expo-location` ships a prebuilt AAR (see the `publication` entry in its
    `expo-module.config.json`), so this source patch only takes effect because `expo-location` was
    added to `expo.autolinking.android.buildFromSource` in `package.json`. Do not remove it there
    while this patch exists, or the crash silently comes back.
    ```

- Upstream PR/issue: None. Expo's bug tracker requires a standalone minimal reproduction, and the
  faulty branch is only reached by a post-revocation location broadcast that carries no
  `LocationResult`. We could not synthesize such a broadcast outside the app, so there is no report
  we could file that Expo would accept. The bug is still unpatched on Expo `main`, `sdk-57` and
  `expo-location@57.0.15`, so upgrading does not remove the need for this patch — it must stay until
  the upstream code changes.
- E/App issue: https://github.com/Expensify/App/issues/99183
- PR introducing patch: https://github.com/Expensify/App/pull/101091
