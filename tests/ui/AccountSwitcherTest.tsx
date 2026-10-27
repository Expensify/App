import {act, fireEvent, render, screen} from '@testing-library/react-native';

import AccountSwitcher from '@components/AccountSwitcher';
import AccountSwitcherButton from '@components/AccountSwitcherButton';
import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import {clearOnyxForDelegateTransition} from '@libs/actions/Delegate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import {TextInput as RNTextInput} from 'react-native';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: (): {
        renderProductTrainingTooltip: () => null;
        shouldShowProductTrainingTooltip: boolean;
        hideProductTrainingTooltip: () => void;
    } => ({
        renderProductTrainingTooltip: () => null,
        shouldShowProductTrainingTooltip: false,
        hideProductTrainingTooltip: () => {},
    }),
}));

// ReanimatedModal animates its content in, which doesn't work in tests because
// animations are disabled. This mock renders visible modal content synchronously instead.
jest.mock('@components/Modal/ReanimatedModal', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns an untyped module; the typeof React annotation on the destructure enforces the expected shape
    const {createElement, Fragment}: typeof React = require('react');

    function MockReanimatedModal({isVisible, children}: {isVisible: boolean; children: React.ReactNode}) {
        if (!isVisible) {
            return null;
        }

        return createElement(Fragment, null, children);
    }
    return MockReanimatedModal;
});

jest.mock('@components/SearchBar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/consistent-type-imports -- require() returns an untyped module; the React Native component annotation is supplied explicitly
    const {TextInput}: typeof import('react-native') = require('react-native');
    function MockSearchBar({label, inputValue, onChangeText}: {label: string; inputValue: string; onChangeText: (value: string) => void}) {
        return (
            <TextInput
                accessibilityLabel={label}
                value={inputValue}
                onChangeText={onChangeText}
            />
        );
    }
    return MockSearchBar;
});

const mockFetch = TestHelper.setupGlobalFetchMock();

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'test@user.com';
const CURRENT_USER_DISPLAY_NAME = 'Test User';
const DELEGATOR_ACCOUNT_ID = 2;
const DELEGATOR_EMAIL = 'delegator@example.com';
const DELEGATOR_DISPLAY_NAME = 'Delegator User';
const SWITCH_BUTTON_TEXT = 'Switch';
const POPOVER_HEADER_TEXT = 'Switch accounts:';

function renderAccountSwitcher() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, PersonalDetailsByLoginProvider, LocaleContextProvider, CurrentReportIDContextProvider, CurrentUserPersonalDetailsProvider]}>
            <PortalProvider>
                <AccountSwitcher isScreenFocused />
            </PortalProvider>
        </ComposeProviders>,
    );
}

// Wide layouts render the button on its own in the settings top bar rather than inside AccountSwitcher.
function renderAccountSwitcherButton() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, PersonalDetailsByLoginProvider, LocaleContextProvider, CurrentReportIDContextProvider, CurrentUserPersonalDetailsProvider]}>
            <PortalProvider>
                <AccountSwitcherButton isScreenFocused />
            </PortalProvider>
        </ComposeProviders>,
    );
}

async function addDelegators(count = 1) {
    const generatedDelegators = Array.from({length: count}, (_, index) => ({
        email: index === 0 ? DELEGATOR_EMAIL : `delegator-${index}@example.com`,
        role: CONST.DELEGATE_ROLE.ALL,
    }));
    const generatedPersonalDetails = Object.fromEntries(
        generatedDelegators.map(({email}, index) => [
            DELEGATOR_ACCOUNT_ID + index,
            {
                accountID: DELEGATOR_ACCOUNT_ID + index,
                login: email,
                displayName: index === 0 ? DELEGATOR_DISPLAY_NAME : `Delegator User ${index}`,
            },
        ]),
    );
    await act(async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {
            delegatedAccess: {
                delegators: generatedDelegators,
            },
        });
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, generatedPersonalDetails);
    });
    await waitForBatchedUpdatesWithAct();
}

describe('AccountSwitcher', () => {
    beforeAll(() => {
        // Mirror src/setup: ACCOUNT has a default key state, so Onyx.clear() resets it to a truthy object
        // rather than removing it. Without this the switch simulation below can't reproduce production.
        Onyx.init({keys: ONYXKEYS, initialKeyStates: {[ONYXKEYS.ACCOUNT]: CONST.DEFAULT_ACCOUNT_DATA}});
    });

    beforeEach(async () => {
        await TestHelper.signInWithTestUser(CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL);
        // clearOnyxForDelegateTransition preserves this, so it has to be set for the switch to be distinguishable
        // from a cold start.
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('does not show the Switch button when the user cannot switch accounts', async () => {
        renderAccountSwitcher();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(CURRENT_USER_DISPLAY_NAME)).toBeOnTheScreen();
        expect(screen.getByText(CURRENT_USER_EMAIL)).toBeOnTheScreen();
        expect(screen.queryByText(SWITCH_BUTTON_TEXT)).toBeNull();
    });

    it('shows the Switch button when the user has delegators', async () => {
        await addDelegators();

        renderAccountSwitcher();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(SWITCH_BUTTON_TEXT)).toBeOnTheScreen();
    });

    it('opens the account switcher popover when the Switch button is pressed', async () => {
        await addDelegators();

        renderAccountSwitcher();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(SWITCH_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(POPOVER_HEADER_TEXT)).toBeOnTheScreen();
        expect(screen.getByTestId(`PopoverMenuItem-${DELEGATOR_DISPLAY_NAME}`)).toBeOnTheScreen();
    });

    it.each([
        ['next to the account details', renderAccountSwitcher],
        ['in the top bar', renderAccountSwitcherButton],
    ])('keeps the Switch button visible %s while an account switch reloads the account data', async (_placement, renderSwitcher) => {
        // Given a user who can switch accounts
        await addDelegators();

        renderSwitcher();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(SWITCH_BUTTON_TEXT)).toBeOnTheScreen();

        // When they switch accounts. Drive the real transition rather than imitating it: it resets ONYXKEYS.ACCOUNT
        // to its default object (Onyx.clear does not remove keys that have one) and seeds IS_LOADING_APP.
        await act(async () => {
            await clearOnyxForDelegateTransition();
        });
        await waitForBatchedUpdatesWithAct();

        // Then the button stays on screen for the length of the reload, but doesn't open a menu that would only list
        // the current user because the delegator list hasn't been reloaded yet
        expect(screen.getByText(SWITCH_BUTTON_TEXT)).toBeOnTheScreen();
        fireEvent.press(screen.getByText(SWITCH_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText(POPOVER_HEADER_TEXT)).toBeNull();

        // When OpenApp answers with the new account's data
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: DELEGATOR_EMAIL}});
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        });
        await waitForBatchedUpdatesWithAct();

        // Then the button opens the menu again
        fireEvent.press(screen.getByText(SWITCH_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(POPOVER_HEADER_TEXT)).toBeOnTheScreen();
    });

    it('disables the Switch button as soon as an account is selected, before the account data starts reloading', async () => {
        // Given a user who can switch accounts, and a server that hasn't answered the switch request yet
        await addDelegators();
        mockFetch.pause();

        renderAccountSwitcherButton();
        await waitForBatchedUpdatesWithAct();

        // When they pick an account to switch to
        fireEvent.press(screen.getByText(SWITCH_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();
        // MenuItem ignores presses that carry no event
        fireEvent.press(screen.getByTestId(`PopoverMenuItem-${DELEGATOR_DISPLAY_NAME}`), {nativeEvent: {}});
        await waitForBatchedUpdatesWithAct();

        // Then the button stays on screen but is disabled while the request is pending
        expect(screen.getByText(SWITCH_BUTTON_TEXT)).toBeOnTheScreen();
        expect(screen.getByText(SWITCH_BUTTON_TEXT)).toBeDisabled();

        // When the request settles without switching accounts
        await act(async () => {
            await mockFetch.resume();
        });
        await waitForBatchedUpdatesWithAct();

        // Then the button is enabled again
        expect(screen.getByText(SWITCH_BUTTON_TEXT)).toBeEnabled();
    });

    it('hides the Switch button when the reloaded account data has no account to switch to', async () => {
        // Given a user who can switch accounts
        await addDelegators();

        renderAccountSwitcherButton();
        await waitForBatchedUpdatesWithAct();

        // When they switch accounts and OpenApp answers without any delegated access
        await act(async () => {
            await clearOnyxForDelegateTransition();
        });
        await waitForBatchedUpdatesWithAct();
        await act(async () => {
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        });
        await waitForBatchedUpdatesWithAct();

        // Then the button goes away, since the account they landed on can't switch
        expect(screen.queryByText(SWITCH_BUTTON_TEXT)).toBeNull();
    });

    it('hides the Switch button when a delegator revokes access', async () => {
        // Given a user who can switch accounts
        await addDelegators();

        renderAccountSwitcher();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(SWITCH_BUTTON_TEXT)).toBeOnTheScreen();

        // When a delegator revokes access. This leaves ONYXKEYS.ACCOUNT in place and only empties the delegators, so
        // it is a real loss of the button rather than the momentary gap an account switch creates.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegators: []}});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the button goes away
        expect(screen.queryByText(SWITCH_BUTTON_TEXT)).toBeNull();
    });

    it('does not show the Switch button during a reload for a user who has never been able to switch accounts', async () => {
        // Given a user who can't switch accounts
        renderAccountSwitcherButton();
        await waitForBatchedUpdatesWithAct();

        // When the app reloads the account data
        await act(async () => {
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
        });
        await waitForBatchedUpdatesWithAct();

        // Then no button appears
        expect(screen.queryByText(SWITCH_BUTTON_TEXT)).toBeNull();
    });

    it('does not open the account switcher popover when the name or email is pressed', async () => {
        await addDelegators();

        renderAccountSwitcher();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(CURRENT_USER_DISPLAY_NAME));
        fireEvent.press(screen.getByText(CURRENT_USER_EMAIL));
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(POPOVER_HEADER_TEXT)).toBeNull();
    });

    it('shows search only when there are at least 12 displayed delegators', async () => {
        await addDelegators(CONST.STANDARD_LIST_ITEM_LIMIT - 1);
        const renderResult = renderAccountSwitcher();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(SWITCH_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();
        expect(renderResult.UNSAFE_queryAllByType(RNTextInput)).toHaveLength(0);
        renderResult.unmount();

        await addDelegators(CONST.STANDARD_LIST_ITEM_LIMIT);
        const renderResultAtLimit = renderAccountSwitcher();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(SWITCH_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();
        expect(renderResultAtLimit.UNSAFE_getByType(RNTextInput)).toBeTruthy();
    });

    it('does not show search while acting as a copilot', async () => {
        await addDelegators(CONST.STANDARD_LIST_ITEM_LIMIT);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: DELEGATOR_EMAIL}});
        });
        const renderResult = renderAccountSwitcher();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(SWITCH_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();

        expect(renderResult.UNSAFE_queryAllByType(RNTextInput)).toHaveLength(0);
    });

    it('filters accounts by name and email and clears the query after closing', async () => {
        await addDelegators(CONST.STANDARD_LIST_ITEM_LIMIT);
        const renderResult = renderAccountSwitcher();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(SWITCH_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();

        jest.useFakeTimers();
        fireEvent.changeText(renderResult.UNSAFE_getByType(RNTextInput), 'delegator-11@example.com');
        act(() => jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME));
        jest.useRealTimers();

        expect(screen.queryByTestId(`PopoverMenuItem-${DELEGATOR_DISPLAY_NAME}`)).toBeNull();
        expect(screen.getByTestId('PopoverMenuItem-Delegator User 11')).toBeOnTheScreen();

        fireEvent.press(screen.getByText(SWITCH_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(SWITCH_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();
        expect(renderResult.UNSAFE_getByType(RNTextInput).props.value).toBe('');
        expect(screen.getByTestId(`PopoverMenuItem-${DELEGATOR_DISPLAY_NAME}`)).toBeOnTheScreen();
    });
});
