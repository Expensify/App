import {act, fireEvent, render, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import DelegateNoAccessModalProvider from '@components/DelegateNoAccessModalProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import type BaseModalProps from '@components/Modal/types';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import Growl from '@libs/Growl';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as NetworkState from '@libs/NetworkState';

import DomainMemberDetailsPage from '@pages/domain/Members/DomainMemberDetailsPage';

import redirectToSignIn from '@userActions/SignInRedirect';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {View as NativeView} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/API');
jest.mock('@userActions/SignInRedirect');
jest.mock('@hooks/useResponsiveLayout');
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/RenderHTML', () => {
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children: React.ReactNode}>}>('react-native');
    return {__esModule: true, default: ({html}: {html: string}) => <Text>{html}</Text>};
});
jest.mock('@components/ScreenWrapper', () => {
    const {View} = jest.requireActual<{View: typeof NativeView}>('react-native');
    return {__esModule: true, default: ({children}: {children: React.ReactNode}) => <View>{children}</View>};
});
jest.mock('@pages/ErrorPage/NotFoundPage', () => {
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children: React.ReactNode}>}>('react-native');
    return {__esModule: true, default: () => <Text>Not found</Text>};
});
jest.mock('@components/Modal', () => {
    const {View} = jest.requireActual<{View: typeof NativeView}>('react-native');
    const {useEffect} = jest.requireActual<typeof React>('react');
    return {
        __esModule: true,
        default: function MockModal({children, isVisible, onModalHide}: BaseModalProps) {
            useEffect(() => {
                if (isVisible) {
                    return;
                }
                onModalHide?.();
            }, [isVisible, onModalHide]);
            return isVisible ? <View testID="confirmation">{children}</View> : null;
        },
    };
});

const DOMAIN_ACCOUNT_ID = 100;
const ADMIN_ACCOUNT_ID = 1;
const MEMBER_ACCOUNT_ID = 2;
const OTHER_MEMBER_ACCOUNT_ID = 3;

const SIGN_OUT_TEXT = 'Sign out on all devices';
const MEMBER_CONFIRMATION_TEXT = 'This will sign out this member on every device. They’ll need to sign in again to use Expensify.';
const MEMBER_ERROR_TEXT = 'We couldn’t sign out this member. Please try again.';
const MEMBER_SUCCESS_TEXT = 'This member has been signed out on all devices.';
const SELF_CONFIRMATION_TEXT = 'You’ll be signed out on all devices, including this one. You’ll need to sign in again to use Expensify.';
const SELF_SUCCESS_TEXT = 'You’ve been signed out on all devices.';
const COMPLETED_RESPONSE = {jsonCode: CONST.JSON_CODE.SUCCESS, status: CONST.DOMAIN.REVOKE_MEMBER_SESSIONS_STATUS.COMPLETED, callerSignedOut: false};

const mockAPI = jest.mocked(API);

type DomainMemberDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

// The screen does not read navigation; this inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as DomainMemberDetailsPageProps['navigation'];

function renderPage(accountID = MEMBER_ACCOUNT_ID) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, ModalProvider, DelegateNoAccessModalProvider]}>
            <DomainMemberDetailsPage
                route={{key: 'domain-member-details', name: SCREENS.DOMAIN.MEMBER_DETAILS, params: {domainAccountID: DOMAIN_ACCOUNT_ID, accountID}}}
                navigation={navigation}
            />
        </ComposeProviders>,
    );
}

async function setUpDomain({currentUserAccountID = ADMIN_ACCOUNT_ID, isValidated = true} = {}) {
    await Onyx.set(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: `user${currentUserAccountID}@acme.example`});
    await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [ADMIN_ACCOUNT_ID]: {accountID: ADMIN_ACCOUNT_ID, login: 'admin@acme.example'},
        [MEMBER_ACCOUNT_ID]: {accountID: MEMBER_ACCOUNT_ID, login: 'alex@acme.example'},
        [OTHER_MEMBER_ACCOUNT_ID]: {accountID: OTHER_MEMBER_ACCOUNT_ID, login: 'casey@acme.example'},
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
        accountID: DOMAIN_ACCOUNT_ID,
        email: '+@acme.example',
        validated: isValidated,
        [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${ADMIN_ACCOUNT_ID}`]: ADMIN_ACCOUNT_ID,
    });
    await waitForBatchedUpdatesWithAct();
}

async function openConfirmation() {
    // MenuItem ignores a press that carries no event, so pass one like a real touch would.
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT}), {nativeEvent: {}});
    await waitForBatchedUpdatesWithAct();
}

describe('Domain member sign out on all devices', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.spyOn(Growl, 'success').mockImplementation(() => {});
        NetworkState.setHasRadio(true);
        await Onyx.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        NetworkState.setHasRadio(true);
    });

    it('shows the action to a domain admin on a verified domain', async () => {
        // Given an admin of a verified domain
        await setUpDomain();

        // When they open a member's details
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then they can sign the member out from a standard action row
        expect(screen.getByText(SIGN_OUT_TEXT)).toBeOnTheScreen();
    });

    it('hides the action on an unverified domain', async () => {
        // Given an admin of a domain that is not verified yet, where the server would refuse the request
        await setUpDomain({isValidated: false});

        // When they open a member's details
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the action is not offered
        expect(screen.queryByText(SIGN_OUT_TEXT)).not.toBeOnTheScreen();
    });

    it('does not show the action to a member who is not a domain admin', async () => {
        // Given a domain member without admin access opens a link to another member's details
        await setUpDomain({currentUserAccountID: OTHER_MEMBER_ACCOUNT_ID});

        // When the page renders
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then they see Not Found instead of the admin action
        expect(screen.getByText('Not found')).toBeOnTheScreen();
        expect(screen.queryByText(SIGN_OUT_TEXT)).not.toBeOnTheScreen();
    });

    it('shows the copilot no-access modal instead of a confirmation the server would reject', async () => {
        // Given an admin's account is being used by a copilot, whose session the server refuses for this action
        await setUpDomain();
        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'copilot@example.com'}});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the copilot presses the action
        await openConfirmation();
        const dialog = within(screen.getByTestId('confirmation'));

        // Then they are told copilots can't do this, and nothing is sent
        expect(dialog.getByText('Not so fast...')).toBeOnTheScreen();
        expect(dialog.queryByText(MEMBER_CONFIRMATION_TEXT)).not.toBeOnTheScreen();
        expect(dialog.queryByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT})).not.toBeOnTheScreen();
        expect(mockAPI.makeRequestWithSideEffects).not.toHaveBeenCalled();
    });

    it('explains the effect on the member and cancels without submitting', async () => {
        // Given an admin on a member's details
        await setUpDomain();
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When they open the confirmation and cancel
        await openConfirmation();
        const confirmation = within(screen.getByTestId('confirmation'));
        expect(confirmation.getByText(MEMBER_CONFIRMATION_TEXT)).toBeOnTheScreen();
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: 'Cancel'}));
        await waitForBatchedUpdatesWithAct();

        // Then nothing is sent and no success toast appears
        expect(screen.queryByTestId('confirmation')).not.toBeOnTheScreen();
        expect(mockAPI.makeRequestWithSideEffects).not.toHaveBeenCalled();
        expect(Growl.success).not.toHaveBeenCalled();
    });

    it('shows the offline dialog instead of the confirmation while offline', async () => {
        // Given the admin lost connectivity on a member's details
        await setUpDomain();
        renderPage();
        await waitForBatchedUpdatesWithAct();
        act(() => NetworkState.setHasRadio(false));

        // When they press the action
        await openConfirmation();
        const confirmation = within(screen.getByTestId('confirmation'));

        // Then only the informational dialog is offered, and reconnecting submits nothing
        expect(confirmation.getByText('You appear to be offline.')).toBeOnTheScreen();
        expect(confirmation.queryByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT})).not.toBeOnTheScreen();
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: 'Got it'}));
        act(() => NetworkState.setHasRadio(true));
        await waitForBatchedUpdatesWithAct();
        expect(mockAPI.makeRequestWithSideEffects).not.toHaveBeenCalled();
    });

    it('disables confirmation after a disconnect and never submits after cancel and reconnect', async () => {
        // Given the confirmation was opened while online
        await setUpDomain();
        renderPage();
        await waitForBatchedUpdatesWithAct();
        await openConfirmation();
        const confirmation = within(screen.getByTestId('confirmation'));

        // When connectivity is lost while it is open
        act(() => NetworkState.setHasRadio(false));
        await waitForBatchedUpdatesWithAct();

        // Then the confirm button is disabled with offline feedback, and cancelling stays cancelled after reconnect
        expect(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT})).toBeDisabled();
        expect(confirmation.getByText('You appear to be offline.')).toBeOnTheScreen();
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: 'Cancel'}));
        await waitForBatchedUpdatesWithAct();
        act(() => NetworkState.setHasRadio(true));
        await waitForBatchedUpdatesWithAct();
        expect(mockAPI.makeRequestWithSideEffects).not.toHaveBeenCalled();
    });

    it('signs out another member and keeps the admin on the details page with a success toast', async () => {
        // Given the server signs out the member and leaves the admin signed in
        mockAPI.makeRequestWithSideEffects.mockResolvedValueOnce(COMPLETED_RESPONSE);
        await setUpDomain();
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin confirms
        await openConfirmation();
        const confirmation = within(screen.getByTestId('confirmation'));
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT}));
        await waitForBatchedUpdatesWithAct();

        // Then one member is sent to the endpoint, the confirmation closes, and the admin stays signed in
        expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledTimes(1);
        expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.REVOKE_DOMAIN_MEMBER_SESSIONS, {
            domainAccountID: DOMAIN_ACCOUNT_ID,
            accountIDList: String(MEMBER_ACCOUNT_ID),
        });
        expect(screen.queryByTestId('confirmation')).not.toBeOnTheScreen();
        expect(screen.getByText(SIGN_OUT_TEXT)).toBeOnTheScreen();
        expect(redirectToSignIn).not.toHaveBeenCalled();
        expect(Growl.success).toHaveBeenCalledWith({bodyText: MEMBER_SUCCESS_TEXT, position: CONST.GROWL.POSITION.BOTTOM_RIGHT});
    });

    it('keeps the error in the confirmation and lets the admin retry', async () => {
        // Given the first request fails with a standard API error
        mockAPI.makeRequestWithSideEffects.mockResolvedValueOnce({jsonCode: 500});
        await setUpDomain();
        renderPage();
        await waitForBatchedUpdatesWithAct();
        await openConfirmation();
        const confirmation = within(screen.getByTestId('confirmation'));

        // When the admin confirms
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT}));
        await waitForBatchedUpdatesWithAct();

        // Then the confirmation stays open with the error, retry and cancel, and no success toast
        expect(confirmation.getByText(MEMBER_ERROR_TEXT)).toBeOnTheScreen();
        expect(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT})).toBeEnabled();
        expect(confirmation.getByRole(CONST.ROLE.BUTTON, {name: 'Cancel'})).toBeEnabled();
        expect(Growl.success).not.toHaveBeenCalled();

        // When the admin retries and the server succeeds
        mockAPI.makeRequestWithSideEffects.mockResolvedValueOnce(COMPLETED_RESPONSE);
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT}));
        await waitForBatchedUpdatesWithAct();

        // Then the member is signed out without reopening the confirmation
        expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledTimes(2);
        expect(screen.queryByTestId('confirmation')).not.toBeOnTheScreen();
        expect(Growl.success).toHaveBeenCalledWith({bodyText: MEMBER_SUCCESS_TEXT, position: CONST.GROWL.POSITION.BOTTOM_RIGHT});
    });

    it('follows the self-service flow when the admin signs out their own account', async () => {
        // Given the admin opens their own details, and the server reports that it signed out the caller too
        mockAPI.makeRequestWithSideEffects.mockResolvedValueOnce({...COMPLETED_RESPONSE, callerSignedOut: true});
        jest.mocked(redirectToSignIn).mockResolvedValueOnce();
        await setUpDomain();
        renderPage(ADMIN_ACCOUNT_ID);
        await waitForBatchedUpdatesWithAct();

        // When they confirm the self-service confirmation
        await openConfirmation();
        const confirmation = within(screen.getByTestId('confirmation'));
        expect(confirmation.getByText(SELF_CONFIRMATION_TEXT)).toBeOnTheScreen();
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT}));
        await waitForBatchedUpdatesWithAct();

        // Then this device returns to sign-in and shows the existing self-service toast, not the member toast
        expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.REVOKE_DOMAIN_MEMBER_SESSIONS, {
            domainAccountID: DOMAIN_ACCOUNT_ID,
            accountIDList: String(ADMIN_ACCOUNT_ID),
        });
        expect(redirectToSignIn).toHaveBeenCalledWith(CONST.SIGN_OUT_REASON.USER_SIGN_OUT);
        expect(Growl.success).toHaveBeenCalledTimes(1);
        expect(Growl.success).toHaveBeenCalledWith({bodyText: SELF_SUCCESS_TEXT, position: CONST.GROWL.POSITION.BOTTOM_RIGHT});
    });
});
