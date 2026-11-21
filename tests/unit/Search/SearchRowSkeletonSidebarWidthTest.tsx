import {render} from '@testing-library/react-native';

import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';

import variables from '@styles/variables';

import React from 'react';

type CapturedRect = {transform?: Array<Record<string, number>>; height?: number};

let mockShouldUseFlatNavigationBar = false;
let mockCapturedRects: CapturedRect[] = [];

jest.mock('@libs/getPlatform', () => () => 'web');
jest.mock('@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar', () => () => mockShouldUseFlatNavigationBar);
jest.mock('@components/Navigation/FlatNavigationBar/useNavigationBarWidth', () => () => 72);
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false, isLargeScreenWidth: true}));
jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 1600, windowHeight: 900}));
jest.mock('react-native-svg', () => ({Circle: () => null}));
jest.mock(
    '@components/Skeletons/ItemListSkeletonView',
    () =>
        ({renderSkeletonItem}: {renderSkeletonItem: () => React.ReactNode}) =>
            renderSkeletonItem(),
);
jest.mock('@components/SkeletonRect', () => (props: CapturedRect) => {
    mockCapturedRects.push(props);
    return null;
});

/** The pill at the end of a row, which is aligned to the right edge of the page. */
function getTrailingPillOffset() {
    const pill = mockCapturedRects.find((rect) => rect.height === 28);
    return pill?.transform?.at(0)?.translateX;
}

describe('SearchRowSkeleton', () => {
    beforeEach(() => {
        mockShouldUseFlatNavigationBar = false;
        mockCapturedRects = [];
    });

    it('makes room for the Spend column outside the flat nav beta', () => {
        // Given a skeleton on the wide layout without the flat navigation bar
        render(<SearchRowSkeleton />);
        const offsetWithColumn = getTrailingPillOffset();

        // When the same skeleton renders with the flat navigation bar
        mockCapturedRects = [];
        mockShouldUseFlatNavigationBar = true;
        render(<SearchRowSkeleton />);
        const offsetWithoutColumn = getTrailingPillOffset();

        // Then the page is wider by the column that is gone, so the pill moves right by exactly its width and not by a pixel more
        expect(offsetWithColumn).toBeDefined();
        expect(offsetWithoutColumn).toBe((offsetWithColumn ?? 0) + variables.sideBarWithLHBWidth);
    });

    it('lets the caller say how wide the column beside the page is', () => {
        // Given the flat navigation bar, which removes the Spend column
        mockShouldUseFlatNavigationBar = true;
        render(<SearchRowSkeleton />);
        const offsetWithoutColumn = getTrailingPillOffset();

        // When a caller that sits beside another column, such as the Inbox sidebar, passes its width
        mockCapturedRects = [];
        render(<SearchRowSkeleton sidebarWidth={variables.sideBarWithLHBWidth} />);
        const offsetWithPinnedColumn = getTrailingPillOffset();

        // Then that width wins over the default, because the flat navigation bar does not replace that column
        expect(offsetWithPinnedColumn).toBe((offsetWithoutColumn ?? 0) - variables.sideBarWithLHBWidth);
    });
});
