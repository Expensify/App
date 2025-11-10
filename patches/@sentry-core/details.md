# `@sentry/core` patches

### [@sentry+core+10.20.0.patch](@sentry+core+10.20.0.patch)

- Reason: We want to have request's ID in the Sentry's span attributes list so we access it in response's header while the `http.client` span is active. We are not able to get this in our codebase as when we call `Sentry.getActiveSpan` the target span is already finished. 
- Upstream PR/issue: N/A - change is specific to E/app
- E/App issue: https://github.com/Expensify/App/issues/73324
- PR introducing patch: https://github.com/Expensify/App/pull/74193