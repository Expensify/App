import {render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import isSkiaWebSupported from '@components/Charts/SkiaWebChart/isSkiaWebSupported';
import Text from '@components/Text';

import {WithSkiaWeb} from '@shopify/react-native-skia/lib/module/web';
import React from 'react';
import {View} from 'react-native';

jest.mock('@components/Charts/SkiaWebChart/isSkiaWebSupported', () => jest.fn());

jest.mock('@shopify/react-native-skia/lib/module/web', () => ({WithSkiaWeb: jest.fn(() => null)}));

// Every style lookup returns an empty object so the real Text/View render without a ThemeProvider.
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: () => ({MonitorSyncNo: () => null})}));

jest.mock('@components/Icon', () => ({
    __esModule: true,
    default: () => null,
}));

const mockIsSkiaWebSupported = jest.mocked(isSkiaWebSupported);
const mockWithSkiaWeb = jest.mocked(WithSkiaWeb);

describe('SkiaWebChart', () => {
    const getComponent = () => Promise.resolve({default: () => null});

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should show the unable-to-display empty state without mounting Skia when WebGL is unsupported', () => {
        mockIsSkiaWebSupported.mockReturnValue(false);

        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );

        expect(screen.getByText('common.unableToDisplayChart')).toBeTruthy();
        expect(screen.getByText('common.webGLNotSupported')).toBeTruthy();
        expect(mockWithSkiaWeb).not.toHaveBeenCalled();
    });

    it('should mount Skia when WebGL is supported', () => {
        mockIsSkiaWebSupported.mockReturnValue(true);

        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );

        expect(mockWithSkiaWeb).toHaveBeenCalled();
    });

    it('should hand the caller-supplied loading fallback to Skia', () => {
        mockIsSkiaWebSupported.mockReturnValue(true);
        const loadingFallback = <Text>chart skeleton</Text>;

        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
                loadingFallback={loadingFallback}
            />,
        );

        expect(mockWithSkiaWeb).toHaveBeenCalledWith(expect.objectContaining({fallback: loadingFallback}), undefined);
    });

    it('should keep its own spinner fallback when the caller supplies none', () => {
        mockIsSkiaWebSupported.mockReturnValue(true);

        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
            />,
        );

        const fallback = mockWithSkiaWeb.mock.lastCall?.at(0)?.fallback;
        render(<View>{fallback}</View>);

        expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });
});
