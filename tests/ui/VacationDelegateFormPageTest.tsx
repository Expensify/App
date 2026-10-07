import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';

import VacationDelegateFormPage from '@pages/settings/Profile/CustomStatus/VacationDelegateFormPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type * as ReactNavigation from '@react-navigation/native';
// eslint-disable-next-line no-restricted-imports -- React Native Pressable/Text are required only to type the actual Jest module export; this does not import them at runtime.
import type {Pressable as ReactNativePressable, Text as ReactNativeText} from 'react-native';

import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CREATOR_ACCOUNT_ID = 1;
const CREATOR_EMAIL = 'creator@example.com';
const DELEGATE_A_EMAIL = 'delegateA@example.com';
const DELEGATE_B_EMAIL = 'delegateB@example.com';
const ORIGINAL_DELEGATE_EMAIL = 'original@example.com';
const CLEAR_AFTER = '2026-10-02 06:59:59';
const ORIGINAL_CLEAR_AFTER = '2026-09-30 06:59:59';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(),
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

// The real confirm modal is bridged through the global modal system, which needs Navigation methods this file's
// lightweight Navigation mock doesn't provide. Stub the hook instead so tests can assert on what VacationDelegateFormPage
// asks it to show without pulling in that machinery.
const mockShowConfirmModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () =>
    jest.fn(() => ({
        showConfirmModal: mockShowConfirmModal,
    })),
);

// Replaces the real form, with its date picker and member row, with plain pressable buttons so tests can
// simulate rapid saves on VacationDelegateFormPage's onSubmit without driving the full form UI.
jest.mock('@components/VacationDelegateForm', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<{Pressable: typeof ReactNativePressable; Text: typeof ReactNativeText}>('react-native');

    return ({onSubmit, onRemove}: {onSubmit: (delegate: string, clearAfter: string | undefined) => void; onRemove: () => void}) =>
        ReactMock.createElement(
            ReactMock.Fragment,
            null,
            ReactMock.createElement(Pressable, {testID: 'select-delegate-a', onPress: () => onSubmit('delegateA@example.com', undefined)}, ReactMock.createElement(Text, null, 'select-a')),
            ReactMock.createElement(Pressable, {testID: 'select-delegate-b', onPress: () => onSubmit('delegateB@example.com', undefined)}, ReactMock.createElement(Text, null, 'select-b')),
            ReactMock.createElement(
                Pressable,
                {testID: 'select-delegate-b-with-date', onPress: () => onSubmit('delegateB@example.com', '2026-10-02 06:59:59')},
                ReactMock.createElement(Text, null, 'select-b-with-date'),
            ),
            ReactMock.createElement(Pressable, {testID: 'remove-delegate', onPress: onRemove}, ReactMock.createElement(Text, null, 'remove')),
        );
});

function renderPage() {
    return render(
        <NavigationContainer>
            <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
                <VacationDelegateFormPage />
            </ComposeProviders>
        </NavigationContainer>,
    );
}

// A real Stack.Navigator so pushing "Other" genuinely blurs VacationDelegateFormPage's own useNavigation().isFocused(),
// unlike renderPage() above where the page is the sole, permanently-focused screen.
type TestParamList = {
    VacationDelegate: undefined;
    Other: undefined;
};
const Stack = createStackNavigator<TestParamList>();
const testNavigationRef = createNavigationContainerRef<TestParamList>();

function renderPageWithStack() {
    return render(
        <NavigationContainer ref={testNavigationRef}>
            <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
                <Stack.Navigator initialRouteName="VacationDelegate">
                    <Stack.Screen
                        name="VacationDelegate"
                        component={VacationDelegateFormPage}
                    />
                    <Stack.Screen
                        name="Other"
                        component={() => null}
                    />
                </Stack.Navigator>
            </ComposeProviders>
        </NavigationContainer>,
    );
}

describe('VacationDelegateFormPage', () => {
    let apiSideEffectSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockShowConfirmModal.mockReset().mockResolvedValue({action: 'CLOSE'});
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
        // Given a signed-in creator (see beforeEach) and a side-effect request mocked to succeed, so only what the
        // page sends and does next is under test
        apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS}));

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a delegate row is tapped
        fireEvent.press(screen.getByTestId('select-delegate-a'));
        await waitForBatchedUpdatesWithAct();

        // Then setVacationDelegate is sent exactly once with the mapped params, and the page navigates back to the profile page
        expect(apiSideEffectSpy).toHaveBeenCalledTimes(1);
        expect(apiSideEffectSpy).toHaveBeenCalledWith(
            SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE,
            expect.objectContaining({creator: CREATOR_EMAIL, vacationDelegateEmail: DELEGATE_A_EMAIL}),
            expect.anything(),
        );
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_PROFILE.route);
    });

    it('sends the clear after datetime and keeps the confirmed one for rollback', async () => {
        // Given a saved delegate that already clears on a date, and a request that never resolves so the optimistic write stays in place
        apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => new Promise(() => {}));
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {creator: CREATOR_EMAIL, delegate: ORIGINAL_DELEGATE_EMAIL, clearAfter: ORIGINAL_CLEAR_AFTER});
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a new delegate is saved with a clear after date
        fireEvent.press(screen.getByTestId('select-delegate-b-with-date'));
        await waitForBatchedUpdatesWithAct();

        // Then the backend gets the datetime to clear the delegate at, and the confirmed datetime is kept so a failure can restore it
        expect(apiSideEffectSpy).toHaveBeenLastCalledWith(
            SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE,
            expect.objectContaining({vacationDelegateEmail: DELEGATE_B_EMAIL, clearAfter: CLEAR_AFTER}),
            expect.objectContaining({
                optimisticData: [
                    expect.objectContaining({
                        value: expect.objectContaining({
                            delegate: DELEGATE_B_EMAIL,
                            clearAfter: CLEAR_AFTER,
                            previousDelegate: ORIGINAL_DELEGATE_EMAIL,
                            previousClearAfter: ORIGINAL_CLEAR_AFTER,
                        }),
                    }),
                ],
            }),
        );
    });

    it('removes the saved delegate and goes back to the profile page', async () => {
        // Given a saved delegate
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        jest.mocked(Navigation.goBack).mockClear();
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {creator: CREATOR_EMAIL, delegate: ORIGINAL_DELEGATE_EMAIL});
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the remove button is pressed
        fireEvent.press(screen.getByTestId('remove-delegate'));
        await waitForBatchedUpdatesWithAct();

        // Then the delegate is deleted, since removal now lives on the form instead of re-picking the same member
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.DELETE_VACATION_DELEGATE, null, expect.anything());
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_PROFILE.route);
    });

    it('shows the delegator list instead of the form while the user is someone else’s delegate', async () => {
        // Given a saved delegate, while the user is also the vacation delegate for another member
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {creator: CREATOR_EMAIL, delegate: ORIGINAL_DELEGATE_EMAIL, delegatorFor: [DELEGATE_A_EMAIL]});
        });

        // When the form page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the form is replaced by the explanation, so the user can't change or remove their own delegate, same as on the member picker
        expect(screen.getByText(TestHelper.translateLocal('statusPage.cannotSetVacationDelegate'))).toBeOnTheScreen();
        expect(screen.queryByTestId('select-delegate-a')).not.toBeOnTheScreen();
        expect(screen.queryByTestId('remove-delegate')).not.toBeOnTheScreen();
    });

    it('pops only the form and drops the unsaved pick when the header back button is pressed', async () => {
        // Given a member picked on the picker but not saved yet
        jest.mocked(Navigation.goBack).mockClear();
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM_DRAFT, {delegate: DELEGATE_A_EMAIL});
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the header back button is pressed
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));
        await waitForBatchedUpdatesWithAct();

        // Then only this screen is popped, so a picker opened straight from Profile shows again instead of the whole RHP closing,
        // and the unsaved pick is cleared on the way out
        expect(Navigation.goBack).toHaveBeenCalledWith();
        const draft = await getOnyxValue(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM_DRAFT);
        expect(draft?.delegate).toBeFalsy();
    });

    it('surfaces the EXP_ERROR response message in the error modal and restores the previous delegate on dismissal', async () => {
        // Given a response carrying a server-provided EXP_ERROR message, since a regression once dropped this message
        // for the generic copy and this page owns the guarantee that it reaches the user
        const EXP_ERROR_MESSAGE = 'This delegate has already been assigned as your submitsTo approver.';
        apiSideEffectSpy = jest
            .spyOn(require('@libs/API'), 'makeRequestWithSideEffects')
            .mockImplementation(() => Promise.resolve({jsonCode: CONST.JSON_CODE.EXP_ERROR, message: EXP_ERROR_MESSAGE}));
        // jest.mock's factory functions (unlike jest.spyOn) are not reset by jest.restoreAllMocks() in afterEach, so call counts otherwise leak across tests in this file.
        jest.mocked(Navigation.goBack).mockClear();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a delegate row is tapped and the request fails
        fireEvent.press(screen.getByTestId('select-delegate-a'));
        await waitForBatchedUpdatesWithAct();

        // Then the server's own message reaches the error modal, the page does not navigate away, and no delegate or error is left behind
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({prompt: EXP_ERROR_MESSAGE}));
        expect(Navigation.goBack).not.toHaveBeenCalled();

        const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
        expect(vacationDelegate?.delegate).toBeFalsy();
        expect(vacationDelegate?.errors).toBeFalsy();
    });

    it('falls back to the generic error copy when the response carries no EXP_ERROR message', async () => {
        // Given a failure response with no server-provided message, e.g. a non-EXP_ERROR failure or a transport rejection
        apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve({jsonCode: CONST.JSON_CODE.BAD_REQUEST}));

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a delegate row is tapped and the request fails
        fireEvent.press(screen.getByTestId('select-delegate-a'));
        await waitForBatchedUpdatesWithAct();

        // Then the generic translation is used instead of a blank or missing prompt
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({prompt: TestHelper.translateLocal('statusPage.vacationDelegateError')}));
    });

    it('ignores a second row selection while the first request is still pending', async () => {
        // Given a request that never resolves, so the first pick stays "in flight" for the duration of the test
        apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => new Promise(() => {}));

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a second row is tapped before the first request settles
        fireEvent.press(screen.getByTestId('select-delegate-a'));
        fireEvent.press(screen.getByTestId('select-delegate-b'));
        await waitForBatchedUpdatesWithAct();

        // Then only the first pick is sent, so a fast double tap cannot fire two overlapping requests
        expect(apiSideEffectSpy).toHaveBeenCalledTimes(1);
        expect(apiSideEffectSpy).toHaveBeenCalledWith(
            SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE,
            expect.objectContaining({vacationDelegateEmail: DELEGATE_A_EMAIL}),
            expect.anything(),
        );
    });

    it('rolls back the optimistic delegate instead of leaving a stuck pending row when the request rejects', async () => {
        // Given a request that rejects outright, simulating a transport failure (e.g. connection dropped after the tap)
        // rather than a resolved response with a jsonCode
        apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.reject(new Error('Failed to fetch')));
        // jest.mock's factory functions (unlike jest.spyOn) are not reset by jest.restoreAllMocks() in afterEach, so call counts otherwise leak across tests in this file.
        jest.mocked(Navigation.goBack).mockClear();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a delegate row is tapped and the request rejects
        fireEvent.press(screen.getByTestId('select-delegate-a'));
        await waitForBatchedUpdatesWithAct();

        // Then the optimistic delegate and any error are rolled back instead of left stuck, and the page does not navigate away
        expect(Navigation.goBack).not.toHaveBeenCalled();
        const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
        expect(vacationDelegate?.pendingAction).toBeFalsy();
        expect(vacationDelegate?.delegate).toBeFalsy();
        expect(vacationDelegate?.errors).toBeFalsy();

        // When the same row is tapped again after the failed request has settled
        fireEvent.press(screen.getByTestId('select-delegate-a'));
        await waitForBatchedUpdatesWithAct();

        // Then the new tap is not ignored as "still pending", since the earlier request already settled
        expect(apiSideEffectSpy).toHaveBeenCalledTimes(2);
    });

    it('rolls back to the last confirmed delegate, not to an unconfirmed one, when a previous change is still unresolved', async () => {
        // Given a request that never resolves, so the optimistic write for the second selection stays in place for the
        // assertion, and an NVP already left in the state a failed change the user has not dismissed leaves behind: delegateA shown but never saved
        apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => new Promise(() => {}));
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
                creator: CREATOR_EMAIL,
                delegate: DELEGATE_A_EMAIL,
                previousDelegate: ORIGINAL_DELEGATE_EMAIL,
                errors: getMicroSecondOnyxErrorWithTranslationKey('statusPage.vacationDelegateError'),
            });
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a different delegate is picked
        fireEvent.press(screen.getByTestId('select-delegate-b'));
        await waitForBatchedUpdatesWithAct();

        // Then the rollback target is the original confirmed delegate, not the unconfirmed delegateA; the API call is
        // mocked out, so the optimistic data it was handed is where that target is visible
        expect(apiSideEffectSpy).toHaveBeenLastCalledWith(
            SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE,
            expect.objectContaining({vacationDelegateEmail: DELEGATE_B_EMAIL}),
            expect.objectContaining({
                optimisticData: [expect.objectContaining({value: expect.objectContaining({delegate: DELEGATE_B_EMAIL, previousDelegate: ORIGINAL_DELEGATE_EMAIL})})],
            }),
        );
    });

    it('rolls back the optimistic delegate instead of leaving an unconfirmed policy diff behind when the screen loses focus before the response resolves', async () => {
        // Given a request whose resolution is held open, so the screen can navigate away before it settles
        let resolveSideEffect: (response: {jsonCode: number; data?: {policyDiff: unknown}}) => void = () => {};
        apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveSideEffect = resolve;
                }),
        );
        jest.mocked(Navigation.navigate).mockClear();

        renderPageWithStack();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('select-delegate-a'));
        await waitForBatchedUpdatesWithAct();

        // When the screen loses focus before the request settles, simulating the user swiping the RHP away (or otherwise navigating off this screen)
        await act(async () => {
            testNavigationRef.current?.navigate('Other');
            await waitForBatchedUpdatesWithAct();
        });

        // When the request then resolves with a 305 policy diff warning
        await act(async () => {
            resolveSideEffect({jsonCode: CONST.JSON_CODE.POLICY_DIFF_WARNING, data: {policyDiff: {adminPolicies: [], nonAdminPolicies: []}}});
            await waitForBatchedUpdatesWithAct();
        });

        // Then the missing-workspaces step is not pushed onto whatever the user navigated to instead, since there's no longer a
        // screen to carry them into it, and the optimistic delegate/policy diff are rolled back rather than left unconfirmed
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.SETTINGS_VACATION_DELEGATE_MISSING_WORKSPACES);

        const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
        expect(vacationDelegate?.delegate).toBeFalsy();
        expect(vacationDelegate?.policyDiff).toBeFalsy();
        expect(vacationDelegate?.pendingAction).toBeFalsy();
        expect(vacationDelegate?.errors).toBeFalsy();
    });
});
