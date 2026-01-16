import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
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
import OnboardingWorkEmail from '@pages/OnboardingWorkEmail';
import OnboardingWorkEmailValidation from '@pages/OnboardingWorkEmailValidation';
import CONST from '@src/CONST';
import {MergeIntoAccountAndLogin} from '@src/libs/actions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Response as OnyxResponse} from '@src/types/onyx';
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

const navigate = jest.spyOn(Navigation, 'navigate');

function MergeIntoAccountAndLoginBlockMerge() {
    const originalXhr = HttpUtils.xhr;
    HttpUtils.xhr = jest.fn().mockImplementation(() => {
        const mockedResponse: OnyxResponse = {
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
        const mockedResponse: OnyxResponse = {
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
        const mockedResponse: OnyxResponse = {
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
        const mockedResponse: OnyxResponse = {
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
        const mockedResponse: OnyxResponse = {
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

describe('OnboardingWorkEmail Page', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        } as ResponsiveLayoutResult);
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

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, {backTo: ''});

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

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, {backTo: ''});

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

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, {backTo: ''});

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
        });

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        AddWorkEmailShouldValidate();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.getRoute());
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

        const {unmount} = renderOnboardingWorkEmailPage(SCREENS.ONBOARDING.WORK_EMAIL, {backTo: ''});

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
});

describe('OnboardingWorkEmailValidation Page', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        } as ResponsiveLayoutResult);
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

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.workEmailValidation.magicCodeSent', {workEmail}))).toBeOnTheScreen();
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

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        await MergeIntoAccountAndLoginBlockMerge();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.mergeBlockScreen.subtitle', {workEmail}))).toBeOnTheScreen();
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

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, {backTo: ''});

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

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        MergeIntoAccountAndLoginSuccessful();

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_WORKSPACES.getRoute(), {forceReplace: true});
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
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

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, {backTo: ''});

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

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, {backTo: ''});

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

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, {backTo: ''});

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

        const {unmount} = renderOnboardingWorkEmailValidationPage(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('onboarding.mergeBlockScreen.subtitle', {workEmail}))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
