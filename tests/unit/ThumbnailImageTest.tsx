import {act, render} from '@testing-library/react-native';

import ThumbnailImage from '@components/ThumbnailImage';

import React from 'react';

const mockUseThumbnailDimensions = jest.fn((width: number, height: number) => ({thumbnailDimensionsStyles: {width, height}}));
let mockOnMeasure: ((dimensions: {width: number; height: number}) => void) | undefined;

jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useStyleUtils', () => () => ({}));
jest.mock('@hooks/useTheme', () => () => ({border: '#000'}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useThumbnailDimensions', () => (width: number, height: number) => mockUseThumbnailDimensions(width, height));
jest.mock('@components/ImageWithSizeCalculation', () => ({
    __esModule: true,
    default: ({onMeasure}: {onMeasure: typeof mockOnMeasure}) => {
        mockOnMeasure = onMeasure;
        return null;
    },
}));

describe('ThumbnailImage', () => {
    beforeEach(() => {
        mockUseThumbnailDimensions.mockClear();
        mockOnMeasure = undefined;
    });

    it('uses dimensions for the current URL when a recycled row shows another image', () => {
        // Given a measured thumbnail for the first image.
        const view = render(
            <ThumbnailImage
                previewSourceURL="https://example.com/first.png"
                isAuthTokenRequired={false}
            />,
        );
        act(() => mockOnMeasure?.({width: 400, height: 100}));
        expect(mockUseThumbnailDimensions).toHaveBeenLastCalledWith(400, 100);

        // When the same component instance is reused for a second image.
        view.rerender(
            <ThumbnailImage
                previewSourceURL="https://example.com/second.png"
                isAuthTokenRequired={false}
            />,
        );

        // Then the second image starts with its own dimensions, rather than the first image's.
        expect(mockUseThumbnailDimensions).toHaveBeenLastCalledWith(200, 200);

        // When the first image returns, its measured dimensions are restored from the URL cache.
        view.rerender(
            <ThumbnailImage
                previewSourceURL="https://example.com/first.png"
                isAuthTokenRequired={false}
            />,
        );
        expect(mockUseThumbnailDimensions).toHaveBeenLastCalledWith(400, 100);
    });
});
