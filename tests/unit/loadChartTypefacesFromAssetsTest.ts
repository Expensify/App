import type {SkTypeface} from '@shopify/react-native-skia';
import loadChartTypefacesFromAssets from '@components/Charts/utils/loadChartTypefacesFromAssets';

function makeMockTypeface(asset: string): SkTypeface {
    // Skia typefaces are native objects; tests only need a unique stand-in per asset.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {id: asset} as unknown as SkTypeface;
}

describe('loadChartTypefacesFromAssets', () => {
    it('should return null for failed keys and typefaces for successful keys', async () => {
        const assets = {
            KEY_A: 'asset-a',
            KEY_B: 'asset-b',
        };
        const loadFn = jest.fn(async (asset: string) => {
            if (asset === 'asset-b') {
                throw new Error('Failed to load asset-b');
            }

            return makeMockTypeface(asset);
        });
        const onError = jest.fn();

        const result = await loadChartTypefacesFromAssets(assets, loadFn, onError);

        expect(result.KEY_A).toEqual(makeMockTypeface('asset-a'));
        expect(result.KEY_B).toBeNull();
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith('KEY_B', expect.any(Error));
    });

    it('should invoke onError once per failed asset', async () => {
        const assets = {
            KEY_A: 'asset-a',
            KEY_B: 'asset-b',
            KEY_C: 'asset-c',
        };
        const loadFn = jest.fn(async (asset: string) => {
            if (asset === 'asset-b' || asset === 'asset-c') {
                throw new Error(`Failed to load ${asset}`);
            }

            return makeMockTypeface(asset);
        });
        const onError = jest.fn();

        const result = await loadChartTypefacesFromAssets(assets, loadFn, onError);

        expect(result.KEY_A).toEqual(makeMockTypeface('asset-a'));
        expect(result.KEY_B).toBeNull();
        expect(result.KEY_C).toBeNull();
        expect(onError).toHaveBeenCalledTimes(2);
        expect(onError).toHaveBeenCalledWith('KEY_B', expect.any(Error));
        expect(onError).toHaveBeenCalledWith('KEY_C', expect.any(Error));
    });
});
