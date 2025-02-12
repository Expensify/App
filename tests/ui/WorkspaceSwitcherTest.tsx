import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import * as Localize from '@libs/Localize';
import type Navigation from '@libs/Navigation/Navigation';
import * as AppActions from '@userActions/App';
import * as User from '@userActions/User';
import App from '@src/App';
import ONYXKEYS from '@src/ONYXKEYS';
import type {NativeNavigationMock} from '../../__mocks__/@react-navigation/native';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(60000);

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        triggerTransitionEnd: jest.fn(),
    };
});
TestHelper.setupApp();

async function signInAndGetApp(): Promise<void> {
    // Render the App and sign in as a test user.
    render(<App />);
    await waitForBatchedUpdatesWithAct();

    const hintText = Localize.translateLocal('loginForm.loginForm');
    const loginForm = await screen.findAllByLabelText(hintText);
    expect(loginForm).toHaveLength(1);

    await act(async () => {
        await TestHelper.signInWithTestUser();
    });
    await waitForBatchedUpdatesWithAct();

    User.subscribeToUserEvents();
    await waitForBatchedUpdates();

    AppActions.setSidebarLoaded();

    await waitForBatchedUpdatesWithAct();
}

async function navigateToWorkspaceSwitcher(): Promise<void> {
    const workspaceSwitcherButton = await screen.findByTestId('WorkspaceSwitcherButton');
    fireEvent(workspaceSwitcherButton, 'press');
    await act(() => {
        (NativeNavigation as NativeNavigationMock).triggerTransitionEnd();
    });
    await waitForBatchedUpdatesWithAct();
}

describe('WorkspaceSwitcherPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();

        // Unsubscribe to pusher channels
        PusherHelper.teardown();
    });

    it('navigates away when a workspace is selected and `isFocused` is true', async () => {
        await signInAndGetApp();
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(true);

        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, {
            [`${ONYXKEYS.COLLECTION.POLICY}1` as const]: LHNTestUtils.getFakePolicy('1', 'Workspace A'),
            [`${ONYXKEYS.COLLECTION.POLICY}2` as const]: LHNTestUtils.getFakePolicy('2', 'Workspace B'),
            [`${ONYXKEYS.COLLECTION.POLICY}3` as const]: LHNTestUtils.getFakePolicy('3', 'Workspace C'),
        });

        await navigateToWorkspaceSwitcher();

        const workspaceRowB = screen.getByLabelText('Workspace B');
        fireEvent.press(workspaceRowB);
        expect(screen.queryByTestId('WorkspaceSwitcherPage')).toBeNull();
    });

    it('does not navigate away when a workspace is selected and `isFocused` is false', async () => {
        await signInAndGetApp();
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(false);

        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, {
            [`${ONYXKEYS.COLLECTION.POLICY}1` as const]: LHNTestUtils.getFakePolicy('1', 'Workspace A'),
            [`${ONYXKEYS.COLLECTION.POLICY}2` as const]: LHNTestUtils.getFakePolicy('2', 'Workspace B'),
            [`${ONYXKEYS.COLLECTION.POLICY}3` as const]: LHNTestUtils.getFakePolicy('3', 'Workspace C'),
        });

        await navigateToWorkspaceSwitcher();

        const workspaceRowB = screen.getByLabelText('Workspace B');
        fireEvent.press(workspaceRowB);
        expect(screen.getByTestId('WorkspaceSwitcherPage')).toBeOnTheScreen();
    });
});
