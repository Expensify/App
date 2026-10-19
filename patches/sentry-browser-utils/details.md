# `@sentry/browser-utils` patches

### [@sentry+browser-utils+10.75.0+001+data-sentry-label.patch](@sentry+browser-utils+10.75.0+001+data-sentry-label.patch)

- Reason: Enhances the `htmlTreeAsString` function to support `data-sentry-label` attributes for better element identification in Sentry spans. The patch:
  - Always includes `data-sentry-label` in the list of checked attributes for each DOM element
  - Searches up to 15 levels up the DOM tree to find a `data-sentry-label` attribute
  - Prefixes the CSS selector with the found `data-sentry-label` value (e.g., `[data-sentry-label="MyLabel"] div.css-146c3p1.r-1udh08x.r-1udbk01.r-1iln25a > svg`)

  This allows us to identify UI elements by meaningful labels rather than just CSS selectors, making Sentry spans more actionable.

  `@sentry/browser-utils` ships its own copy of `htmlTreeAsString`, which INP, CLS and LCP spans, click breadcrumbs and Session Replay use. This logic used to be patched into the `@sentry/core` copy, which the browser SDK stopped calling after the upgrade to `@sentry/core` 10.73 (https://github.com/Expensify/App/commit/9689acf98e3), so labels disappeared from web spans from release 9.4.76 on.
- Upstream PR/issue: https://github.com/getsentry/sentry-javascript/pull/18398
- E/App issue: https://github.com/Expensify/App/issues/76128
- PR Introducing Patch: https://github.com/Expensify/App/pull/104340
