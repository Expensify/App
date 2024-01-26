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
    name: string;
    [key: string]: string;
};

export type {SigninParams, IsE2ETestSession, NetworkCacheMap, NetworkCacheEntry, TestConfig};
