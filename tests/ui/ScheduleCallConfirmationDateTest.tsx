// cspell:ignore Januar
import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ScheduleCallConfirmationPage from '@pages/ScheduleCall/ScheduleCallConfirmationPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {ComponentType, PropsWithChildren} from 'react';
import type {TextProps, ViewProps} from 'react-native';

import {NavigationContext} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {setupGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

setupGlobalFetchMock();

jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/actions/ScheduleCall', () => ({confirmBooking: jest.fn()}));
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/ReportActionAvatars', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/BlockingViews/FullPageOfflineBlockingView',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useRoute: () => ({params: {reportID: '100'}}),
}));

// Native tests inspect tooltip content without depending on the browser's hover timing.
jest.mock('@components/Tooltip', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text, View} = jest.requireActual<{Text: ComponentType<TextProps>; View: ComponentType<ViewProps>}>('react-native');
    return ({text, children}: PropsWithChildren<{text: string}>) => ReactModule.createElement(View, null, ReactModule.createElement(Text, null, text), children);
});

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

describe('Schedule call confirmation date', () => {
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

    it('renders the booking confirmation date without imposing English ordering', async () => {
        // Given a selected calendar day and a separate time-slot instant, without submitting any booking
        await act(async () => {
            await Onyx.set(ONYXKEYS.SCHEDULE_CALL_DRAFT, {
                date: '2027-01-22',
                timeSlot: '2027-01-22T22:00:00Z',
                guide: {accountID: 999, email: 'date-test@example.com'},
                reportID: '100',
            });
        });

        // When the actual booking confirmation page renders with the German app locale
        renderSurface(
            <MenuItem.Root>
                <ScheduleCallConfirmationPage />
            </MenuItem.Root>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the long date uses German grammar while preserving the chosen calendar day
        expect(screen.getByText('22. Januar 2027 from 22:00 - 22:30 GMT+0')).toBeOnTheScreen();
    });
});
