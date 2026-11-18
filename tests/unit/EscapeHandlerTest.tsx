import {act, render} from '@testing-library/react-native';

import {setIsMfaModalVisible} from '@libs/Navigation/helpers/mfaModalVisibility';
import Navigation from '@libs/Navigation/Navigation';

import EscapeHandler from '@navigation/AppNavigator/KeyboardShortcutsHandler/EscapeHandler';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as KeyboardShortcutMock from 'tests/utils/keyboardShortcutMock';

import React from 'react';
import Onyx from 'react-native-onyx';
import {pressEscape} from 'tests/utils/keyboardShortcutMock';
import waitForBatchedUpdatesWithAct from 'tests/utils/waitForBatchedUpdatesWithAct';

jest.mock('react-native-key-command', () => jest.requireActual<typeof KeyboardShortcutMock>('tests/utils/keyboardShortcutMock').keyCommandMock());

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {dismissModal: jest.fn(), closeRHPFlow: jest.fn(), dismissToSuperWideRHP: jest.fn(), dismissToPreviousRHP: jest.fn()},
    navigationRef: {isReady: () => true, getRootState: () => ({routes: [{name: 'SomeModal'}]}), dispatch: jest.fn()},
}));

describe('EscapeHandler', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        setIsMfaModalVisible(false);
        await act(async () => {
            await Onyx.clear();
        });
        // Given the app's Escape handler is mounted over a modal
        render(<EscapeHandler />);
        await waitForBatchedUpdatesWithAct();
    });

    it('dismisses the modal when no other handler takes Escape', () => {
        // When the user presses Escape
        pressEscape();

        // Then the modal is dismissed
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
    });

    it('does not dismiss the modal underneath while the MFA modal is open or closing', async () => {
        // Given the MFA modal is on screen
        act(() => setIsMfaModalVisible(true));

        // When the user presses Escape, also after the handler re-subscribed on top of the stack
        pressEscape();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: true});
        });
        await act(async () => {
            await Onyx.merge(ONYXKEYS.MODAL, {willAlertModalBecomeVisible: false});
        });
        await waitForBatchedUpdatesWithAct();
        pressEscape();

        // Then nothing is dismissed
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('dismisses the modal again once the MFA modal is closed', () => {
        // Given the MFA modal was on screen and is now gone
        setIsMfaModalVisible(true);
        setIsMfaModalVisible(false);

        // When the user presses Escape
        pressEscape();

        // Then the modal is dismissed
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
    });
});
