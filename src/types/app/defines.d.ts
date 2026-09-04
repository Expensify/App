declare global {
    // Injected by Rspack's DefinePlugin at build time; empty string in non-development builds.
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
    const __GIT_BRANCH__: string;

    // Injected by Rspack's DefinePlugin at build time: whether `@sentry/webpack-plugin` stamped its
    // `applicationKey` into the chunks. Absent (hence optional) in bundles built without the app's
    // Rsbuild defines, such as Storybook.
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
    const __SENTRY_APPLICATION_KEY_STAMPED__: boolean | undefined;
}

export {};
