import {render, screen} from '@testing-library/react-native';

import {CARD_TEST_ID, HomePageSkeletonRowCards, HomePageSkeletonSpinnerCard, SPINNER_TEST_ID} from '@pages/home/HomePageSkeleton';

import React from 'react';

// The cards read `shouldUseNarrowLayout` for horizontal padding only, never for card count or shape.
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

describe('HomePageSkeleton card groups', () => {
    it('contributes two cards from the row group', () => {
        render(<HomePageSkeletonRowCards />);

        expect(screen.getAllByTestId(CARD_TEST_ID)).toHaveLength(2);
        expect(screen.queryByTestId(SPINNER_TEST_ID)).not.toBeOnTheScreen();
    });

    it('contributes one spinner-bearing card from the spinner group', () => {
        render(<HomePageSkeletonSpinnerCard />);

        expect(screen.getAllByTestId(CARD_TEST_ID)).toHaveLength(1);
        expect(screen.getByTestId(SPINNER_TEST_ID)).toBeOnTheScreen();
    });
});
