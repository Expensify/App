type RegisterPrefetchOnAppStartParams = {
    prefetchKey: string | undefined;
    command: string | undefined;
    url: string;
    fetchParams: RequestInit;
};

type RegisterPrefetchOnAppStart = (params: RegisterPrefetchOnAppStartParams) => void;

export default RegisterPrefetchOnAppStart;
