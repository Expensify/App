# `@rock-js/platform-apple-helpers` patches

### [@rock-js+platform-apple-helpers+0.11.9+001+recalculate-fingerprint-for-local-builds-only.patch](@rock-js+platform-apple-helpers+0.11.9+001+recalculate-fingerprint-for-local-builds-only.patch)

- Reason:

    ```
    This patch prevents recalculating the fingerprint after pod installation, which caused fingerprint mismatches between CI and local builds.
    Local builds with the --local flag will still recalculate the fingerprint after pod installation.
    ```

- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/74400
- PR introducing patch: https://github.com/Expensify/App/pull/73525

