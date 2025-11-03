# `@rock-js/provider-s3` patches

### [@rock-js+provider-s3+0.11.5+001+support-public-bucket-access.patch](@rock-js+provider-s3+0.11.5+001+support-public-bucket-access.patch)

- Reason:

    ```
    This patch adds support for public S3 bucket access when no credentials are provided. 
    The library originally required credentials for all S3 operations, but we need to support 
    public buckets that don't require authentication to allow all contributors to use remote cached builds. The patch 
    adds an else clause that configures a no-op signer and empty credentials when no access 
    keys, role ARN, or profile is provided.
    ```

- Upstream PR/issue: 🛑 TODO 
- E/App issue: https://github.com/Expensify/App/issues/62296
- PR introducing patch: https://github.com/Expensify/App/pull/73525

