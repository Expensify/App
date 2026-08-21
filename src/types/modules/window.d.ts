import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        // Lazy debug getters added by `addUtilsToWindow` on non-production builds. They read the Onyx cache
        // synchronously, so they resolve against the current route every time they are accessed.
        policy?: Policy;
        report?: Report;
        transaction?: Transaction;
        receipt?: Receipt;
    }

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
