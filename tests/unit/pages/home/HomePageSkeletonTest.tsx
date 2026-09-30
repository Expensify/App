import {render, screen} from '@testing-library/react-native';

import {CHART_SKELETON_TEST_ID} from '@components/Charts/ChartSkeleton';

import {CARD_TEST_ID, HomePageSkeletonChartCard, HomePageSkeletonRowCards} from '@pages/home/HomePageSkeleton';

import React from 'react';

// The cards read `shouldUseNarrowLayout` for padding only, never for card count or shape.
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

describe('HomePageSkeleton cards', () => {
    it('renders two row cards', () => {
        render(<HomePageSkeletonRowCards />);

        expect(screen.getAllByTestId(CARD_TEST_ID)).toHaveLength(2);
    });

    it('renders one card holding a chart placeholder', () => {
        render(<HomePageSkeletonChartCard />);

        expect(screen.getAllByTestId(CARD_TEST_ID)).toHaveLength(1);
        expect(screen.getByTestId(CHART_SKELETON_TEST_ID)).toBeOnTheScreen();
    });
});
