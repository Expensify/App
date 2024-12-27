type PrepareRequestPayload = (data: Record<string, unknown>, initiatedOffline: boolean) => Promise<FormData>;

export default PrepareRequestPayload;
