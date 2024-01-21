type SigninParams = {
    email?: string;
};

type IsE2ETestSession = () => boolean;

type NetworkCacheMap = Record<
    string, // hash
    {
        url: string;
        options: RequestInit;
        response: Response;
    }
>;

export type {SigninParams, IsE2ETestSession, NetworkCacheMap};
