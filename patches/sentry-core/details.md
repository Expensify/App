# `@sentry/core` patches

### [@sentry+core+10.76.2+001+initial.patch](@sentry+core+10.76.2+001+initial.patch)

- Reason: Adds `request-id` from fetch response headers to spans, making it easier to correlate Sentry data with backend logs.
- Upstream PR/issue: N/A
- E/App issue: https://github.com/Expensify/App/issues/75588
- PR Introducing Patch: https://github.com/Expensify/App/pull/79883
