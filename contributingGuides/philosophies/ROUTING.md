# Routing Philosophy
Learn how URLs are constructed and used to route users through all parts of the application.

[React Navigation](https://reactnavigation.org/) is the library used for all routing and navigation, so refer to its [docs](https://reactnavigation.org/docs/getting-started) to understand how the library works. This page will not focus on how routing works, but how URLs are constructed and what patterns to follow when adding new URLs.

## Definitions
- URL - The web address for every page in the app. On web, this is shown on the browser bar, and is of the format `https://new.expensify.com/<route>`
- Route - A unique identifier of a specific location within the app's navigation hierarchy
- Object Route - A route pointing to a specific object (eg. report, transaction, workspace, etc.)
- Page Route - A route for a specific page (eg. settings, add bank account, etc.)

## Rules
When adding new routes, or refactoring existing routes, follow these rules:

### - MUST be unique
There are no aliases where different routes lead to the same place.

### - SHOULD be short
Aim for the shortest possible URL that is also still human readable.

Exceptions:
- When abbreviated paths are used in specific instances like `r/` (for reports) and `a/` (for accounts) for strategic purposes

### - SHOULD use human readable names before using IDs
Example:
1. `domain/expensify.com/settings` - It's better to use the domain name "expensify.com" rather than an ID because it is readable, won't ever change, and is not a privacy or security concern

Exceptions:
- When there would be PII (personally identifiable information) that would leak in the URL like email addresses, use an ID instead
- When the name can be updated but the path remains the same (eg. a workspace name), use an ID instead

### - MUST use kebab-case for all parts of a URL (eg. words separated by hyphens)
### - MUST use all lower case words
### - MUST be defined in `ROUTES.ts`
### - MUST convey page hierarchy
Just like breadcrumbs, the URL should reflect the path a user has taken.

Example of the paths taken to manage a workspace member:
1. `workspaces`
1. `workspaces/:policyID/overview`
1. `workspaces/:policyID/members`
1. `workspaces/:policyID/members/:memberID`

### - MUST have the route parameters validated
Since users can edit the route parameters at any time, to any value, the parameters must always be validated to ensure they are correct and the user has access.

### - MUST NOT start with a slash
### - MUST NOT contain jargon or acronyms
### - MUST NOT contain sensitive information that could be logged by third-parties
Internet routers and third-party-services can see and store any information in the URL. Do not put things like passwords, auth tokens, or PII (personally identifiable information).

### - SHOULD NOT use query parameters
Exceptions:
- When a URL needs to be encoded and added to the path (eg. `?backTo=URL`, `?forwardTo=URL`) - **Note: `backTo` parameter is deprecated and should not be used in new implementations**
- When complex data needs to be part of the path (eg. `/search?q=QUERY`)

### - SHOULD NOT use optional parameters
If there are optional parameters, use two separate route definitions instead to be explicit.

### - SHOULD use plural nouns when there are multiple objects that can exist
Exceptions:

- When abbreviated paths are used in specific instances like `r/` (for reports) and `a/` (for accounts) then plurality does not matter

### - SHOULD use only the minimal necessary information to render the page
Examples:
- `r/:threadReportID` GOOD - `threadReportID` is all that is needed and all the rest of the page can be derived from that
- `r/:parentReportID/:threadReportID` BAD - the `parentReportID` is not necessary so it just adds cruft to the URL

Exceptions:

- When multiple IDs are **required** to render the page.
