import {render, screen, within} from '@testing-library/react-native';

import HomePageSkeleton, {CARD_TEST_ID, LEFT_COLUMN_TEST_ID, RIGHT_COLUMN_TEST_ID, SPINNER_TEST_ID} from '@pages/home/HomePageSkeleton';

import React from 'react';

// Only `shouldUseNarrowLayout` is read by the skeleton, so the mock returns just that field and the
// tests flip it through this variable.
let mockShouldUseNarrowLayout = false;

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout})));

describe('HomePageSkeleton', () => {
    it('renders four placeholder cards split two-and-two across the columns on wide layout', () => {
        mockShouldUseNarrowLayout = false;

        render(<HomePageSkeleton />);

        const leftColumn = screen.getByTestId(LEFT_COLUMN_TEST_ID);
        const rightColumn = screen.getByTestId(RIGHT_COLUMN_TEST_ID);

        expect(within(leftColumn).getAllByTestId(CARD_TEST_ID)).toHaveLength(2);
        expect(within(rightColumn).getAllByTestId(CARD_TEST_ID)).toHaveLength(2);
    });

    it('renders the spinner card in the left column', () => {
        mockShouldUseNarrowLayout = false;

        render(<HomePageSkeleton />);

        const leftColumn = screen.getByTestId(LEFT_COLUMN_TEST_ID);

        expect(within(leftColumn).getByTestId(SPINNER_TEST_ID)).toBeOnTheScreen();
    });

    // Narrow is the same four cards in one column, produced by the caller's `homePageMainLayout(true)`
    // switching `flexDirection`, so the skeleton must not emit the wide-layout column wrappers.
    it('renders the same four cards without column wrappers on narrow layout', () => {
        mockShouldUseNarrowLayout = true;

        render(<HomePageSkeleton />);

        expect(screen.getAllByTestId(CARD_TEST_ID)).toHaveLength(4);
        expect(screen.queryByTestId(LEFT_COLUMN_TEST_ID)).not.toBeOnTheScreen();
        expect(screen.queryByTestId(RIGHT_COLUMN_TEST_ID)).not.toBeOnTheScreen();
    });
});
