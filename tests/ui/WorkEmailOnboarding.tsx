import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import {openOldDotLink} from '@libs/actions/Link';
import {AddWorkEmail} from '@libs/actions/Session';
import HttpUtils from '@libs/HttpUtils';
import {translateLocal} from '@libs/Localize';
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
}));

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
}));

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();
const workEmail = 'testprivateemail@privateEmail.com';

const renderOnboardingWorkEmailPage = (initialRouteName: typeof SCREENS.ONBOARDING.WORK_EMAIL, initialParams: OnboardingModalNavigatorParamList[typeof SCREENS.ONBOARDING.WORK_EMAIL]) => {
    return render(
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
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
    );
};

const renderOnboardingWorkEmailValidationPage = (
    initialRouteName: typeof SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
    initialParams: OnboardingModalNavigatorParamList[typeof SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION],
) => {
    return render(
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
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
            expect(screen.getByText(translateLocal('onboarding.workEmail.title'))).toBeOnTheScreen();
        });
        await waitFor(() => {
            expect(screen.getByText(translateLocal('onboarding.workEmail.addWorkEmail'))).toBeOnTheScreen();
        });

        await waitFor(() => {
            expect(screen.getByText(translateLocal('common.skip'))).toBeOnTheScreen();
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

    it('should navigate to Onboarding purpose page when email is entered but shouldValidate is set to false', async () => {
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
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PURPOSE.getRoute(), {forceReplace: true});
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
            expect(screen.getByText(translateLocal('onboarding.workEmailValidation.magicCodeSent', {workEmail}))).toBeOnTheScreen();
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
            expect(screen.getByText(translateLocal('onboarding.mergeBlockScreen.subtitle', {workEmail}))).toBeOnTheScreen();
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

        const skipButton = screen.getByText(translateLocal('common.skip'));

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

    it('should navigate to Onboarding purpose page when validate code step is successful and there is no signupQualifier', async () => {
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
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PURPOSE.getRoute(), {forceReplace: true});
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
});
