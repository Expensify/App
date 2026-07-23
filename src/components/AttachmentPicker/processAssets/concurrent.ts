/**
 * Processes the picked assets concurrently. This is the default strategy on every platform except iOS
 * (see sequential.ts), where decoding the whole selection at once can exhaust the native memory budget.
 */
function processAssets<T>(assets: T[], processAsset: (asset: T) => Promise<void>): Promise<void> {
    return Promise.all(assets.map(processAsset)).then(() => undefined);
}

export default processAssets;
