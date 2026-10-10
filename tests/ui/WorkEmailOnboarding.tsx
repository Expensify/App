import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import {openOldDotLink} from '@libs/actions/Link';
import {AddWorkEmail} from '@libs/actions/Session';
import HttpUtils from '@libs/HttpUtils';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {OnboardingModalNavigatorParamList} from '@navigation/types';

import OnboardingPrivateDomain from '@pages/OnboardingPrivateDomain';
import OnboardingWorkEmail from '@pages/OnboardingWorkEmail';
import OnboardingWorkEmailValidation from '@pages/OnboardingWorkEmailValidation';

import CONST from '@src/CONST';
import {MergeIntoAccountAndLogin} from '@src/libs/actions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Response as OnyxResponse} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Link', () => ({
    openOldDotLink: jest.fn(),
    getInternalNewExpensifyPath: jest.fn(() => '/mock-path'),
    getInternalExpensifyPath: jest.fn(() => '/mock-path'),
}));

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();
const workEmail = 'testprivateemail@privateEmail.com';

function HTMLProviderWrapper({children}: {children: React.ReactNode}) {
    return <HTMLEngineProvider>{children}</HTMLEngineProvider>;
}

const renderOnboardingWorkEmailPage = (initialRouteName: typeof SCREENS.ONBOARDING.WORK_EMAIL, initialParams: OnboardingModalNavigatorParamList[typeof SCREENS.ONBOARDING.WORK_EMAIL]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.WORK_EMAIL}
                            component={OnboardingWorkEmail}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
        {wrapper: HTMLProviderWrapper},
    );
};

const renderOnboardingWorkEmailValidationPage = (
    initialRouteName: typeof SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
    initialParams: OnboardingModalNavigatorParamList[typeof SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION],
) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION}
                            component={OnboardingWorkEmailValidation}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
        {wrapper: HTMLProviderWrapper},
    );
};

const renderOnboardingPrivateDomainPage = (
    initialRouteName: typeof SCREENS.ONBOARDING.PRIVATE_DOMAIN,
    initialParams: OnboardingModalNavigatorParamList[typeof SCREENS.ONBOARDING.PRIVATE_DOMAIN],
) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.PRIVATE_DOMAIN}
                            component={OnboardingPrivateDomain}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
        {wrapper: HTMLProviderWrapper},
    );
};

const navigate = jest.spyOn(Navigation, 'navigate');

function MergeIntoAccountAndLoginBlockMerge() {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING> = {
            jsonCode: 501,
            onyxData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_ONBOARDING,
                    value: {
                        isMergeAccountStepCompleted: true,
                        shouldRedirectToClassicAfterMerge: false,
                        isMergingAccountBlocked: true,
                    },
                },
            ],
        };

        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    MergeIntoAccountAndLogin(workEmail, '123456', 1);
    return waitForBatchedUpdates().then(() => (HttpUtils.xhr = originalXhr));
}

function MergeIntoAccountAndLoginSuccessful() {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING> = {
            jsonCode: 401,
            onyxData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_ONBOARDING,
                    value: {
                        isMergeAccountStepCompleted: true,
                    },
                },
            ],
        };

        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    MergeIntoAccountAndLogin(workEmail, '123456', 1);
    return waitForBatchedUpdates().then(() => (HttpUtils.xhr = originalXhr));
}

function MergeIntoAccountAndLoginRedirectToClassic() {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING> = {
            jsonCode: 200,
            onyxData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_ONBOARDING,
                    value: {
                        isMergeAccountStepCompleted: true,
                        shouldRedirectToClassicAfterMerge: true,
                    },
                },
            ],
        };

        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    MergeIntoAccountAndLogin(workEmail, '123456', 1);
    return waitForBatchedUpdates().then(() => (HttpUtils.xhr = originalXhr));
}

function AddWorkEmailShouldValidateFailure() {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING> = {
            jsonCode: 200,
            onyxData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_ONBOARDING,
                    value: {
                        shouldValidate: false,
                    },
                },
            ],
        };

        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    AddWorkEmail(workEmail);
    return waitForBatchedUpdates().then(() => (HttpUtils.xhr = originalXhr));
}

function AddWorkEmailShouldValidate() {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING> = {
            jsonCode: 200,
            onyxData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_ONBOARDING,
                    value: {
                        shouldValidate: true,
                    },
                },
            ],
        };

        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    AddWorkEmail(workEmail);
    return waitForBatchedUpdates().then(() => (HttpUtils.xhr = originalXhr));
}

function AddWorkEmailWith2FAError() {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING> = {
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            message: `${workEmail} ${CONST.MERGE_ACCOUNT_2FA_ERROR}`,
            title: '401 work account uses 2FA',
        };

        return Promise.resolve(mockedResponse);
    });
    AddWorkEmail(workEmail);
    return waitForBatchedUpdates().then(() => (HttpUtils.xhr = originalXhr));
}

function AddWorkEmailWithSingleSignOnError() {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING> = {
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            message: `${workEmail} ${CONST.MERGE_ACCOUNT_SINGLE_SIGN_ON_ERROR}`,
            title: '401 work account uses SAML',
            onyxData: [],
        };

        return Promise.resolve(mockedResponse);
    });
    AddWorkEmail(workEmail);
    return waitForBatchedUpdates().then(() => (HttpUtils.xhr = originalXhr));
}

function AddWorkEmailWithDomainControlledError() {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING> = {
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            message: CONST.WORK_DOMAIN_CONTROLLED_ERROR,
            title: CONST.WORK_DOMAIN_CONTROLLED_ERROR,
        };

        return Promise.resolve(mockedResponse);
    });
    AddWorkEmail(workEmail);
    return waitForBatchedUpdates().then(() => (HttpUtils.xhr = originalXhr));
}

describe('OnboardingWorkEmail Page', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ResponsiveLayoutResult>({
                isSmallScreenWidth: false,
                shouldUseNarrowLayout: false,
            }),
        );
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should display onboarding work email screen content correctly', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.workEmail.title'))).toBeOnTheScreen();
        });
        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.workEmail.addWorkEmail'))).toBeOnTheScreen();
        });

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('common.skip'))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding purpose page when skip is pressed and there is no signupQualifier', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        const skipButton = screen.getByTestId('onboardingPrivateEmailSkipButton');

        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: skipButton,
            currentTarget: skipButton,
        };

        fireEvent.press(skipButton, mockEvent);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PURPOSE.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding private domain page when email is entered but shouldValidate is set to false', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        AddWorkEmailShouldValidateFailure();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding work email validation page when email is entered and shouldValidate is set to true', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            // AddWorkEmail is gated on an unvalidated caller; signInWithTestUser sets validated:true by default.
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        AddWorkEmailShouldValidate();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding employee page when skip is pressed and user is routed app via smb', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
            });
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        const skipButton = screen.getByTestId('onboardingPrivateEmailSkipButton');

        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: skipButton,
            currentTarget: skipButton,
        };

        fireEvent.press(skipButton, mockEvent);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding employees page when skip is pressed and user is routed app via vsb', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
            });
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('onboardingPrivateEmailSkipButton'));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate VSB users to Onboarding employees page when merge is blocked and Got it is pressed', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
                isMergingAccountBlocked: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        const gotItButton = screen.getByText(TestHelper.translateLocal('common.buttonConfirm'));

        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: gotItButton,
            currentTarget: gotItButton,
        };

        fireEvent.press(gotItButton, mockEvent);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should still navigate to Onboarding work email validation page when caller is on a public domain', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            // Public-domain users with a merge target must still reach WORK_EMAIL_VALIDATION so MergeIntoAccountAndLogIn can run.
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        AddWorkEmailShouldValidate();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding private domain when an unvalidated public-domain user adds a work email with no existing account', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            // Match staging: an unvalidated public-domain user submitting a non-merge work email still sees PRIVATE_DOMAIN after the primary swap.
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        AddWorkEmailShouldValidateFailure();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should skip Onboarding private domain for a validated public-domain user after guided setup is complete', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            // Validated public-domain user (original bug case): PRIVATE_DOMAIN would say "people on gmail.com" — skip to PURPOSE.
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, isFromPublicDomain: true});
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PURPOSE.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should stay on work-email for a validated public-domain user during incomplete guided setup', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, isFromPublicDomain: true});
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        expect(navigate).not.toHaveBeenCalled();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should display correct error message when an existing work email is submitted with 2FA enabled', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        AddWorkEmailWith2FAError();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.workEmail2FAError'))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should display correct error message when an existing work email is submitted with SSO enabled', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        AddWorkEmailWithSingleSignOnError();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.singleSignOnError'))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should display correct error message when a domain-controlled work email is submitted', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false});
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);

        await waitForBatchedUpdatesWithAct();

        AddWorkEmailWithDomainControlledError();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.mergeBlockScreen.domainControlledSubtitle', workEmail))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should move on to Onboarding private domain without an error or a new request when the prefilled work email is already the account login', async () => {
        await TestHelper.signInWithTestUser();

        // Given the state after an unvalidated public-domain user added a work email and went back from the private domain screen:
        // AddWorkEmail made the work email the account's login, going back cleared shouldValidate, and the form still holds the email
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {email: workEmail});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {onboardingWorkEmail: workEmail});
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM_DRAFT, {onboardingWorkEmail: workEmail});
        });
        const xhrSpy = jest.spyOn(HttpUtils, 'xhr');

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByDisplayValue(workEmail)).toBeOnTheScreen();

        // When the user submits the prefilled email again
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('onboarding.workEmail.addWorkEmail')}));
        await waitForBatchedUpdatesWithAct();

        // Then the email is not rejected as the signup email, it is not sent again (the backend would treat the account's own login as an account to merge),
        // and the user moves on to the private domain screen just like after the first submit
        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute(), {forceReplace: true});
        });
        expect(screen.queryByText(TestHelper.translateLocal('onboarding.workEmailValidationError.sameAsSignupEmail'))).not.toBeOnTheScreen();
        expect(xhrSpy.mock.calls.filter(([command]) => command === 'AddWorkEmail')).toHaveLength(0);

        xhrSpy.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should still send AddWorkEmail when a different work email is entered after the account login was switched to a work email', async () => {
        await TestHelper.signInWithTestUser();

        // Given an account whose login was already switched to a work email by an earlier AddWorkEmail
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {email: workEmail});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        });
        const xhrSpy = jest.spyOn(HttpUtils, 'xhr').mockImplementation(() => {
            const mockedResponse: OnyxResponse<typeof ONYXKEYS.NVP_ONBOARDING> = {
                jsonCode: 200,
                onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ONBOARDING, value: {shouldValidate: false}}],
            };
            return Promise.resolve(mockedResponse);
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);
        await waitForBatchedUpdatesWithAct();

        // When the user enters a different work email and submits it
        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.workEmail')), 'anotherworkemail@privateEmail.com');
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('onboarding.workEmail.addWorkEmail')}));
        await waitForBatchedUpdatesWithAct();

        // Then the new email is sent to the backend, because only the email that is already the account's login skips the request
        await waitFor(() => {
            expect(xhrSpy.mock.calls.filter(([command]) => command === 'AddWorkEmail')).toHaveLength(1);
        });
        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute(), {forceReplace: true});
        });

        xhrSpy.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should reject the public signup email with the signup email message and other public emails with the public domain message', async () => {
        const publicSignupEmail = 'testsignup@gmail.com';
        await TestHelper.signInWithTestUser();

        // Given an unvalidated user who signed up with a public-domain email and hasn't added a work email yet
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {email: publicSignupEmail});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: false, isFromPublicDomain: true});
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        });
        const xhrSpy = jest.spyOn(HttpUtils, 'xhr');

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, undefined);
        await waitForBatchedUpdatesWithAct();

        // When the user submits their signup email as the work email
        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.workEmail')), publicSignupEmail);
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('onboarding.workEmail.addWorkEmail')}));
        await waitForBatchedUpdatesWithAct();

        // Then it is rejected with the message that points at the signup email
        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.workEmailValidationError.sameAsSignupEmail'))).toBeOnTheScreen();
        });

        // When the user changes it to a different public-domain email
        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.workEmail')), 'someoneelse@gmail.com');
        await waitForBatchedUpdatesWithAct();

        // Then it is rejected with the public domain message, and neither email was sent to the backend
        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.workEmailValidationError.publicEmail'))).toBeOnTheScreen();
        });
        expect(xhrSpy.mock.calls.filter(([command]) => command === 'AddWorkEmail')).toHaveLength(0);

        xhrSpy.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});

describe('OnboardingWorkEmailValidation Page', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ResponsiveLayoutResult>({
                isSmallScreenWidth: false,
                shouldUseNarrowLayout: false,
            }),
        );
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });

        jest.clearAllMocks();
    });

    it('should display onboarding work email screen content correctly', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.workEmailValidation.securityCodeSent', workEmail))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should display onboarding merge block screen content correctly', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();

        await MergeIntoAccountAndLoginBlockMerge();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.mergeBlockScreen.subtitle', workEmail))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should display onboarding closed account screen content correctly', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY, 'onboarding.mergeBlockScreen.workAccountClosedSubtitle');
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                isMergingAccountBlocked: true,
            });
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.mergeBlockScreen.workAccountClosedSubtitle'))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding purpose page when skip is pressed and there is no signupQualifier', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();
        const skipButton = screen.getByText(TestHelper.translateLocal('common.skip'));

        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: skipButton,
            currentTarget: skipButton,
        };

        fireEvent.press(skipButton, mockEvent);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PURPOSE.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding workspaces page when validate code step is successful and there is no signupQualifier', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();

        MergeIntoAccountAndLoginSuccessful();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_WORKSPACES.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should ignore the header back button while the magic code is being submitted', async () => {
        const goBack = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});

        // Given the validation screen with a merge request in flight. The request cannot be cancelled, so leaving now
        // would let the work email screen consume its success and skip "Join a workspace".
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true, loadingForm: CONST.FORMS.VALIDATE_CODE_FORM});
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();

        // When the header back button is pressed
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));

        await waitForBatchedUpdatesWithAct();

        // Then the user stays on validation and `shouldValidate` is untouched, so the merge response routes as normal
        expect(goBack).not.toHaveBeenCalled();
        let shouldValidateWhileSubmitting: boolean | undefined;
        await TestHelper.getOnyxData({
            key: ONYXKEYS.NVP_ONBOARDING,
            callback: (value) => {
                shouldValidateWhileSubmitting = value?.shouldValidate;
            },
        });
        expect(shouldValidateWhileSubmitting).toBe(true);

        // When the request settles and the header back button is pressed again
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false});
        });
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));

        await waitForBatchedUpdatesWithAct();

        // Then it goes back to the work email screen, so the first press was blocked by the submit guard alone
        await waitFor(() => {
            expect(goBack).toHaveBeenCalledWith(ROUTES.ONBOARDING_WORK_EMAIL.getRoute());
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
        goBack.mockRestore();
    });

    it('should redirect to classic when merging is completed and shouldRedirectToClassicAfterMerge is returned as `true` by the API', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();

        MergeIntoAccountAndLoginRedirectToClassic();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(openOldDotLink).toHaveBeenCalledWith(CONST.OLDDOT_URLS.INBOX, true);
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding employee page when validate code step is successful and user is routed app via smb', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();

        MergeIntoAccountAndLoginSuccessful();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding employees page when validate code step is successful and user is routed app via vsb', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();

        MergeIntoAccountAndLoginSuccessful();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should display specific error message when ONBOARDING_ERROR_MESSAGE is set', async () => {
        await TestHelper.signInWithTestUser();

        const specificErrorMessage = 'onboarding.errorSelection';

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
                isMergingAccountBlocked: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: 'test@company.com',
            });
            await Onyx.merge(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY, specificErrorMessage);
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal(specificErrorMessage))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should fallback to generic error message when ONBOARDING_ERROR_MESSAGE is not set', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
                isMergingAccountBlocked: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.mergeBlockScreen.subtitle', workEmail))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate VSB users to Onboarding employees page from validation when merge is blocked and Got it is pressed', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
                isMergingAccountBlocked: true,
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {
                onboardingWorkEmail: workEmail,
            });
        });

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, undefined);

        await waitForBatchedUpdatesWithAct();

        const gotItButton = screen.getByText(TestHelper.translateLocal('common.buttonConfirm'));

        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: gotItButton,
            currentTarget: gotItButton,
        };

        fireEvent.press(gotItButton, mockEvent);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});

describe('OnboardingPrivateDomain Page', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ResponsiveLayoutResult>({
                isSmallScreenWidth: false,
                shouldUseNarrowLayout: false,
            }),
        );
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });

        jest.clearAllMocks();
    });

    it('should redirect a public-domain user away to the purpose step', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isFromPublicDomain: true});
        });

        const {unmount} = renderOnboardingPrivateDomainPage(SCREENS.ONBOARDING.PRIVATE_DOMAIN, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PURPOSE.getRoute(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute()), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should redirect a public-domain SMB user away to the employees step', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isFromPublicDomain: true});
        });

        const {unmount} = renderOnboardingPrivateDomainPage(SCREENS.ONBOARDING.PRIVATE_DOMAIN, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute()), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should redirect a public-domain VSB user away to the employees step', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isFromPublicDomain: true});
        });

        const {unmount} = renderOnboardingPrivateDomainPage(SCREENS.ONBOARDING.PRIVATE_DOMAIN, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute()), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
