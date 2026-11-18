import {act, fireEvent, render, screen} from '@testing-library/react-native';

import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';

import EscapeHandler from '@navigation/AppNavigator/KeyboardShortcutsHandler/EscapeHandler';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as KeyboardShortcutMock from 'tests/utils/keyboardShortcutMock';
import type * as MfaRealUiMocks from 'tests/utils/mfa/realUi/mocks';

import React from 'react';
import Onyx from 'react-native-onyx';
import {pressEscape as pressEscapeKey} from 'tests/utils/keyboardShortcutMock';
import {MFA_TEST_ACCOUNT_ID} from 'tests/utils/mfa/flowFixtures';
import renderMfaUi from 'tests/utils/mfa/realUi/harness';
import {finalizeOutcomeControl, loadRegistrationStateControl, pendingModalClose, resetMfaUiMocks, validateDeviceControl} from 'tests/utils/mfa/realUi/mocks';
import {translateLocal} from 'tests/utils/TestHelper';
import waitForBatchedUpdatesWithAct from 'tests/utils/waitForBatchedUpdatesWithAct';

// The same mocks as the UI walk in `viewMatchesMachine.test.tsx`; see the comments there.
jest.mock('@hooks/useResponsiveLayout');
jest.mock('@libs/XStateInspector', () => ({__esModule: true, default: {inspect: undefined}}));
jest.mock('@components/MultifactorAuthentication/machine/mfaActors', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').mfaActorsMock());
jest.mock('@components/MultifactorAuthentication/biometrics/captureRegistrationState', () =>
    jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').captureRegistrationStateMock(),
);
jest.mock('@components/RenderHTML', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').renderHtmlMock());
jest.mock('@components/ValidateCodeCountdown', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').validateCodeCountdownMock());
jest.mock('@components/Modal/ReanimatedModal', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').reanimatedModalMock());
jest.mock('@components/MultifactorAuthentication/useSyncMfaModalNavigatorWithHistory', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').syncHistoryMock());
jest.mock('@libs/Navigation/Navigation', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').navigationMock());
jest.mock('@libs/actions/User', () => jest.requireActual<typeof MfaRealUiMocks>('tests/utils/mfa/realUi/mocks').userActionsMock());

jest.mock('react-native-key-command', () => jest.requireActual<typeof KeyboardShortcutMock>('tests/utils/keyboardShortcutMock').keyCommandMock());
// Escape is a web concern, and only the web binder honours `captureOnInputs`, so the stack runs with it here.
jest.mock('@libs/KeyboardShortcut/bindHandlerToKeydownEvent', () => jest.requireActual<Record<string, unknown>>('@libs/KeyboardShortcut/bindHandlerToKeydownEvent/index.ts'));

const TEST_ID = CONST.MULTIFACTOR_AUTHENTICATION.TEST_ID;
const NO_CREDENTIALS = {hasServerCredentials: false, hasLocalCredentials: false, hasEverAcceptedSoftPrompt: false};

/** Presses Escape, optionally from a focused input, and flushes the Onyx updates it triggers. */
async function pressEscape(target?: HTMLElement) {
    act(() => pressEscapeKey(target));
    await waitForBatchedUpdatesWithAct();
}

function isCancelConfirmVisible() {
    return screen.queryByText(translateLocal('multifactorAuthentication.biometricsTest.areYouSureToReject')) !== null;
}

async function startFlow() {
    // Mounted first, like the app root's handler.
    render(<EscapeHandler />);
    const {executeScenario} = renderMfaUi();
    await waitForBatchedUpdatesWithAct();
    await act(async () => executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST));
    await waitForBatchedUpdatesWithAct();
    fireEvent(screen.getByTestId(TEST_ID.INITIAL_SCREEN), 'layout', {nativeEvent: {layout: {width: 1, height: 1, x: 0, y: 0}}});
    await waitForBatchedUpdatesWithAct();
}

async function settle(settleActor: () => void) {
    await act(async () => settleActor());
    await waitForBatchedUpdatesWithAct();
}

describe('the MFA Escape shortcut', () => {
    // Sits below the MFA shortcut, so it runs only when Escape gets past it.
    const fallThroughHandler = jest.fn();
    let unsubscribeFallThrough: () => void;

    beforeEach(async () => {
        resetMfaUiMocks();
        unsubscribeFallThrough = KeyboardShortcut.subscribe('Escape', fallThroughHandler, null, [], true, false);
        await act(async () => {
            await Onyx.clear();
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: MFA_TEST_ACCOUNT_ID});
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        unsubscribeFallThrough();
        jest.clearAllMocks();
    });

    it('opens the cancel confirmation on the transparent initial screen', async () => {
        // Given an MFA flow on its transparent initial screen, which has no UI of its own to cancel from
        await startFlow();

        // When the user presses Escape
        await pressEscape();

        // Then the cancel confirmation opens and Escape stops there, so the app handler does not dismiss the modal underneath
        expect(isCancelConfirmVisible()).toBe(true);
        expect(fallThroughHandler).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('opens the cancel confirmation on the validate-code screen while its input has focus', async () => {
        // Given an MFA flow on the validate-code screen, where the code input usually has focus
        await startFlow();
        await settle(() => validateDeviceControl.resolve({success: true}));
        await settle(() => loadRegistrationStateControl.resolve(NO_CREDENTIALS));
        expect(screen.getByTestId(TEST_ID.VALIDATE_CODE_INPUT)).toBeOnTheScreen();

        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();
        expect(document.activeElement).toBe(input);

        // When the user presses Escape while typing in that input
        await pressEscape(input);
        input.remove();

        // Then the cancel confirmation still opens, because a focused input must not swallow the user's way out
        expect(isCancelConfirmVisible()).toBe(true);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('opens the cancel confirmation on the prompt screen', async () => {
        // Given an MFA flow on the biometrics prompt screen
        await startFlow();
        await settle(() => validateDeviceControl.resolve({success: true}));
        await settle(() => loadRegistrationStateControl.resolve({...NO_CREDENTIALS, hasLocalCredentials: true}));
        expect(screen.getByTestId(TEST_ID.PROMPT_CONFIRM_BUTTON)).toBeOnTheScreen();

        // When the user presses Escape
        await pressEscape();

        // Then the cancel confirmation opens instead of the modal closing, so the flow is never abandoned by accident
        expect(isCancelConfirmVisible()).toBe(true);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('closes the modal on an outcome screen and keeps Escape to itself while it closes', async () => {
        // Given an MFA flow that has reached an outcome screen, where there is nothing left to cancel
        await startFlow();
        await settle(() => validateDeviceControl.reject());
        await settle(() => finalizeOutcomeControl.resolve({callbackResponse: CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN}));
        expect(screen.getByTestId(TEST_ID.OUTCOME_SCREEN)).toBeOnTheScreen();

        // When the user presses Escape
        await pressEscape();

        // Then the modal closes without asking for confirmation, because the flow is already over
        expect(isCancelConfirmVisible()).toBe(false);
        expect(fallThroughHandler).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();

        // And the app's Escape handler re-subscribed on top of the stack while the modal is still animating closed
        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: true});
        });
        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: false});
        });
        await waitForBatchedUpdatesWithAct();

        // When the user presses Escape again
        await pressEscape();

        // Then Escape stops at the MFA shortcut, so the screen underneath is not dismissed while the modal is still on screen
        expect(fallThroughHandler).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();

        // When the close animation finishes
        act(() => pendingModalClose.run());
        await waitForBatchedUpdatesWithAct();
        // Then the modal is gone, so the closing state really ends with the modal unmounted
        expect(screen.queryByTestId(TEST_ID.MODAL_BACKDROP)).not.toBeOnTheScreen();
    });

    it('keeps Escape from the app without requesting another cancel while the confirmation is visible', async () => {
        // Given an MFA flow with the cancel confirmation already open
        await startFlow();
        await pressEscape();

        // When the user presses Escape again
        await pressEscape();

        // Then the keydown stops at the MFA shortcut and the confirmation stays up, so only its own keyup handling
        // dismisses it. The modal shell is mocked here, so that dismissal is pinned in `escapeConfirmModalDismissal.test.tsx`.
        expect(isCancelConfirmVisible()).toBe(true);
        expect(fallThroughHandler).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('still handles Escape after the app handler re-subscribes', async () => {
        // Given an MFA flow where the app's Escape handler re-subscribed after the MFA shortcut
        await startFlow();
        await pressEscape();
        fireEvent.press(screen.getByTestId(TEST_ID.CANCEL_DIALOG_DISMISS_BUTTON));
        await waitForBatchedUpdatesWithAct();
        expect(isCancelConfirmVisible()).toBe(false);

        // Toggling the alert-modal flag re-subscribes `EscapeHandler`.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: true});
        });
        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: false});
        });
        await waitForBatchedUpdatesWithAct();

        // When the user presses Escape
        await pressEscape();

        // Then the cancel confirmation still opens, because the app handler stays out of the way while the MFA modal is on screen
        expect(isCancelConfirmVisible()).toBe(true);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });
});
