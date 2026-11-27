import {act, fireEvent, render, screen} from '@testing-library/react-native';

import HTMLEngineProvider from '@components/HTMLEngineProvider';
import BaseValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';
import ValidateCodeCountdown from '@components/ValidateCodeCountdown';
import ValidateCodeInput from '@components/ValidateCodeInput';

import * as UserActions from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';

import DynamicContactMethodDetailsPage from '@pages/settings/Profile/Contacts/DynamicContactMethodDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import {getGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockIsFocused = true;

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => mockIsFocused,
        useRoute: jest.fn(() => ({name: '', key: '', params: {}})),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    goBack: jest.fn(),
}));

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));

const mockUseDynamicBackPath = jest.requireMock<jest.Mock>('@hooks/useDynamicBackPath');

jest.mock('@components/DelegateNoAccessModalProvider', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@components/DelegateNoAccessModalProvider');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        useDelegateNoAccessState: () => ({isActingAsDelegate: false, isDelegateAccessRestricted: false}),
        useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
    };
});

jest.mock('@libs/actions/User', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@libs/actions/User');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        resetContactMethodValidateCodeSentState: jest.fn(),
    };
});

function HTMLProviderWrapper({children}: {children: React.ReactNode}) {
    return <HTMLEngineProvider>{children}</HTMLEngineProvider>;
}

const fakeEmail = 'fake@gmail.com';
const mockRoute = {
    params: {
        contactMethod: fakeEmail,
    },
};
const mockLoginList = {
    [`1_${fakeEmail}`]: {
        partnerID: 1,
        partnerUserID: fakeEmail,
        validatedDate: 'fake-validatedDate',
    },
};

describe('DynamicContactMethodDetailsPage', () => {
    let mockFetch: MockFetch;
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    beforeEach(() => {
        const globalFetchMock = getGlobalFetchMock();
        global.fetch = globalFetchMock;
        mockFetch = globalFetchMock;
        mockIsFocused = true;
        jest.mocked(Navigation.goBack).mockClear();
        jest.mocked(Navigation.getActiveRoute).mockReturnValue('');
        mockUseDynamicBackPath.mockReturnValue('');
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    function ContactMethodDetailsPageRenderer() {
        return (
            <HTMLProviderWrapper>
                <DynamicContactMethodDetailsPage
                    // @ts-expect-error - Ignoring type errors for testing purposes
                    route={mockRoute}
                />
            </HTMLProviderWrapper>
        );
    }

    it('should not call resetContactMethodValidateCodeSentState when we got a delete pending field', async () => {
        // Given a login list with a validated contact method
        Onyx.merge(ONYXKEYS.LOGINS, mockLoginList);
        await waitForBatchedUpdates();

        // Given the page is rendered
        render(<ContactMethodDetailsPageRenderer />);

        // When a deleteContactMethod called
        UserActions.deleteContactMethod(fakeEmail, mockLoginList);
        await waitForBatchedUpdatesWithAct();

        // When the deletion is successful
        mockFetch?.succeed();
        await waitForBatchedUpdates();
        mockFetch?.resume();
        await waitForBatchedUpdates();

        // Then resetContactMethodValidateCodeSentState should not be called
        expect(UserActions.resetContactMethodValidateCodeSentState).not.toHaveBeenCalled();
    });

    it('should not call resetContactMethodValidateCodeSentState when the login data has no partnerUserID', async () => {
        // Given a login list with a contact method that has no partnerUserID
        Onyx.merge(ONYXKEYS.LOGINS, {
            [`1_${fakeEmail}`]: {
                partnerID: 1,

                partnerUserID: '',
                validatedDate: '',
            },
        });
        await waitForBatchedUpdates();

        // Given the page is rendered
        render(<ContactMethodDetailsPageRenderer />);
        await waitForBatchedUpdatesWithAct();

        // Then resetContactMethodValidateCodeSentState should not be called
        expect(UserActions.resetContactMethodValidateCodeSentState).not.toHaveBeenCalled();
    });

    it('calls Navigation.goBack when contact method becomes validated and screen is focused', async () => {
        // Given an unverified contact with an error left over from a previous attempt.
        Onyx.merge(ONYXKEYS.SESSION, {email: fakeEmail});
        Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        Onyx.merge(ONYXKEYS.LOGINS, {
            [`1_${fakeEmail}`]: {
                partnerID: 1,

                partnerUserID: fakeEmail,
                validatedDate: '',
                errorFields: {validateLogin: {[Date.now()]: 'Stale verification error'}},
            },
        });
        await waitForBatchedUpdates();

        render(<ContactMethodDetailsPageRenderer />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText('Stale verification error')).toBeNull();
        // When a resend fails without submitting the form.
        fireEvent(screen.UNSAFE_getByType(ValidateCodeCountdown), 'countdownFinish');
        mockFetch.fail();
        fireEvent.press(screen.UNSAFE_getByProps({sentryLabel: CONST.SENTRY_LABEL.VALIDATE_CODE.RESEND_CODE}));
        // Then the user sees the resend error and returns once verification succeeds.
        expect(await screen.findByText('contacts.genericFailureMessages.requestContactMethodValidateCode')).toBeOnTheScreen();
        expect(screen.UNSAFE_getByType(ValidateCodeInput).props.hasError).toBe(false);
        fireEvent(screen.UNSAFE_getByProps({shouldDisplayErrorAbove: true}), 'close');
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText('contacts.genericFailureMessages.requestContactMethodValidateCode')).toBeNull();
        // A rejected verification must still mark the input invalid, until another resend clears it.
        fireEvent(screen.UNSAFE_getByType(ValidateCodeInput), 'changeText', '123456');
        fireEvent(screen.UNSAFE_getByType(ValidateCodeInput), 'fulfill');
        expect(await screen.findByText('contacts.genericFailureMessages.validateSecondaryLogin')).toBeOnTheScreen();
        expect(screen.UNSAFE_getByType(ValidateCodeInput).props.hasError).toBe(true);
        mockFetch.succeed();
        fireEvent(screen.UNSAFE_getByType(ValidateCodeCountdown), 'countdownFinish');
        fireEvent.press(screen.UNSAFE_getByProps({sentryLabel: CONST.SENTRY_LABEL.VALIDATE_CODE.RESEND_CODE}));
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText('contacts.genericFailureMessages.validateSecondaryLogin')).toBeNull();
        expect(screen.UNSAFE_getByType(ValidateCodeInput).props.hasError).toBe(false);

        await act(async () => {
            Onyx.merge(ONYXKEYS.LOGINS, {
                [`1_${fakeEmail}`]: {
                    partnerID: 1,

                    partnerUserID: fakeEmail,
                    validatedDate: '2024-01-01',
                },
            });
        });
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.goBack).toHaveBeenCalled();
    });

    it.each([
        ['flow', false],
        ['flow', true],
        ['code', false],
        ['code', true],
    ] as const)('keeps a retained %s error hidden after resend (request fails: %s)', async (errorSource, shouldFail) => {
        // Given an old flow or code error that requesting another code does not clear.
        const staleError = {[Date.now()]: 'Stale verification error'};
        await Onyx.merge(ONYXKEYS.VALIDATE_ACTION_CODE, {
            errorFields: {
                validateLogin: errorSource === 'code' ? staleError : null,
            },
        });
        await waitForBatchedUpdates();
        render(
            <NavigationContainer>
                <HTMLProviderWrapper>
                    <BaseValidateCodeForm
                        validateCodeActionErrorField="validateLogin"
                        validateError={errorSource === 'flow' ? staleError : undefined}
                        sendValidateCode={() => UserActions.requestValidateCodeAction()}
                        clearError={jest.fn()}
                        handleSubmitForm={jest.fn()}
                    />
                </HTMLProviderWrapper>
            </NavigationContainer>,
        );
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText('Stale verification error')).toBeNull();
        if (errorSource === 'flow') {
            fireEvent.press(screen.UNSAFE_getByProps({sentryLabel: CONST.SENTRY_LABEL.VALIDATE_CODE.VERIFY}));
            expect(screen.getByText('Stale verification error')).toBeOnTheScreen();
        }
        // When the real resend action succeeds or fails, regardless of whether verification exposed the old error.
        fireEvent(screen.UNSAFE_getByType(ValidateCodeCountdown), 'countdownFinish');
        if (shouldFail) {
            mockFetch.fail();
        }
        fireEvent.press(screen.UNSAFE_getByProps({sentryLabel: CONST.SENTRY_LABEL.VALIDATE_CODE.RESEND_CODE}));
        await waitForBatchedUpdatesWithAct();
        // Then only a send failure is displayed, without marking the code input invalid.
        expect(screen.queryByText('Stale verification error')).toBeNull();
        expect(screen.UNSAFE_getByType(ValidateCodeInput).props.hasError).toBe(false);
        if (shouldFail) {
            expect(await screen.findByText('contacts.genericFailureMessages.requestContactMethodValidateCode')).toBeOnTheScreen();
        } else {
            expect(screen.queryByText('contacts.genericFailureMessages.requestContactMethodValidateCode')).toBeNull();
        }
    });

    it('goes back to the contact methods list when the screen is refocused after being validated under another screen', async () => {
        // Given an unvalidated contact method, opened from the contact methods list
        const detailsPath = `settings/profile/contact-methods/${encodeURIComponent(fakeEmail)}/details`;
        Onyx.merge(ONYXKEYS.SESSION, {email: 'primary@gmail.com'});
        Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        Onyx.merge(ONYXKEYS.LOGINS, {[`1_${fakeEmail}`]: {partnerID: 1, partnerUserID: fakeEmail, validatedDate: ''}});
        await waitForBatchedUpdates();

        // Given the test tools modal covers the page, so the hook resolves listPath from the modal's route
        mockIsFocused = false;
        mockUseDynamicBackPath.mockReturnValue(`test-tools?backTo=${detailsPath}`);
        const {rerender} = render(<ContactMethodDetailsPageRenderer />);
        await waitForBatchedUpdatesWithAct();

        // When the queued code is validated on reconnect while the modal is still open
        await act(async () => {
            Onyx.merge(ONYXKEYS.LOGINS, {[`1_${fakeEmail}`]: {validatedDate: '2024-01-01'}});
        });
        await waitForBatchedUpdatesWithAct();

        // Then nothing navigates yet, because the page isn't focused
        expect(Navigation.goBack).not.toHaveBeenCalled();

        // When the modal closes, focus comes back before the root state event refreshes listPath, but the live route is already the details page
        jest.mocked(Navigation.getActiveRoute).mockReturnValue(detailsPath);
        mockIsFocused = true;
        rerender(<ContactMethodDetailsPageRenderer />);
        await waitForBatchedUpdatesWithAct();

        // Then it goes back to the list, not to the modal route it would replace the RHP with
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
        expect(Navigation.goBack).toHaveBeenCalledWith('settings/profile/contact-methods');
    });

    it('does not navigate when an already validated contact method is opened', async () => {
        // Given a contact method that is already validated
        Onyx.merge(ONYXKEYS.SESSION, {email: 'primary@gmail.com'});
        Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        Onyx.merge(ONYXKEYS.LOGINS, mockLoginList);
        await waitForBatchedUpdates();

        // When its details page is opened
        render(<ContactMethodDetailsPageRenderer />);
        await waitForBatchedUpdatesWithAct();

        // Then the user stays on it, since there was no validation to react to
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });
});
