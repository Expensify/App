# `@lottiefiles/dotlottie-web` patches

### [@lottiefiles+dotlottie-web+0.44.0+001+fix-cors.patch](@lottiefiles+dotlottie-web+0.44.0+001+fix-cors.patch)

- Reason:

    ```
    Patch adds `https://cdn.expensify.com/` prefix to `cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0.44.0/dist/dotlottie-player.wasm`
    to fix CORS policy issue preventing lottie animations to load on web
    ```

- Upstream PR/issue: <Please create an upstream PR fixing the patch. Link it here and if no upstream issue or PR exists, explain why>
- E/App issue: <Please create an E/App issue ([template](./../.github/ISSUE_TEMPLATE/NewPatchTemplate.md)) for each introduced patch. Link it here and if patch won't be removed in the future (no upstream PR exists) explain why>
- PR introducing patch: https://github.com/Expensify/App/pull/69597
