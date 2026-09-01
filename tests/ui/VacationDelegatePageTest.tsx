import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';

import VacationDelegatePage from '@pages/settings/Profile/CustomStatus/VacationDelegatePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type * as ReactNavigation from '@react-navigation/native';
// eslint-disable-next-line no-restricted-imports -- React Native Pressable/Text are required only to type the actual Jest module export; this does not import them at runtime.
import type {Pressable as ReactNativePressable, Text as ReactNativeText} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CREATOR_ACCOUNT_ID = 1;
const CREATOR_EMAIL = 'creator@example.com';
const DELEGATE_A_EMAIL = 'delegateA@example.com';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useRoute: jest.fn(() => ({params: {}})),
        usePreventRemove: jest.fn(),
    };
});

// Replaces the real, personal-details-backed selection list with two plain pressable rows so tests can
// simulate rapid row taps on VacationDelegatePage's onSelectRow without driving the full list UI.
jest.mock('@components/BaseVacationDelegateSelectionComponent', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<{Pressable: typeof ReactNativePressable; Text: typeof ReactNativeText}>('react-native');

    return ({onSelectRow}: {onSelectRow: (option: {login: string}) => void}) =>
        ReactMock.createElement(
            ReactMock.Fragment,
            null,
            ReactMock.createElement(Pressable, {testID: 'select-delegate-a', onPress: () => onSelectRow({login: 'delegateA@example.com'})}, ReactMock.createElement(Text, null, 'select-a')),
            ReactMock.createElement(Pressable, {testID: 'select-delegate-b', onPress: () => onSelectRow({login: 'delegateB@example.com'})}, ReactMock.createElement(Text, null, 'select-b')),
        );
});

function renderPage() {
    return render(
        <NavigationContainer>
            <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
                <VacationDelegatePage />
            </ComposeProviders>
        </NavigationContainer>,
    );
}

describe('VacationDelegatePage', () => {
    let apiSideEffectSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await TestHelper.signInWithTestUser(CREATOR_ACCOUNT_ID, CREATOR_EMAIL);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('calls setVacationDelegate once for a single selection', async () => {
        apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS}));

        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('select-delegate-a'));
        await waitForBatchedUpdatesWithAct();

        expect(apiSideEffectSpy).toHaveBeenCalledTimes(1);
        expect(apiSideEffectSpy).toHaveBeenCalledWith(
            SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE,
            expect.objectContaining({creator: CREATOR_EMAIL, vacationDelegateEmail: DELEGATE_A_EMAIL}),
            expect.anything(),
        );
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_STATUS);
    });

    it('ignores a second row selection while the first request is still pending', async () => {
        // Never resolves, so the request stays "in flight" for the duration of the test.
        apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => new Promise(() => {}));

        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('select-delegate-a'));
        fireEvent.press(screen.getByTestId('select-delegate-b'));
        await waitForBatchedUpdatesWithAct();

        expect(apiSideEffectSpy).toHaveBeenCalledTimes(1);
        expect(apiSideEffectSpy).toHaveBeenCalledWith(
            SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE,
            expect.objectContaining({vacationDelegateEmail: DELEGATE_A_EMAIL}),
            expect.anything(),
        );
    });
});
