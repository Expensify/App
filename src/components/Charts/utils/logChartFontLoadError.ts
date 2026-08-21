import Log from '@libs/Log';

function logChartFontLoadError(assetKey: string, error: unknown): void {
    Log.hmmm('Chart font asset failed to load', {
        assetKey,
        error: error instanceof Error ? error.message : String(error),
    });
}

export default logChartFontLoadError;
