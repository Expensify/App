# `pusher-js` patches

### [pusher-js+8.3.0+001+ignore-malformed-http-frames.patch](pusher-js+8.3.0+001+ignore-malformed-http-frames.patch)

- Reason:

    ```
    When WebSockets are unavailable, pusher-js falls back to the xhr_streaming and xhr_polling transports.
    Those transports split the response into lines and pass any line that starts with o, a, m or c to
    JSON.parse without a try/catch. Forcepoint DLP adds its own script (`class FPClassifier {`) to Pusher's
    `application/javascript` stream, so JSON.parse throws out of the XHR progress handler and Sentry
    reports it (APP-27B).

    This patch skips any line that fails to parse, and skips an array (a) or close (c) frame whose payload
    is not an array. It emits nothing for a skipped line: an `error` event would reach Log.alert through
    PusherConnectionManager. Valid frames in the same response are still handled.

    Only dist/web/pusher-with-encryption.js is patched, because App imports `pusher-js/with-encryption`.
    ```

- Upstream PR/issue: https://github.com/pusher/pusher-js/issues/985 (fix: https://github.com/pusher/pusher-js/pull/984)
- E/App issue: https://github.com/Expensify/App/issues/102745
- PR introducing patch: https://github.com/Expensify/App/pull/102752
