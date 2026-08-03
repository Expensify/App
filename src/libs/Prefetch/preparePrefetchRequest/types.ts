type PreparePrefetchRequestResult = {
    prefetchKey?: string;
    prefetchHeaders?: Record<string, string>;
};

type PreparePrefetchRequest = (command: string | undefined) => PreparePrefetchRequestResult;

export default PreparePrefetchRequest;
