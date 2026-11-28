declare global {
    // Injected by Rspack's DefinePlugin at build time; empty string in non-development builds.
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
    const __GIT_BRANCH__: string;

    // Injected by Rspack's DefinePlugin at build time: whether `@sentry/webpack-plugin` stamped its
    // `applicationKey` into the chunks. Absent (hence optional) in bundles built without the app's
    // Rsbuild defines, such as Storybook.
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
    const __SENTRY_APPLICATION_KEY_STAMPED__: boolean | undefined;

    // Injected by Rspack's DefinePlugin at build time: the URL of the `canvaskit.wasm` binary matching the
    // CanvasKit glue bundled into this build (e.g. `/canvaskit-0.41.0.wasm`). Web only. See
    // `CANVASKIT_WASM_FILENAME` in `config/rsbuild/rsbuild.common.ts`.
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
    const __CANVASKIT_WASM_URL__: string;
}

export {};
