# `yargs` patches

### [yargs+17.7.2.patch](yargs+17.7.2.patch)

- Reason:

    ```
    Node 26 applies the nearest package.json "type" field to extensionless files. yargs 17 declares
    "type": "module" and exposes the extensionless ./yargs file as the require entry for the
    yargs/yargs subpath, so requiring it on Node 26 fails with "require is not defined in ES module
    scope". This broke every CLI that requires yargs/yargs, including reassure (perf tests).

    The patch adds a yargs.cjs copy of the extensionless file and points the ./yargs require
    condition at it.
    ```

- Upstream PR/issue: https://github.com/yargs/yargs/issues/2068
- E/App issue: None — found during the Node 26 upgrade.
- PR introducing patch: https://github.com/Expensify/App/pull/96205
