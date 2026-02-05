# `@sentry/browser` patches

### [@sentry+browser+10.24.0+001+request-id-support.patch](@sentry+browser+10.24.0+001+request-id-support.patch)

Reason: improve developer experience by adding `request-id` to spans related to API calls. This takes request-id from response headers and write it to the span related to that response. With that information it is easier to connect backend request / logs with data retrieved from Sentry.
- Upstream PR/issue: N/A
- E/App issue: https://github.com/Expensify/App/issues/75588
- PR Introducing Patch: https://github.com/Expensify/App/pull/79883