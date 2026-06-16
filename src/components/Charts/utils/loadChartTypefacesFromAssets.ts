import type {SkTypeface} from '@shopify/react-native-skia';

type ChartFontLoadErrorHandler = (assetKey: string, error: unknown) => void;

async function loadChartTypefacesFromAssets<TAsset, TKey extends string>(
    assets: Record<TKey, TAsset>,
    loadFn: (assetKey: TKey, asset: TAsset) => Promise<SkTypeface | null>,
    onError?: ChartFontLoadErrorHandler,
): Promise<Record<TKey, SkTypeface | null>> {
    const assetKeys = Object.keys(assets) as TKey[];
    const results = await Promise.allSettled(
        assetKeys.map(async (assetKey) => {
            try {
                const typeface = await loadFn(assetKey, assets[assetKey]);
                return [assetKey, typeface] as const;
            } catch (error: unknown) {
                onError?.(assetKey, error);
                return [assetKey, null] as const;
            }
        }),
    );

    const entries = results.map((result, index) => {
        const assetKey = assetKeys[index];

        if (result.status === 'fulfilled') {
            return result.value;
        }

        onError?.(assetKey, result.reason);
        return [assetKey, null] as const;
    });

    return Object.fromEntries(entries) as Record<TKey, SkTypeface | null>;
}

export default loadChartTypefacesFromAssets;
