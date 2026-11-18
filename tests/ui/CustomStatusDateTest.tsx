import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import Status from '@components/LHNOptionsList/OptionRowLHN/OptionRow/Status';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {OptionData} from '@libs/ReportUtils';

import StatusPage from '@pages/settings/Profile/CustomStatus/StatusPage';

import * as UserActions from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

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
jest.mock('@userActions/User', () => ({
    ...jest.requireActual<typeof UserActions>('@userActions/User'),
    updateCustomStatus: jest.fn(),
}));
jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn(), inputRef: {current: null}}));
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);

// Native tests inspect tooltip content without depending on the browser's hover timing.
jest.mock('@components/Tooltip', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text, View} = jest.requireActual<{Text: ComponentType<TextProps>; View: ComponentType<ViewProps>}>('react-native');
    return ({text, children}: PropsWithChildren<{text: string}>) => ReactModule.createElement(View, null, ReactModule.createElement(Text, null, text), children);
});

function renderSurface(children: React.ReactNode, status?: CurrentUserPersonalDetails['status']) {
    const navigation = createMock<NavigationProp<ParamListBase>>({isFocused: () => true, addListener: () => () => {}});
    return render(
        <NavigationContext.Provider value={navigation}>
            <CurrentUserPersonalDetailsContext.Provider value={{accountID: 999, timezone: {automatic: false, selected: 'Atlantic/Reykjavik'}, status}}>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>
            </CurrentUserPersonalDetailsContext.Provider>
        </NavigationContext.Provider>,
    );
}

describe('Custom status dates', () => {
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

    it.each([
        ['2026-12-02 17:19:00', 'Locale date check (Bis 02.12. 17:19)'],
        ['2027-01-22 17:19:00', 'Locale date check (Bis 22.01.2027 17:19)'],
    ])('renders a localized status expiry for %s', async (clearAfter, expected) => {
        // Given an actor whose status expires on a different day from the frozen current date
        const optionItem = createMock<OptionData>({
            isOneOnOneChat: true,
            timezone: {automatic: false, selected: 'Atlantic/Reykjavik'},
            status: {emojiCode: '😀', text: 'Locale date check', clearAfter},
        });

        // When the actual row status component formats its tooltip through the app locale provider
        renderSurface(<Status optionItem={optionItem} />);
        await waitForBatchedUpdatesWithAct();

        // Then date order and separators are German, and a different year is not hidden
        expect(screen.getByText(expected)).toBeOnTheScreen();
    });

    it('localizes the status editor label without changing the saved expiry value', async () => {
        // Given a saved custom expiry in the machine format expected by the status action
        const clearAfter = '2026-12-02 17:19:00';
        renderSurface(<StatusPage />, {emojiCode: '😀', text: 'Locale date check', clearAfter});
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('02.12.2026 17:19')).toBeOnTheScreen();

        // When the language changes without remounting the form and the user saves it
        await act(async () => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('12/02/2026 5:19 PM')).toBeOnTheScreen();
        fireEvent.press(screen.getByRole('button', {name: 'Save'}));
        await waitForBatchedUpdatesWithAct();

        // Then presentation changes never replace the action's original machine datetime
        expect(UserActions.updateCustomStatus).toHaveBeenCalledWith(999, {emojiCode: '😀', text: 'Locale date check', clearAfter});
    });
});
