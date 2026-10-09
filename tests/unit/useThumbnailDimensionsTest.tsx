import {renderHook} from '@testing-library/react-native';

import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';

import CONST from '@src/CONST';

import type {PropsWithChildren} from 'react';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);

const layouts = [
    {name: 'desktop side panel', isInSidePanel: true, shouldUseNarrowLayout: false, size: CONST.THUMBNAIL_IMAGE.SMALL_SCREEN.SIZE},
    {name: 'main desktop chat', isInSidePanel: false, shouldUseNarrowLayout: false, size: CONST.THUMBNAIL_IMAGE.WIDE_SCREEN.SIZE},
    {name: 'narrow chat', isInSidePanel: false, shouldUseNarrowLayout: true, size: CONST.THUMBNAIL_IMAGE.SMALL_SCREEN.SIZE},
];

const images = [
    {name: 'landscape', width: 800, height: 400, dimension: 'width', aspectRatio: 2},
    {name: 'portrait', width: 400, height: 800, dimension: 'height', aspectRatio: 0.5},
    {name: 'square', width: 600, height: 600, dimension: 'height', aspectRatio: 1},
    {name: 'unknown dimensions', width: 0, height: 0, dimension: 'width', aspectRatio: CONST.THUMBNAIL_IMAGE.NAN_ASPECT_RATIO},
];

describe('useThumbnailDimensions', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe.each(layouts)('$name', ({isInSidePanel, shouldUseNarrowLayout, size}) => {
        it.each(images)('sizes $name images to fit their chat surface', ({width, height, dimension, aspectRatio}) => {
            // Given the side panel has phone-sized content space even on a desktop viewport.
            mockUseResponsiveLayout.mockReturnValue({shouldUseNarrowLayout} as ReturnType<typeof useResponsiveLayout>);
            function Wrapper({children}: PropsWithChildren) {
                return <IsInSidePanelContext.Provider value={isInSidePanel}>{children}</IsInSidePanelContext.Provider>;
            }

            // When the shared image and video hook calculates the preview dimensions.
            const {result} = renderHook(() => useThumbnailDimensions(width, height), {wrapper: Wrapper});

            // Then the longest edge fits the surface and the image keeps its original proportions.
            expect(result.current.thumbnailDimensionsStyles).toEqual({[dimension]: size, aspectRatio});
        });
    });

    it('updates thumbnail dimensions when the same preview moves into and out of the side panel', () => {
        // Given a preview starts in the wide main chat rather than the narrower side panel.
        mockUseResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: false} as ReturnType<typeof useResponsiveLayout>);
        let isInSidePanel = false;
        function Wrapper({children}: PropsWithChildren) {
            return <IsInSidePanelContext.Provider value={isInSidePanel}>{children}</IsInSidePanelContext.Provider>;
        }
        const {result, rerender} = renderHook(() => useThumbnailDimensions(800, 400), {wrapper: Wrapper});
        expect(result.current.thumbnailDimensionsStyles).toEqual({width: CONST.THUMBNAIL_IMAGE.WIDE_SCREEN.SIZE, aspectRatio: 2});

        // When its context changes without changing the image, the old desktop size must not be cached.
        isInSidePanel = true;
        rerender({});

        // Then the preview shrinks in the side panel and returns to its normal size when moved back.
        expect(result.current.thumbnailDimensionsStyles).toEqual({width: CONST.THUMBNAIL_IMAGE.SMALL_SCREEN.SIZE, aspectRatio: 2});
        isInSidePanel = false;
        rerender({});
        expect(result.current.thumbnailDimensionsStyles).toEqual({width: CONST.THUMBNAIL_IMAGE.WIDE_SCREEN.SIZE, aspectRatio: 2});
    });
});
