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

export type {SigninParams, IsE2ETestSession, NetworkCacheMap, NetworkCacheEntry, TestConfig};
