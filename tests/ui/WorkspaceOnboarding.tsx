import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';

import OnboardingWorkspaces from '@pages/OnboardingWorkspaces';

import {joinAccessiblePolicy} from '@userActions/Policy/Member';
import {createWorkspace, getAccessiblePolicies} from '@userActions/Policy/Policy';
import {completeOnboarding} from '@userActions/Report';
import {createJoinWorkspaceOnboardingContent} from '@userActions/Welcome';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {OnyxEntry} from 'react-native-onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockCreateWorkspace = jest.mocked(createWorkspace);
const mockGetAccessiblePolicies = jest.mocked(getAccessiblePolicies);
const mockCompleteOnboarding = jest.mocked(completeOnboarding);
const mockJoinAccessiblePolicy = jest.mocked(joinAccessiblePolicy);
const mockCreateJoinWorkspaceOnboardingContent = jest.mocked(createJoinWorkspaceOnboardingContent);

// Matches the login TestHelper.signInWithTestUser signs in with, so the LOGINS entry keyed off it counts as validated.
const VALIDATED_EMAIL = 'test@user.com';

jest.mock('@userActions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@userActions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        completeOnboarding: jest.fn(),
    };
});

jest.mock('@userActions/Welcome', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@userActions/Welcome');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        createJoinWorkspaceOnboardingContent: jest.fn(),
    };
});

jest.mock('@userActions/Policy/Policy', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@userActions/Policy/Policy');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        createWorkspace: jest.fn().mockReturnValue({
            policyID: 'test-policy-id',
            adminsChatReportID: 'test-admins-report-id',
        }),
        getAccessiblePolicies: jest.fn(),
    };
});

jest.mock('@userActions/Policy/Member', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@userActions/Policy/Member');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        joinAccessiblePolicy: jest.fn(),
    };
});

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<OnboardingModalNavigatorParamList>();

const navigate = jest.spyOn(Navigation, 'navigate');

// Stands in for whatever screen precedes a later visit to "Join a workspace"; only its presence on the stack matters.
function OnboardingPersonalDetailsStub() {
    return <View testID="onboarding-personal-details-stub" />;
}

/**
 * `shouldRenderScreenBehind` seeds a real route behind "Join a workspace". Leaving it off is not a detail of the
 * harness: it is the stack the work email merge and the private domain screen actually leave behind when they
 * force-replace into this screen, which is what makes Back impossible there.
 */
const renderOnboardingWorkspacesPage = (
    initialRouteName: typeof SCREENS.ONBOARDING.WORKSPACES,
    initialParams: OnboardingModalNavigatorParamList[typeof SCREENS.ONBOARDING.WORKSPACES],
    shouldRenderScreenBehind = false,
) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer
                    initialState={
                        shouldRenderScreenBehind
                            ? {
                                  index: 1,
                                  routes: [{name: SCREENS.ONBOARDING.PERSONAL_DETAILS}, {name: initialRouteName, params: initialParams}],
                              }
                            : undefined
                    }
                >
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.PERSONAL_DETAILS}
                            component={OnboardingPersonalDetailsStub}
                        />
                        <Stack.Screen
                            name={SCREENS.ONBOARDING.WORKSPACES}
                            component={OnboardingWorkspaces}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('OnboardingWorkspaces Page', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return IntlStore.load(CONST.LOCALES.EN);
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

    it('should navigate to Onboarding employee page when skip is pressed and user is routed app via SMB', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
            });
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        const skipButton = screen.getByTestId('onboardingWorkSpaceSkipButton');

        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: skipButton,
            currentTarget: skipButton,
        };

        fireEvent.press(skipButton, mockEvent);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute());
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to Onboarding employees page when skip is pressed and user is routed app via VSB', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
            });
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        const skipButton = screen.getByTestId('onboardingWorkSpaceSkipButton');

        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: skipButton,
            currentTarget: skipButton,
        };

        fireEvent.press(skipButton, mockEvent);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_EMPLOYEES.getRoute());
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should clear the blocked-back error message when skip is pressed', async () => {
        // Given this screen after a blocked Back press, which leaves the navigation guard's error in Onyx
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY, 'onboarding.purpose.errorBackButton');
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        // When "Skip for now" moves the flow forward
        fireEvent.press(screen.getByTestId('onboardingWorkSpaceSkipButton'));

        await waitForBatchedUpdatesWithAct();

        // Then the message is cleared, so the next screen does not open showing an error the user just resolved
        let onboardingErrorMessage: OnyxEntry<TranslationPaths>;
        await TestHelper.getOnyxData({
            key: ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY,
            callback: (value) => {
                onboardingErrorMessage = value;
            },
        });

        expect(onboardingErrorMessage).toBeFalsy();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should not show the back button on join workspace after merging a work email', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
                isMergeAccountStepCompleted: true,
                isMergeAccountStepSkipped: false,
            });
        });

        // The merge force-replaces into this screen, which discards every route before it, so this screen is the only
        // one left in the onboarding stack and there is nothing to go back to.
        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: undefined});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByLabelText(TestHelper.translateLocal('common.back'))).not.toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should show the back button on a later visit to join workspace after merging a work email', async () => {
        await TestHelper.signInWithTestUser();

        // Identical Onyx state to the post-merge case above: the merge flags stay set for the rest of onboarding and
        // cannot tell the two apart. What differs is the stack — reaching this screen again (Skip for now, Employer,
        // Personal Details, forward to here) leaves a real screen behind it, so Back must work.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
                shouldValidate: true,
                isMergeAccountStepCompleted: true,
                isMergeAccountStepSkipped: false,
            });
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: undefined}, true);

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByLabelText(TestHelper.translateLocal('common.back'))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should show the back button on join workspace for the standard personal details flow', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
        });

        // Personal Details sits behind this screen, so Back stays.
        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute()}, true);

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByLabelText(TestHelper.translateLocal('common.back'))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should close a completed join-workspace task when no workspaces are available', async () => {
        const dismissModalWithReport = jest.spyOn(Navigation, 'dismissModalWithReport').mockImplementation(() => {});
        const getTopmostReportId = jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue('completed-task-report');

        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.set(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: false});
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: '', isJoinWorkspaceTask: 'true'});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(dismissModalWithReport).toHaveBeenCalledWith({reportID: '123'});
        });
        expect(mockCreateJoinWorkspaceOnboardingContent).toHaveBeenCalledWith('empty', expect.any(String), expect.any(String), undefined, undefined);

        getTopmostReportId.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should not recreate the empty-workspace message after the screen remounts', async () => {
        const dismissModalWithReport = jest.spyOn(Navigation, 'dismissModalWithReport').mockImplementation(() => {});
        const requestID = 'empty-workspace-remount-request';
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {
                choice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE,
                noJoinableWorkspacesMessage: 'existing-message-action',
            });
            await Onyx.set(ONYXKEYS.LOGINS, {
                [`1_${VALIDATED_EMAIL}`]: {
                    partnerID: CONST.PARTNER_ID.EXPENSIFY,
                    partnerUserID: VALIDATED_EMAIL,
                    validatedDate: '2026-09-12 00:00:00',
                },
            });
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {});
            await Onyx.set(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: true, requestID});
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: '', isJoinWorkspaceTask: 'true'});
        await act(async () => {
            await Onyx.merge(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: false, requestID});
        });

        await waitFor(() => {
            expect(dismissModalWithReport).toHaveBeenCalledWith({reportID: '123'});
        });
        expect(mockCreateJoinWorkspaceOnboardingContent).not.toHaveBeenCalled();

        dismissModalWithReport.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should not treat a failed workspace lookup as an empty result', async () => {
        const dismissModal = jest.spyOn(Navigation, 'dismissModal');
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE});
            await Onyx.set(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: false, errors: {getAccessiblePolicies: 'error'}});
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: '', isJoinWorkspaceTask: 'true'});
        await waitForBatchedUpdatesWithAct();

        expect(mockCreateJoinWorkspaceOnboardingContent).not.toHaveBeenCalled();
        expect(dismissModal).not.toHaveBeenCalled();

        dismissModal.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should request accessible policies once when an empty response finishes loading', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.set(ONYXKEYS.LOGINS, {
                [`1_${VALIDATED_EMAIL}`]: {
                    partnerID: CONST.PARTNER_ID.EXPENSIFY,
                    partnerUserID: VALIDATED_EMAIL,
                    validatedDate: '2026-09-12 00:00:00',
                },
            });
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {});
            await Onyx.set(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: false});
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});

        await waitFor(() => {
            expect(mockGetAccessiblePolicies).toHaveBeenCalledTimes(1);
        });

        await act(async () => {
            await Onyx.merge(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: true});
            await Onyx.merge(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: false});
        });

        await waitForBatchedUpdatesWithAct();

        expect(mockGetAccessiblePolicies).toHaveBeenCalledTimes(1);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should handle an empty accessible-policies request started before navigation', async () => {
        // Given the merge screen started a workspace lookup before navigating to the workspace list.
        const dismissModalWithReport = jest.spyOn(Navigation, 'dismissModalWithReport').mockImplementation(() => {});
        const requestID = 'merge-accessible-policies-request';
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.set(ONYXKEYS.LOGINS, {
                [`1_${VALIDATED_EMAIL}`]: {
                    partnerID: CONST.PARTNER_ID.EXPENSIFY,
                    partnerUserID: VALIDATED_EMAIL,
                    validatedDate: '2026-09-12 00:00:00',
                },
            });
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {});
            await Onyx.set(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: true, requestID});
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: '', isJoinWorkspaceTask: 'true'});
        await waitForBatchedUpdatesWithAct();

        expect(mockGetAccessiblePolicies).not.toHaveBeenCalled();

        // When the adopted lookup finishes with no accessible policies.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: false, requestID});
        });

        // Then the empty-workspace content is created and the modal closes without a duplicate lookup.
        await waitFor(() => {
            expect(mockCreateJoinWorkspaceOnboardingContent).toHaveBeenCalledWith('empty', expect.any(String), expect.any(String), undefined, undefined);
            expect(dismissModalWithReport).toHaveBeenCalledWith({reportID: '123'});
        });
        expect(mockGetAccessiblePolicies).not.toHaveBeenCalled();

        dismissModalWithReport.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should keep the employer flow on an empty workspace list and create a Submit workspace on skip', async () => {
        // Given a validated Employer user whose workspace lookup is in progress.
        const requestID = 'employer-accessible-policies-request';
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.EMPLOYER);
            await Onyx.set(ONYXKEYS.LOGINS, {
                [`1_${VALIDATED_EMAIL}`]: {
                    partnerID: CONST.PARTNER_ID.EXPENSIFY,
                    partnerUserID: VALIDATED_EMAIL,
                    validatedDate: '2026-09-12 00:00:00',
                },
            });
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, {firstName: 'Test', lastName: 'User'});
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {});
            await Onyx.set(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: true, requestID});
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});
        await waitForBatchedUpdatesWithAct();

        // When the lookup succeeds with no joinable workspaces.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: false, requestID});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the list remains open and Skip creates the Employer Submit workspace instead of returning to the name screen.
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(), {forceReplace: true});
        fireEvent.press(screen.getByTestId('onboardingWorkSpaceSkipButton'));
        await waitFor(() => {
            expect(mockCreateWorkspace).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: CONST.POLICY.TYPE.SUBMIT,
                    engagementChoice: CONST.ONBOARDING_CHOICES.EMPLOYER,
                }),
            );
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should continue the Join Workspace flow to personal details after an empty lookup', async () => {
        // Given a validated Join Workspace user whose workspace lookup is in progress.
        const requestID = 'join-accessible-policies-request';
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.set(ONYXKEYS.LOGINS, {
                [`1_${VALIDATED_EMAIL}`]: {
                    partnerID: CONST.PARTNER_ID.EXPENSIFY,
                    partnerUserID: VALIDATED_EMAIL,
                    validatedDate: '2026-09-12 00:00:00',
                },
            });
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {});
            await Onyx.set(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: true, requestID});
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});
        await waitForBatchedUpdatesWithAct();

        // When the lookup succeeds with no joinable workspaces.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: false, requestID});
        });

        // Then the Join Workspace flow still advances to collect personal details.
        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(), {forceReplace: true});
        });
        expect(screen.queryByTestId('BaseOnboardingWorkspaces')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should create a Join workspace task when a validation task opens a nonempty list', async () => {
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE});
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {
                policyID: {
                    policyID: 'policyID',
                    policyName: 'Workspace',
                    policyOwner: 'owner@example.com',
                    employeeCount: 1,
                    hasPendingAccess: false,
                    automaticJoiningEnabled: true,
                    policyType: CONST.POLICY.TYPE.CORPORATE,
                },
            });
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {
            backTo: ROUTES.REPORT_WITH_ID.getRoute('123'),
            isJoinWorkspaceTask: 'true',
            shouldCreateJoinWorkspaceTaskOnExit: 'true',
        });

        await waitFor(() => {
            expect(mockCreateJoinWorkspaceOnboardingContent).toHaveBeenCalledWith('joinWorkspace', expect.any(String), expect.any(String), undefined, undefined);
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should complete onboarding once when joining empties the list and establishes a default policy', async () => {
        // Given a validated user choosing an auto-join workspace before selecting an onboarding intent.
        const policyID = 'joined-policy-id';
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {
                [policyID]: {
                    policyID,
                    policyName: 'Joined workspace',
                    policyOwner: 'owner@example.com',
                    employeeCount: 1,
                    hasPendingAccess: false,
                    automaticJoiningEnabled: true,
                    policyType: CONST.POLICY.TYPE.CORPORATE,
                },
            });
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});
        await waitForBatchedUpdatesWithAct();

        // When Join now completes and its response both removes the row and makes that workspace the default.
        fireEvent.press(screen.getByText(TestHelper.translateLocal('workspace.workspaceList.joinNow')));
        await act(async () => {
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {});
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, policyID);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                id: policyID,
                name: 'Joined workspace',
                owner: VALIDATED_EMAIL,
                type: CONST.POLICY.TYPE.CORPORATE,
                role: CONST.POLICY.ROLE.ADMIN,
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then the default-policy fallback does not complete onboarding or navigate a second time.
        expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
        expect(mockCompleteOnboarding).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldSkipConciergeOnboarding: false,
            }),
        );

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should collect a name before completing onboarding after joining a workspace', async () => {
        const policyID = 'joined-policy-id';
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {
                [policyID]: {
                    policyID,
                    policyName: 'Joined workspace',
                    policyOwner: 'owner@example.com',
                    employeeCount: 1,
                    hasPendingAccess: false,
                    automaticJoiningEnabled: true,
                    policyType: CONST.POLICY.TYPE.CORPORATE,
                },
            });
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(TestHelper.translateLocal('workspace.workspaceList.joinNow')));

        expect(mockJoinAccessiblePolicy).toHaveBeenCalledWith(policyID, undefined, undefined, false, false, undefined, 1);
        expect(mockCompleteOnboarding).not.toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(), {forceReplace: true});

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should finish the marked Join Workspace flow when the merged account has a different persisted intent', async () => {
        // Given a merge resumed from a Join Workspace task while the target account still persists a different intent.
        const dismissModalWithReport = jest.spyOn(Navigation, 'dismissModalWithReport').mockImplementation(() => {});
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND});
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {
                policyID: {
                    policyID: 'policyID',
                    policyName: 'Workspace',
                    policyOwner: 'owner@example.com',
                    employeeCount: 1,
                    hasPendingAccess: false,
                    automaticJoiningEnabled: true,
                    policyType: CONST.POLICY.TYPE.CORPORATE,
                },
            });
        });

        mockCreateJoinWorkspaceOnboardingContent.mockReturnValueOnce('join-task-report');
        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {
            backTo: ROUTES.REPORT_WITH_ID.getRoute('123'),
            isJoinWorkspaceTask: 'true',
            shouldCreateJoinWorkspaceTaskOnExit: 'true',
        });
        await waitForBatchedUpdatesWithAct();

        // When the user skips the workspace list after the merge.
        fireEvent.press(screen.getByTestId('onboardingWorkSpaceSkipButton'));

        // Then the Join Workspace task is created/opened instead of returning to the intent-selection loop.
        await waitFor(() => {
            expect(mockCreateJoinWorkspaceOnboardingContent).toHaveBeenCalledWith('joinWorkspace', expect.any(String), expect.any(String), undefined, undefined);
            expect(dismissModalWithReport).toHaveBeenCalledWith({reportID: 'join-task-report'});
        });
        expect(mockCompleteOnboarding).not.toHaveBeenCalled();

        dismissModalWithReport.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should reopen the persisted Join Workspace task before its report loads after a merge', async () => {
        const dismissModalWithReport = jest.spyOn(Navigation, 'dismissModalWithReport').mockImplementation(() => {});
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {
                choice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE,
                joinWorkspace: 'persisted-join-task',
            });
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {
                policyID: {
                    policyID: 'policyID',
                    policyName: 'Workspace',
                    policyOwner: 'owner@example.com',
                    employeeCount: 1,
                    hasPendingAccess: false,
                    automaticJoiningEnabled: true,
                    policyType: CONST.POLICY.TYPE.CORPORATE,
                },
            });
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {
            backTo: ROUTES.REPORT_WITH_ID.getRoute('123'),
            isJoinWorkspaceTask: 'true',
            shouldCreateJoinWorkspaceTaskOnExit: 'true',
        });
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('onboardingWorkSpaceSkipButton'));

        await waitFor(() => {
            expect(dismissModalWithReport).toHaveBeenCalledWith({reportID: 'persisted-join-task'});
        });
        expect(mockCreateJoinWorkspaceOnboardingContent).not.toHaveBeenCalled();

        dismissModalWithReport.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should create a Join workspace task when validation opens the workspace list before the onboarding update arrives', async () => {
        const dismissModalWithReport = jest.spyOn(Navigation, 'dismissModalWithReport').mockImplementation(() => {});
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {});
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {
            backTo: ROUTES.REPORT_WITH_ID.getRoute('123'),
            isJoinWorkspaceTask: 'true',
            shouldCreateJoinWorkspaceTaskOnExit: 'true',
        });

        await waitForBatchedUpdatesWithAct();

        mockCreateJoinWorkspaceOnboardingContent.mockReturnValueOnce('456');
        fireEvent.press(screen.getByTestId('onboardingWorkSpaceSkipButton'));

        await waitFor(() => {
            expect(mockCreateJoinWorkspaceOnboardingContent).toHaveBeenCalledWith('joinWorkspace', expect.any(String), expect.any(String), undefined, undefined);
        });
        expect(dismissModalWithReport).toHaveBeenCalledWith({reportID: '456'});
        expect(mockCompleteOnboarding).not.toHaveBeenCalled();

        dismissModalWithReport.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should create a Join workspace task when closing the workspace list from a validation task', async () => {
        const dismissModalWithReport = jest.spyOn(Navigation, 'dismissModalWithReport').mockImplementation(() => {});
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE});
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {});
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {
            backTo: ROUTES.REPORT_WITH_ID.getRoute('123'),
            isJoinWorkspaceTask: 'true',
            shouldCreateJoinWorkspaceTaskOnExit: 'true',
        });

        await waitForBatchedUpdatesWithAct();

        mockCreateJoinWorkspaceOnboardingContent.mockReturnValueOnce('456');
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.close')));

        await waitFor(() => {
            expect(mockCreateJoinWorkspaceOnboardingContent).toHaveBeenCalledWith('joinWorkspace', expect.any(String), expect.any(String), undefined, undefined);
        });
        expect(dismissModalWithReport).toHaveBeenCalledWith({reportID: '456'});

        dismissModalWithReport.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should return to Concierge when closing a direct workspace link', async () => {
        const conciergeReportID = '123';
        const dismissModalWithReport = jest.spyOn(Navigation, 'dismissModalWithReport').mockImplementation(() => {});
        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE});
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, conciergeReportID);
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {isJoinWorkspaceTask: 'true'});
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.close')));

        expect(dismissModalWithReport).toHaveBeenCalledWith({reportID: conciergeReportID});
        expect(mockCreateJoinWorkspaceOnboardingContent).not.toHaveBeenCalledWith('joinWorkspace', expect.any(String), expect.any(String), undefined, undefined);

        dismissModalWithReport.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should return to Concierge instead of the completed task thread after an empty lookup', async () => {
        const taskReportID = '456';
        const conciergeReportID = '123';
        const getTopmostReportId = jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue(taskReportID);
        const dismissModalWithReport = jest.spyOn(Navigation, 'dismissModalWithReport').mockImplementation(() => {});

        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: true,
            });
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE);
            await Onyx.set(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {loading: false});
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, conciergeReportID);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`, {
                reportID: taskReportID,
                parentReportID: conciergeReportID,
                type: CONST.REPORT.TYPE.TASK,
            });
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: '', isJoinWorkspaceTask: 'true'});

        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(dismissModalWithReport).toHaveBeenCalledWith({reportID: conciergeReportID});
        });

        getTopmostReportId.mockRestore();
        dismissModalWithReport.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should create a Submit workspace when skip is pressed with EMPLOYER purpose', async () => {
        jest.spyOn(Navigation, 'dismissModal').mockImplementation(({afterTransition} = {}) => afterTransition?.());
        jest.spyOn(Navigation, 'setNavigationActionToMicrotaskQueue').mockImplementation((callback: () => void) => callback());

        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.EMPLOYER);
        });

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        const skipButton = screen.getByTestId('onboardingWorkSpaceSkipButton');

        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: skipButton,
            currentTarget: skipButton,
        };

        fireEvent.press(skipButton, mockEvent);

        await waitFor(() => {
            expect(mockCreateWorkspace).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: CONST.POLICY.TYPE.SUBMIT,
                    engagementChoice: CONST.ONBOARDING_CHOICES.EMPLOYER,
                }),
            );
        });

        await waitFor(() => {
            expect(mockCompleteOnboarding).toHaveBeenCalledWith(
                expect.objectContaining({
                    engagementChoice: CONST.ONBOARDING_CHOICES.EMPLOYER,
                    shouldSkipConciergeOnboarding: true,
                }),
            );
        });

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(
                ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE}), searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}),
            );
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should complete onboarding without passing the joined workspace policyID and open Spend > Expenses in the admins room', async () => {
        jest.spyOn(Navigation, 'dismissModal').mockImplementation(({afterTransition} = {}) => afterTransition?.());
        jest.spyOn(Navigation, 'setNavigationActionToMicrotaskQueue').mockImplementation((callback: () => void) => callback());

        await TestHelper.signInWithTestUser();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {
                hasCompletedGuidedSetupFlow: false,
            });
            await Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.EMPLOYER);
            await Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, {
                firstName: 'Test',
                lastName: 'User',
            });
            await Onyx.set(ONYXKEYS.JOINABLE_POLICIES, {
                submitPolicyID: {
                    policyID: 'submit-policy-id',
                    policyName: 'Submit Workspace',
                    policyOwner: 'owner@test.com',
                    employeeCount: 4,
                    hasPendingAccess: false,
                    automaticJoiningEnabled: true,
                    policyType: CONST.POLICY.TYPE.SUBMIT,
                },
            });
        });

        const onyxSetSpy = jest.spyOn(Onyx, 'set');
        onyxSetSpy.mockClear();

        const {unmount} = renderOnboardingWorkspacesPage(SCREENS.ONBOARDING.WORKSPACES, {backTo: ''});

        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(TestHelper.translateLocal('workspace.workspaceList.joinNow')));

        await waitFor(() => {
            expect(mockJoinAccessiblePolicy.mock.calls.at(0)?.at(0)).toBe('submit-policy-id');
        });

        await waitFor(() => {
            expect(mockCompleteOnboarding).toHaveBeenCalledWith(
                expect.objectContaining({
                    engagementChoice: CONST.ONBOARDING_CHOICES.EMPLOYER,
                }),
            );
        });
        const lastCompleteOnboardingArgs = mockCompleteOnboarding.mock.calls.at(-1)?.[0] as Record<string, unknown> | undefined;
        expect(lastCompleteOnboardingArgs).not.toHaveProperty('onboardingPolicyID');

        await waitFor(() => {
            expect(onyxSetSpy).toHaveBeenCalledWith(ONYXKEYS.NVP_ONBOARDING_RHP_VARIANT, CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM);
            expect(navigate).toHaveBeenCalledWith(
                ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE}), searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}),
            );
        });

        onyxSetSpy.mockRestore();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
