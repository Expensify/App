import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TripListItemRow from '@components/Search/SearchList/ListItem/TripListItemRow';
import type {TripListItemType} from '@components/Search/SearchList/ListItem/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

const mockLayout = (isLargeScreenWidth: boolean) =>
    mockedUseResponsiveLayout.mockReturnValue({
        isLargeScreenWidth,
        shouldUseNarrowLayout: !isLargeScreenWidth,
        isSmallScreenWidth: !isLargeScreenWidth,
        isMediumScreenWidth: false,
        isExtraSmallScreenWidth: false,
        isExtraSmallScreenHeight: false,
        isExtraLargeScreenWidth: false,
        isSmallScreen: !isLargeScreenWidth,
        isInNarrowPaneModal: false,
        onboardingIsMediumOrLargerScreenWidth: isLargeScreenWidth,
        isInLandscapeMode: false,
    });

// A trip room shaped like the trip search response
const tripItem: TripListItemType = {
    reportID: '2816018005195895',
    keyForList: '2816018005195895',
    reportName: "Brandon's trip to Tokyo Sales Conference",
    tripName: "Brandon's trip to Tokyo Sales Conference",
    chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM,
    type: CONST.REPORT.TYPE.CHAT,
    policyID: 'DD949BDE0E77A392',
    startDate: '2026-10-28T00:00:00',
    endDate: '2026-11-01T00:00:00',
    status: CONST.SEARCH.TRIP_STATUS.UPCOMING,
    total: 159732,
    currency: 'USD',
    travelerAccountID: 629,
    traveler: {accountID: 629, displayName: 'Travel Employee', login: 'travel-employee@cplustest.com'},
    formattedTraveler: 'Travel Employee',
};

const renderRow = (onViewPress = jest.fn(), item: TripListItemType = tripItem) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <TripListItemRow
                item={item}
                columns={[...CONST.SEARCH.TYPE_DEFAULT_COLUMNS.TRIP]}
                showTooltip={false}
                onViewPress={onViewPress}
            />
        </ComposeProviders>,
    );

describe('TripListItemRow', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('shows every trip column and opens the trip from View on wide screens', async () => {
        // Given a wide layout, where the trip row is a table row
        mockLayout(true);
        const onViewPress = jest.fn();

        // When the row renders a trip from the trip search
        renderRow(onViewPress);
        await waitForBatchedUpdatesWithAct();

        // Then it shows the start and end dates, the status badge, the trip name, the traveler and the total
        expect(screen.getByText('Oct 28')).toBeOnTheScreen();
        expect(screen.getByText('Nov 1')).toBeOnTheScreen();
        expect(screen.getByText('Upcoming')).toBeOnTheScreen();
        expect(screen.getByText("Brandon's trip to Tokyo Sales Conference")).toBeOnTheScreen();
        expect(screen.getByText('Travel Employee')).toBeOnTheScreen();
        expect(screen.getByText('$1,597.32')).toBeOnTheScreen();

        // And View opens the trip, since View and tapping the row both open the trip room
        fireEvent.press(screen.getByText('View'));
        expect(onViewPress).toHaveBeenCalledTimes(1);
    });

    it('shows a canceled trip with its own badge', async () => {
        // Given a canceled trip, since the badge follows the status the backend works out
        mockLayout(true);

        // When the row renders it
        renderRow(jest.fn(), {...tripItem, status: CONST.SEARCH.TRIP_STATUS.CANCELED});
        await waitForBatchedUpdatesWithAct();

        // Then the badge reads Canceled
        expect(screen.getByText('Canceled')).toBeOnTheScreen();
    });

    it('shows the same trip data on narrow screens', async () => {
        // Given a narrow layout, where the row is a card without columns or a View button
        mockLayout(false);

        // When the row renders a trip
        renderRow();
        await waitForBatchedUpdatesWithAct();

        // Then the card still shows the dates, status, trip name, traveler and total
        expect(screen.getByText('Oct 28')).toBeOnTheScreen();
        expect(screen.getByText('Nov 1')).toBeOnTheScreen();
        expect(screen.getByText('Upcoming')).toBeOnTheScreen();
        expect(screen.getByText("Brandon's trip to Tokyo Sales Conference")).toBeOnTheScreen();
        expect(screen.getByText('Travel Employee')).toBeOnTheScreen();
        expect(screen.getByText('$1,597.32')).toBeOnTheScreen();
        expect(screen.queryByText('View')).not.toBeOnTheScreen();
    });
});
