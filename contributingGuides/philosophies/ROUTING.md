# Routing Philosophy
Learn how URLs are constructed and used to route users through all parts of the application.

[React Navigation](https://reactnavigation.org/) is the library used for all routing and navigation, so refer to its [docs](https://reactnavigation.org/docs/getting-started) to understand how the library works. This page will not focus on how routing works, but how URLs are constructed and what patterns to follow when adding new URLs.

## Definitions
- URL - The web address for every page in the app. On web, this is shown on the browser bar, and is of the format `https://new.expensify.com/<route>`
- Route - A unique identifier of a specific location within the app's navigation hierarchy
- Object Route - A route pointing to a specific object (eg. report, transaction, workspace, etc.)
- Page Route - A route for a specific page (eg. settings, add bank account, etc.)

This guide is based on [[PSR-1]] and [[PSR-2]].
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and
"OPTIONAL" in this document are to be interpreted as described in [[RFC 2119]].

## Rules
When adding new routes, or refactoring existing routes, follow these rules:

### - MUST be unique
There should not be any aliases where different routes lead to the same place.

### - SHOULD be short
Aim for the shortest possible URL that is also still human readable.

### - MUST use kebab-case for all parts of a URL (eg. words separated by hyphens)
### - MUST use all lower case words
### - MUST be defined in `ROUTES.ts`
### - MUST convey page hierarchy
Just like breadcrumbs, the URL should reflect the path a user has taken.

Example of the paths taken to manage a workspace member
1. `workspaces`
1. `workspaces/:policyID/overview`
1. `workspaces/:policyID/members`
1. `workspaces/:policyID/members/:memberID`

### - MUST ALWAYS have the route parameters validated
Since users can edit the route parameters at any time, to any value, the parameters must always be validated to ensure they are correct and the user has access.

Exceptions:
- When abbreviated paths are used in specific instances like `r/` (for reports) and `a/` (for accounts) for strategic purposes

### - MUST NOT start with a slash
### - MUST NOT contain jargon or acronyms
### - MUST NOT contain sensitive information that could be logged by third-parties
Internet routers and third-party-services can see and store any information in the URL. Do not put things like passwords, auth tokens, or PII (personally identifiable information).

### - SHOULD NOT use query parameters
Exceptions:
- When a URL needs to be encoded and added to the path (eg. `?exitTo=URL`)
- When complex data needs to be part of the path (eg. `/search?q=QUERY`)

### - SHOULD NOT use optional parameters
If there are optional parameters, use two separate route definitions instead to be explicit.

## Object Routes
Object Routes that uniquely identify a specific data element in the product (eg, a report, a workspace, etc) should aim for brevity, as they are generally the building blocks of other routes.

### - MUST end with an ID in their path
Examples:

- `settings/wallet/card/:cardID` the route for a specific credit card
- `workspace/:policyID` the route for a specific workspace

### - MUST use plural nouns when there are multiple objects that can exist
Exceptions:

- When abbreviated paths are used in specific instances like `r/` (for reports) and `a/` (for accounts) then plurality does not matter

### - MUST NOT nest inside other object paths
If an object can be accessed by its own ID that doesn't depend on any other object IDs, then only use the object's ID in the URL.

Examples:
- `r/:threadReportID` GOOD - uses the minimum information required
- `r/:parentReportID/:threadReportID` BAD - the `parentReportID` is not necessary so it just adds cruft to the URL

Exceptions:

- When multiple IDs are **required** to render the page.

## Page Routes
Page Routes should attempt to reflect the navigational position in the UI hierarchy, ideally matching the names of the elements pressed to get there, similar to a "trail of breadcrumbs".

### - MUST end with a page name
Examples:

- `workspaces` the page to manage workspaces
- `settings/wallet` the page where you manage your settings

### - MAY contain an ID in the path
Examples:

- `r/:reportID/details` the route for the details of a specific report
- `workspace/:policyID/invite` the page where workspace invites are managed

