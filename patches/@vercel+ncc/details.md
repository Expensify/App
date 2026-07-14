# `@vercel/ncc` patches

### [@vercel+ncc+0.38.1+001+typescript-6-rootdir.patch](@vercel+ncc+0.38.1+001+typescript-6-rootdir.patch)

- Reason:

    ```
    TypeScript 6 fails `npm run gh-actions-build` because ncc's bundled
    ts-loader calls `transpileModule` with `rootDir: undefined`, which strips
    the explicit `rootDir` from `.github/tsconfig.json` and triggers TS5011.
    This patch removes that override so ncc respects the configured rootDir
    while bundling GitHub Action scripts.
    ```

- Upstream PR/issue: https://github.com/vercel/ncc/pull/1316
- E/App issue: N/A
- PR introducing patch: N/A

### [@vercel+ncc+0.38.1+002+single-file-action-builds.patch](@vercel+ncc+0.38.1+002+single-file-action-builds.patch)

- Reason:

    ```
    Recent `googleapis`/`gaxios` dependencies use dynamic imports that cause
    ncc to emit async chunk files such as `522.index.js`. GitHub Actions in
    this repo are documented and consumed as self-contained `index.js` bundles,
    so this patch forces ncc's webpack build to merge chunks back into the
    entry file.
    ```

- Upstream PR/issue: N/A
- E/App issue: N/A
- PR introducing patch: N/A
