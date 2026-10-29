import ObjectUtils from '@src/types/utils/ObjectUtils';

import type {SkTypeface} from '@shopify/react-native-skia';

type ChartFontLoadErrorHandler = (assetKey: string, error: unknown) => void;

async function loadChartTypefacesFromAssets<TKey extends string, TAsset>(
    assets: Record<TKey, TAsset>,
    loadFn: (asset: TAsset) => Promise<SkTypeface | null>,
    onError?: ChartFontLoadErrorHandler,
): Promise<Record<TKey, SkTypeface | null>> {
    const assetKeys = ObjectUtils.typedKeys(assets);
    const typefaces = ObjectUtils.typedFromEntries<TKey, SkTypeface | null>(assetKeys.map((assetKey) => [assetKey, null]));

    await Promise.all(
        assetKeys.map(async (assetKey) => {
            try {
                typefaces[assetKey] = await loadFn(assets[assetKey]);
            } catch (error: unknown) {
                onError?.(String(assetKey), error);
                typefaces[assetKey] = null;
            }
        }),
    );

    return typefaces;
}

export default loadChartTypefacesFromAssets;
