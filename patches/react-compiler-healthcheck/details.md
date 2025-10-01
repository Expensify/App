# `react-compiler-healthcheck` patches

### [react-compiler-healthcheck+19.0.0-beta-8a03594-20241020+001+add-verbose-error-logging-option.patch](react-compiler-healthcheck+19.0.0-beta-8a03594-20241020+001+add-verbose-error-logging-option.patch)

- Reason:
  
    ```
    This patch adds verbose error logging option.
    ```
  
- Upstream PR/issue: https://github.com/facebook/react/pull/29080 and https://github.com/facebook/react/pull/29851
- E/App issue: https://github.com/Expensify/App/issues/44384
- PR introducing patch: https://github.com/Expensify/App/pull/44460

### [react-compiler-healthcheck+19.0.0-beta-8a03594-20241020+002+enable-ref-identifiers.patch](react-compiler-healthcheck+19.0.0-beta-8a03594-20241020+002+enable-ref-identifiers.patch)

- Reason:
  
    ```
    This patch allows mutating refs in certain components.
    ```
  
- Upstream PR/issue: https://github.com/facebook/react/pull/29916
- E/App issue: Same as the PR.
- PR introducing patch: https://github.com/Expensify/App/pull/45464


### [react-compiler-healthcheck+19.0.0-beta-8a03594-20241020+003+json.patch](react-compiler-healthcheck+19.0.0-beta-8a03594-20241020+003+json.patch)

- Reason:
  
    ```
    This patch adds --json option to healthcheck CLI.
    ```
  
- Upstream PR/issue: 🛑, commented in the App PR https://github.com/Expensify/App/pull/45915#issuecomment-3346345841
- E/App issue: https://github.com/Expensify/App/pull/45464
- PR introducing patch: https://github.com/Expensify/App/pull/45915