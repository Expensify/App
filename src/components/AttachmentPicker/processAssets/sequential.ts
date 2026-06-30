/**
 * Processes the picked assets one at a time. Each HEIC asset decodes to a full native bitmap during
 * conversion, and on iOS HybridApp the process shares a single jetsam memory budget with the resident OldDot,
 * so converting the whole selection at once can allocate N large bitmaps simultaneously and OOM (Sentry
 * APP-63S). Sequencing keeps at most one heavy decode alive at a time.
 */
async function processAssets<T>(assets: T[], processAsset: (asset: T) => Promise<void>): Promise<void> {
    for (const asset of assets) {
        // The sequencing is the whole point here: await each decode before starting the next.
        // eslint-disable-next-line no-await-in-loop
        await processAsset(asset);
    }
}

export default processAssets;
