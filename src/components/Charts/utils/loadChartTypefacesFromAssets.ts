import type {SkTypeface} from '@shopify/react-native-skia';

type ChartFontLoadErrorHandler = (assetKey: string, error: unknown) => void;

function getAssetKeys<TKey extends string>(assets: Record<TKey, unknown>): TKey[] {
    return Object.keys(assets).filter((key): key is TKey => key in assets);
}

async function loadChartTypefacesFromAssets<TAsset, TKey extends string>(
    assets: Record<TKey, TAsset>,
    loadFn: (assetKey: TKey, asset: TAsset) => Promise<SkTypeface | null>,
    onError?: ChartFontLoadErrorHandler,
): Promise<Record<TKey, SkTypeface | null>> {
    const assetKeys = getAssetKeys(assets);
    const entries: Array<[TKey, SkTypeface | null]> = await Promise.all(
        assetKeys.map(async (assetKey) => {
            try {
                const typeface = await loadFn(assetKey, assets[assetKey]);
                return [assetKey, typeface];
            } catch (error: unknown) {
                onError?.(assetKey, error);
                return [assetKey, null];
            }
        }),
    );

    const typefaces: Partial<Record<TKey, SkTypeface | null>> = {};

    for (const [assetKey, typeface] of entries) {
        typefaces[assetKey] = typeface;
    }

    // Every key in `assets` is loaded above, so the partial record is complete.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return typefaces as Record<TKey, SkTypeface | null>;
}

export default loadChartTypefacesFromAssets;
