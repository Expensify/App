import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        policy?: Promise<Policy | undefined>;
        report?: Promise<Report | undefined>;
        transaction?: Promise<Transaction | undefined>;
        receipt?: Promise<Receipt | undefined>;
    }

    // Injected by webpack DefinePlugin at build time; empty string in non-development builds.
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
    const __GIT_BRANCH__: string;
}

export {};
