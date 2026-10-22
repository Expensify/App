import {renderHook} from '@testing-library/react-native';

import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';

import CONST from '@src/CONST';

import React from 'react';

import createMock from '../../utils/createMock';

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(),
}));

function mockNarrowLayout(shouldUseNarrowLayout: boolean) {
    jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout}));
}

function renderInSidePanel(width: number, height: number) {
    return renderHook(() => useThumbnailDimensions(width, height), {
        wrapper: ({children}: {children: React.ReactNode}) => <IsInSidePanelContext.Provider value>{children}</IsInSidePanelContext.Provider>,
    });
}

describe('useThumbnailDimensions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('uses the wide screen size on a wide layout outside the side panel', () => {
        // Given a wide layout and a landscape image rendered in the main chat
        mockNarrowLayout(false);

        // When the thumbnail dimensions are calculated
        const {result} = renderHook(() => useThumbnailDimensions(800, 400));

        // Then the main chat has room for the full wide screen thumbnail
        expect(result.current.thumbnailDimensionsStyles).toEqual({width: CONST.THUMBNAIL_IMAGE.WIDE_SCREEN.SIZE, aspectRatio: 2});
    });

    it('uses the small screen size on a wide layout inside the side panel', () => {
        // Given a wide layout and a landscape image rendered in the side panel
        mockNarrowLayout(false);

        // When the thumbnail dimensions are calculated
        const {result} = renderInSidePanel(800, 400);

        // Then the thumbnail uses the small size, because the side panel is too narrow for the wide screen size and would clip it
        expect(result.current.thumbnailDimensionsStyles).toEqual({width: CONST.THUMBNAIL_IMAGE.SMALL_SCREEN.SIZE, aspectRatio: 2});
    });

    it('uses the small screen size for portrait images inside the side panel', () => {
        // Given a wide layout and a portrait image rendered in the side panel
        mockNarrowLayout(false);

        // When the thumbnail dimensions are calculated
        const {result} = renderInSidePanel(400, 800);

        // Then the height is capped at the small size so the thumbnail fits the side panel
        expect(result.current.thumbnailDimensionsStyles).toEqual({height: CONST.THUMBNAIL_IMAGE.SMALL_SCREEN.SIZE, aspectRatio: 0.5});
    });

    it('uses the small screen size on a narrow layout', () => {
        // Given a narrow layout outside the side panel
        mockNarrowLayout(true);

        // When the thumbnail dimensions are calculated
        const {result} = renderHook(() => useThumbnailDimensions(800, 400));

        // Then the existing narrow layout behavior is unchanged
        expect(result.current.thumbnailDimensionsStyles).toEqual({width: CONST.THUMBNAIL_IMAGE.SMALL_SCREEN.SIZE, aspectRatio: 2});
    });
});
