import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars, no-underscore-dangle
declare const __GIT_BRANCH__: string;

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        policy?: Promise<Policy | undefined>;
        report?: Promise<Report | undefined>;
        transaction?: Promise<Transaction | undefined>;
        receipt?: Promise<Receipt | undefined>;
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export {};
