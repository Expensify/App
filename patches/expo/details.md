# `expo` patches

### [expo+54.0.10+001+fix-missing-blob-variable-error.patch](expo+54.0.10+001+fix-missing-blob-variable-error.patch)

- Reason:

    ```
    This patch fixes error when submitting receipt to smart scan. Expo has a bug that caued issues when sending receipt
    in the request - `Property 'blob' doesn't exist`
    ```

- Upstream PR/issue: https://github.com/expo/expo/issues/40059
- E/App issue: 
- PR introducing patch: https://github.com/Expensify/App/pull/69535
