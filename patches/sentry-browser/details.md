# `@sentry/browser` patches

### [@sentry+browser+10.73.0.patch](@sentry+browser+10.73.0.patch)

Reason: improve developer experience by adding `request-id` to XHR spans related to API calls. This takes `request-id` from response headers and writes it to the associated span, making it easier to correlate Sentry data with backend logs.
- Upstream PR/issue: N/A
- E/App issue: https://github.com/Expensify/App/issues/75588
- PR Introducing Patch: https://github.com/Expensify/App/pull/79883
