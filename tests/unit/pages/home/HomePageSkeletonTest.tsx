import {render, screen, within} from '@testing-library/react-native';

import HomePageSkeleton, {CARD_TEST_ID, LEFT_COLUMN_TEST_ID, RIGHT_COLUMN_TEST_ID, SPINNER_TEST_ID} from '@pages/home/HomePageSkeleton';

import React from 'react';
import {View} from 'react-native';

// Only `shouldUseNarrowLayout` is read by the skeleton, so the mock returns just that field and the
// tests flip it through this variable.
let mockShouldUseNarrowLayout = false;

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout})));

const TOP_LEFT_CARD_TEST_ID = 'topLeftCardStub';

// Stands in for the real ForYouSection the page keeps mounted across the skeleton/content swap.
const topLeftCard = <View testID={TOP_LEFT_CARD_TEST_ID} />;

describe('HomePageSkeleton', () => {
    it('renders three placeholder cards split one-and-two across the columns on wide layout', () => {
        mockShouldUseNarrowLayout = false;

        render(<HomePageSkeleton topLeftCard={topLeftCard} />);

        const leftColumn = screen.getByTestId(LEFT_COLUMN_TEST_ID);
        const rightColumn = screen.getByTestId(RIGHT_COLUMN_TEST_ID);

        expect(within(leftColumn).getAllByTestId(CARD_TEST_ID)).toHaveLength(1);
        expect(within(rightColumn).getAllByTestId(CARD_TEST_ID)).toHaveLength(2);
    });

    it('renders the spinner card in the left column', () => {
        mockShouldUseNarrowLayout = false;

        render(<HomePageSkeleton topLeftCard={topLeftCard} />);

        const leftColumn = screen.getByTestId(LEFT_COLUMN_TEST_ID);

        expect(within(leftColumn).getByTestId(SPINNER_TEST_ID)).toBeOnTheScreen();
    });

    // The real card is rendered by the caller and passed through, so it must lead the left column rather than
    // being replaced by a placeholder that would jump when the skeleton clears.
    it('renders the passed card ahead of the placeholders in the left column', () => {
        mockShouldUseNarrowLayout = false;

        render(<HomePageSkeleton topLeftCard={topLeftCard} />);

        const leftColumn = screen.getByTestId(LEFT_COLUMN_TEST_ID);

        expect(within(leftColumn).getByTestId(TOP_LEFT_CARD_TEST_ID)).toBeOnTheScreen();
    });

    // Narrow is the same cards in one column, produced by the caller's `homePageMainLayout(true)`
    // switching `flexDirection`, so the skeleton must not emit the wide-layout column wrappers.
    it('renders the same three cards without column wrappers on narrow layout', () => {
        mockShouldUseNarrowLayout = true;

        render(<HomePageSkeleton topLeftCard={topLeftCard} />);

        expect(screen.getAllByTestId(CARD_TEST_ID)).toHaveLength(3);
        expect(screen.getByTestId(TOP_LEFT_CARD_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(LEFT_COLUMN_TEST_ID)).not.toBeOnTheScreen();
        expect(screen.queryByTestId(RIGHT_COLUMN_TEST_ID)).not.toBeOnTheScreen();
    });
});
