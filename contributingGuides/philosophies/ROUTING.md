# Routing Philosophy
Learn how URLs are constructed and used to route users through all parts of the application.

[React Navigation](https://reactnavigation.org/) is the library used for all routing and navigation, so refer to it's [docs](https://reactnavigation.org/docs/getting-started) to understand how the library works. This page will not focus on how routing works, but how URLs are constructed and what patterns to follow when adding new URLs.

## Definitions
- URL - The web address for every page in the app. On web, this is shown on the browser bar, and is of the format `https://new.expensify.com/<route>`
- Route - A unique identifier of a specific location within the app's navigation hierarchy

## Rules
When adding new routes, or refactoring existing routes, follow these rules:

### - DO NOT start with a slash
### - DO use kebab-case for all parts of a URL (eg. words separated by hyphens)
### - DO use all lower case words
### - DO define all of them in `ROUTES.ts`

## Object Routes
Object Routes that uniquely identify a specific data element in the product (eg, a report, a workspace, etc) should aim for brevity, as they are generally the building blocks of other routes.

### - DO end with an ID in their path
Examples:

- `r/:reportID` the route for a specific report
- `workspace/:policyID` the route for a specific workspace

### - SHOULD NOT nest inside other object paths
If an object can be accessed by it's own ID that doesn't depend on any other object IDs, then only use the object's ID in the URL.

Examples:

```
// GOOD
r/:threadReportID

// BAD (the parentReportID is unnecessary to render the thread)
r/:parentReportID/:threadReportID
```

## Page Routes
Page Routes should attempt to reflect the navigational position in the UI hierarchy, ideally matching the names of the elements pressed to get there, similar to a "trail of breadcrumbs".

### - DO end with a page name
Examples:

- `r/:reportID/details` the route for the details of a specific report
- `workspace/:policyID/invite` the page where workspace invites are managed

