# `@sentry/core` patches

### [@sentry+core+10.24.0+001+data-sentry-label-support.patch](@sentry+core+10.24.0+001+data-sentry-label-support.patch)

- Reason: Enhances the `htmlTreeAsString` function to support `data-sentry-label` attributes for better element identification in Sentry spans. The patch:
  - Always includes `data-sentry-label` in the list of checked attributes for each DOM element
  - Searches up to 15 levels up the DOM tree to find a `data-sentry-label` attribute
  - Prefixes the CSS selector with the found `data-sentry-label` value (e.g., `[data-sentry-label="MyLabel"] div.css-146c3p1.r-1udh08x.r-1udbk01.r-1iln25a > svg`)

  This allows us to identify UI elements by meaningful labels rather than just CSS selectors, making Sentry spans more actionable.
- Upstream PR/issue: https://github.com/getsentry/sentry-javascript/pull/18398
- E/App issue: https://github.com/Expensify/App/issues/76128
- PR Introducing Patch: https://github.com/Expensify/App/pull/76547
