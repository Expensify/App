import type {TEST_NAMES} from 'tests/e2e/config';
import type {ValueOf} from 'type-fest';

type SigninParams = {
    email?: string;
};

type IsE2ETestSession = () => boolean;

type NetworkCacheEntry = {
    url: string;
    options: RequestInit;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
};

type NetworkCacheMap = Record<
    string, // hash
    NetworkCacheEntry
>;

type TestConfig = {
    name: ValueOf<typeof TEST_NAMES>;
    [key: string]: string | {autoFocus: boolean};
};

type TestResult = {
    /** Name of the test */
    name: string;

    /** The branch where test were running */
    branch?: string;

    /** Duration in milliseconds */
    duration?: number;

    /** Optional, if set indicates that the test run failed and has no valid results. */
    error?: string;

    /** Render count */
    renderCount?: number;
};

export type {SigninParams, IsE2ETestSession, NetworkCacheMap, NetworkCacheEntry, TestConfig, TestResult};
