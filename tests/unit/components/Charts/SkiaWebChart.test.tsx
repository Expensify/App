import {render, screen} from '@testing-library/react-native';
import React from 'react';
import type {View as RNView} from 'react-native';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import isSkiaWebSupported from '@components/Charts/SkiaWebChart/isSkiaWebSupported';

jest.mock('@components/Charts/SkiaWebChart/isSkiaWebSupported', () => jest.fn());

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({chartWebFallback: {}, textSupporting: {}, textAlignCenter: {}})));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

jest.mock('@components/Text', () => {
    const ReactLib = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{children?: React.ReactNode}>};
    return {
        __esModule: true,
        default: ({children}: {children: React.ReactNode}) => ReactLib.createElement(Text, null, children),
    };
});

jest.mock('@components/ActivityIndicator', () => {
    const ReactLib = require('react') as typeof React;
    const {View} = require('react-native') as {View: typeof RNView};
    return {
        __esModule: true,
        default: () => ReactLib.createElement(View, {testID: 'skia-loading'}),
    };
});

jest.mock('@shopify/react-native-skia/lib/module/web', () => {
    const ReactLib = require('react') as typeof React;
    const {View} = require('react-native') as {View: typeof RNView};
    return {
        WithSkiaWeb: () => ReactLib.createElement(View, {testID: 'with-skia-web'}),
    };
});

const mockIsSkiaWebSupported = jest.mocked(isSkiaWebSupported);

describe('SkiaWebChart', () => {
    const getComponent = () => Promise.resolve({default: () => null});

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should show the enable-WebGL message without mounting Skia when WebGL is unsupported', () => {
        mockIsSkiaWebSupported.mockReturnValue(false);

        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
                reasonContext="Test.SkiaWebLoading"
            />,
        );

        expect(screen.getByText('common.enableWebGLToDisplayCharts')).toBeTruthy();
        expect(screen.queryByTestId('with-skia-web')).toBeNull();
    });

    it('should mount Skia when WebGL is supported', () => {
        mockIsSkiaWebSupported.mockReturnValue(true);

        render(
            <SkiaWebChart
                getComponent={getComponent}
                componentProps={{}}
                reasonContext="Test.SkiaWebLoading"
            />,
        );

        expect(screen.getByTestId('with-skia-web')).toBeTruthy();
    });
});
