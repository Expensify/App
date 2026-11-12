import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PerDiemEReceipt from '@components/PerDiemEReceipt';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';

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

describe('Per diem merchant dates', () => {
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

    it('keeps persisted per-diem merchant dates readable after changing language', async () => {
        // Given a merchant in the form the server saves, with comma-separated date parts and a comma in its destination
        const dates = 'January 22, 2026 to January 23, 2026';
        await act(async () => {
            await Onyx.set(
                `${ONYXKEYS.COLLECTION.TRANSACTION}100`,
                createMock<Transaction>({
                    transactionID: '100',
                    reportID: '100',
                    created: '2026-01-22',
                    merchant: `Berlin, Germany, ${dates}`,
                    amount: -1000,
                    currency: CONST.CURRENCY.USD,
                }),
            );
        });
        renderSurface(<PerDiemEReceipt transactionID="100" />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(dates)).toBeOnTheScreen();

        // When the app preference changes while the receipt remains mounted
        await act(async () => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.JA));
        await waitForBatchedUpdatesWithAct();

        // Then the real merchant parser still separates the destination from the unchanged stored dates
        expect(screen.getByText(dates)).toBeOnTheScreen();
        expect(screen.getByText(/Berlin, Germany/)).toBeOnTheScreen();
    });
});
