type RegisterPrefetchOnAppStartParams = {
    prefetchKey: string | undefined;
    command: string | undefined;
    url: string;
    fetchParams: RequestInit;

    /** The JWT the request sent in its Authorization header instead of its body, undefined when the body carries the token */
    headerAuthToken?: string;
};

type RegisterPrefetchOnAppStart = (params: RegisterPrefetchOnAppStartParams) => void;

export default RegisterPrefetchOnAppStart;
