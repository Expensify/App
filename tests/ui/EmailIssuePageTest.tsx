import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import type useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import type * as NetworkStateModule from '@libs/NetworkState';

import EmailIssuePage from '@pages/settings/EmailIssue';

import * as UserActions from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';

import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const LOGIN = 'test@user.com';

let mockIsOffline = false;
let mockAccountMetadataStatus: 'loading' | 'loaded' = 'loaded';

jest.mock('@hooks/useOnyx', () => {
    const actualUseOnyx = jest.requireActual<{default: typeof useOnyx}>('@hooks/useOnyx').default;

    return {
        __esModule: true,
        default: (...args: Parameters<typeof useOnyx>) => {
            const result = actualUseOnyx(...args);
            // Inlined literal (not ONYXKEYS.ACCOUNT): jest.mock factories can't reference out-of-scope imports.
            return args.at(0) === 'account' ? [result.at(0), {status: mockAccountMetadataStatus}] : result;
        },
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

// `useNetwork` reads this through `useSyncExternalStore` without a notification, so set it before the render
// under test rather than after.
jest.mock('@libs/NetworkState', () => ({
    ...jest.requireActual<typeof NetworkStateModule>('@libs/NetworkState'),
    getIsOffline: () => mockIsOffline,
}));

// The real confirm modal is bridged through the global modal system, which needs Navigation methods this file's
// lightweight Navigation mock doesn't provide. Stub the hook instead so tests can assert on what EmailIssuePage
// asks it to show and control how it resolves.
const mockShowConfirmModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () =>
    jest.fn(() => ({
        showConfirmModal: mockShowConfirmModal,
    })),
);

// Who the current user is isn't what this page's own logic is about (that's CurrentUserPersonalDetailsProvider's
// concern); fix it to a constant so the login-interpolated copy is deterministic here.
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'test@user.com', accountID: 1})));

// requestEmailUnblock itself (the API.write call, optimistic/success/failure shape) is covered in
// tests/actions/UserTest.ts. Here it's mocked so the page's own effects (redirect, retry modal, offline guard)
// can be driven directly through Onyx instead of depending on that action's real implementation.
jest.mock('@userActions/User', () => ({
    requestEmailUnblock: jest.fn(),
}));

jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

const mockRequestEmailUnblock = jest.mocked(UserActions.requestEmailUnblock);

function renderPage() {
    return render(
        <LocaleContextProvider>
            <EmailIssuePage />
        </LocaleContextProvider>,
    );
}

describe('EmailIssuePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockIsOffline = false;
        mockAccountMetadataStatus = 'loaded';
        mockShowConfirmModal.mockReset().mockResolvedValue({action: 'CLOSE'});
        mockRequestEmailUnblock.mockClear();
        jest.mocked(Navigation.goBack).mockClear();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('navigates back once the account loads and the flag is already false (stale deep link)', async () => {
        // Given the account has finished loading and there is no email delivery failure
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasEmailDeliveryFailure: false});
        });

        // When the page mounts
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it redirects away instead of showing stale fix-it steps
        expect(Navigation.goBack).toHaveBeenCalled();
    });

    it('does not redirect while the account is still loading', async () => {
        // Given the account is still loading
        mockAccountMetadataStatus = 'loading';

        // When the page mounts
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it must not treat the not-yet-loaded `false` as a real "no failure" and redirect away
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('flips the flag false and navigates back once the unblock succeeds', async () => {
        // Given a user with an email delivery failure viewing the page
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasEmailDeliveryFailure: true});
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();
        expect(Navigation.goBack).not.toHaveBeenCalled();

        // When the backend confirms the unblock (the response's onyxData clears the flag)
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasEmailDeliveryFailure: false});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the page leaves
        expect(Navigation.goBack).toHaveBeenCalled();
    });

    it('shows the retry modal when isUnblockingEmail settles false but the flag is still true, and retries on confirm', async () => {
        // Given a user with an email delivery failure who has just pressed the unblock button
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasEmailDeliveryFailure: true, isUnblockingEmail: true});
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        mockShowConfirmModal.mockResolvedValue({action: 'CONFIRM'});

        // When the request settles but the failure flag is still set (a 200 that did not unblock the login)
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isUnblockingEmail: false});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the generic retry modal is shown
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: TestHelper.translateLocal('emailIssuePage.errorTitle'),
                prompt: TestHelper.translateLocal('emailIssuePage.errorPrompt'),
            }),
        );

        // And pressing "Try again" (CONFIRM) retries the unblock request
        await waitForBatchedUpdatesWithAct();
        expect(mockRequestEmailUnblock).toHaveBeenCalledTimes(1);
    });

    it('does not retry from the modal while offline', async () => {
        // Given a user with an email delivery failure whose unblock attempt just failed, while offline
        mockIsOffline = true;
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasEmailDeliveryFailure: true, isUnblockingEmail: true});
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        mockShowConfirmModal.mockResolvedValue({action: 'CONFIRM'});

        // When the request settles with the failure flag still set
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isUnblockingEmail: false});
        });
        await waitForBatchedUpdatesWithAct();

        // Then confirming "Try again" while offline must not queue another request indefinitely
        expect(mockRequestEmailUnblock).not.toHaveBeenCalled();
    });

    it('disables the main unblock button while offline', async () => {
        // Given a user with an email delivery failure who is offline
        mockIsOffline = true;
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasEmailDeliveryFailure: true});
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the user presses the main button anyway
        fireEvent.press(screen.getByText(TestHelper.translateLocal('emailIssuePage.completedSteps')));
        await waitForBatchedUpdatesWithAct();

        // Then the request is not sent (Button's own isDisabled guard swallows the press)
        expect(mockRequestEmailUnblock).not.toHaveBeenCalled();
    });

    it('renders the fix-it steps with the current login interpolated', async () => {
        // Given a user with an email delivery failure
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasEmailDeliveryFailure: true});
        });

        // When the page renders
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the intro and confirm-email steps reference the account's own login
        expect(screen.getAllByText(new RegExp(LOGIN)).length).toBeGreaterThan(0);
    });
});
