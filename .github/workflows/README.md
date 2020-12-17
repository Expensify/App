# [Expensify.cash](https://expensify.cash) GitHub Workflows

## Security Rules 🔐
1. Do **not** use `pull_request_target` trigger unless an external fork needs access to secrets, or a _write_ `GITHUB_TOKEN`.
1. Do **not ever** write a `pull_request_target` trigger with an explicit PR checkout, e.g. using `actions/checkout@v2`. This is [discussed further here](https://securitylab.github.com/research/github-actions-preventing-pwn-requests)
1. **Do use** the `pull_request` trigger as it does not send internal secrets and only grants a _read_ `GITHUB_TOKEN`.   
1. If an external action needs access to any secret (`GITHUB_TOKEN` or internal secret), use the commit hash to prevent a modification of underlying source code at that version.
1. When creating secrets, use tightly scoped secrets that only allow access to that specific action's requirement
1. Review all modifications to our workflows with extra scrutiny, it is important to get it correct the first time.
1. Test workflow changes in your own public fork, for example: https://github.com/Andrew-Test-Org/Public-Test-Repo
1. Only trusted users will be allowed write access to the repository, however, it's good to add logic checks in actions to prevent human error.

## Further Reading 📖
1. https://securitylab.github.com/research/github-actions-preventing-pwn-requests
1. https://stackoverflow.com/a/62143130/1858217
