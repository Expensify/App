import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import VacationDelegatePage from '@pages/settings/Profile/CustomStatus/VacationDelegatePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

// eslint-disable-next-line no-restricted-imports -- React Native Pressable/Text are required only to type the actual Jest module export; this does not import them at runtime.
import type {Pressable as ReactNativePressable, Text as ReactNativeText} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
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

// Replaces the real, personal-details-backed selection list with a plain pressable row so tests can
// simulate a row tap on VacationDelegatePage's onSelectRow without driving the full list UI.
jest.mock('@components/BaseVacationDelegateSelectionComponent', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<{Pressable: typeof ReactNativePressable; Text: typeof ReactNativeText}>('react-native');

    return ({onSelectRow}: {onSelectRow: (option: {login: string}) => void}) =>
        ReactMock.createElement(Pressable, {testID: 'select-delegate-a', onPress: () => onSelectRow({login: 'delegateA@example.com'})}, ReactMock.createElement(Text, null, 'select-a'));
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
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(Navigation.goBack).mockClear();
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

    it('stores the picked member on the form instead of saving it', async () => {
        // Given a picker with no saved delegate, and the API spied on so any save would be visible
        const apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects');

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a member is picked
        fireEvent.press(screen.getByTestId('select-delegate-a'));
        await waitForBatchedUpdatesWithAct();

        // Then nothing is saved yet, since the clear after date is chosen on the form, and the pick is handed to the form
        expect(apiSideEffectSpy).not.toHaveBeenCalled();
        const draft = await getOnyxValue(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM_DRAFT);
        expect(draft?.delegate).toBe(DELEGATE_A_EMAIL);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_VACATION_DELEGATE);
    });

    it('does not delete the saved delegate when the same member is picked again', async () => {
        // Given the member being picked is already the saved delegate
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {creator: CREATOR_EMAIL, delegate: DELEGATE_A_EMAIL});
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When that member is picked
        fireEvent.press(screen.getByTestId('select-delegate-a'));
        await waitForBatchedUpdatesWithAct();

        // Then the delegate is kept, since removing it is now the form's remove button, not a quiet side effect of re-picking
        expect(apiWriteSpy).not.toHaveBeenCalled();
        const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
        expect(vacationDelegate?.delegate).toBe(DELEGATE_A_EMAIL);
    });
});
