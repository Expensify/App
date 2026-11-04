// cspell:ignore Zuletzt verwendet
import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ListItem, ListItemProps} from '@components/SelectionList/ListItem/types';

import ReuseRouteListItem from '@pages/iou/request/step/ReuseRouteListItem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReusableDistanceRoute} from '@src/types/onyx';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';

import {NavigationContext} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {setupGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

setupGlobalFetchMock();

jest.mock('@libs/Navigation/Navigation');
jest.mock('@components/EReceiptThumbnail', () => () => null);

function renderSurface(children: React.ReactNode) {
    const navigation = createMock<NavigationProp<ParamListBase>>({isFocused: () => true, addListener: () => () => {}});
    return render(
        <NavigationContext.Provider value={navigation}>
            <CurrentUserPersonalDetailsContext.Provider value={{accountID: 999, timezone: {automatic: false, selected: 'Atlantic/Reykjavik'}}}>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>
            </CurrentUserPersonalDetailsContext.Provider>
        </NavigationContext.Provider>,
    );
}

describe('Reused route Last used date', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]}));

    beforeEach(async () => {
        jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick']});
        jest.setSystemTime(new Date('2026-11-03T20:00:00Z'));
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: 999, email: 'date-test@example.com'},
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DE,
                [ONYXKEYS.HAS_LOADED_APP]: true,
            });
        });
    });

    afterEach(async () => {
        await act(async () => Onyx.clear());
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('updates a reused-route badge when the app language changes while the row stays mounted', async () => {
        // Given a reusable distance route whose source expense has a fixed UTC insertion date
        const props = createMock<ListItemProps<ListItem & {route: ReusableDistanceRoute}>>({
            item: {
                keyForList: 'route',
                route: {
                    transactionID: '100',
                    inserted: '2026-01-22 12:00:00',
                    distance: 3.5,
                    waypoints: {waypoint0: {address: 'Start'}, waypoint1: {address: 'End'}},
                },
            },
            onSelectRow: jest.fn(),
        });
        renderSurface(<ReuseRouteListItem {...props} />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('Zuletzt verwendet am 22. Jan.')).toBeOnTheScreen();

        // When the app language changes without replacing the row or its route
        await act(async () => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.JA));
        await waitForBatchedUpdatesWithAct();

        // Then both the badge copy and the date follow the reactive locale
        expect(screen.getByText('最終利用日：1月22日')).toBeOnTheScreen();
    });
});
