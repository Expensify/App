import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import WorkspaceWorkflowsPageRevamp from '@pages/workspace/workflows/WorkspaceWorkflowsPageRevamp';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

TestHelper.setupGlobalFetchMock();

const POLICY_ID = 'workflows-smart-limit-approvals-test';
const OWNER_EMAIL = 'test@user.com';
const OWNER_ACCOUNT_ID = 1;
const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const buildPolicy = (policyOverrides: Partial<Policy>): Policy =>
    ({
        ...LHNTestUtils.getFakePolicy(POLICY_ID),
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: OWNER_EMAIL,
        approver: OWNER_EMAIL,
        outputCurrency: 'USD',
        areWorkflowsEnabled: true,
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
        employeeList: {[OWNER_EMAIL]: {email: OWNER_EMAIL, submitsTo: OWNER_EMAIL, forwardsTo: undefined}},
        ...policyOverrides,
    }) as Policy;

const setupPolicy = async (policyOverrides: Partial<Policy>) => {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy(policyOverrides));
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[OWNER_ACCOUNT_ID]: TestHelper.buildPersonalDetails(OWNER_EMAIL, OWNER_ACCOUNT_ID, 'Owner')});
    });
};

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.WORKFLOWS}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.WORKFLOWS}
                                component={WorkspaceWorkflowsPageRevamp}
                                initialParams={{policyID: POLICY_ID, tab: CONST.TAB.WORKFLOWS.APPROVALS}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

const addApprovalsDescription = () => TestHelper.translateLocal('workflowsPage.addApprovalsDescription');
const smartLimitPrompt = () => TestHelper.translateLocal('workspace.moreFeatures.workflows.disableApprovalPrompt');
const lockedSwitchLabel = () => `${smartLimitPrompt()}, ${TestHelper.translateLocal('common.locked')}`;
const querySubtitle = (text: string) => screen.queryByText(text, {includeHiddenElements: true});

const getApprovalMode = () =>
    new Promise<string | undefined>((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
            callback: (policy) => {
                Onyx.disconnect(connection);
                resolve(policy?.approvalMode);
            },
        });
    });

describe('WorkspaceWorkflowsPageRevamp - Smart Limit approvals lock', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        const wideLayout: ResponsiveLayoutResult = {
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        };
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(wideLayout);
        await TestHelper.signInWithTestUser(OWNER_ACCOUNT_ID, OWNER_EMAIL);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('lets an admin enable approvals when Smart Limit cards exist and the mode is OPTIONAL', async () => {
        // Given a loaded group policy with Smart Limit cards and approvals currently off.
        await setupPolicy({areApprovalsLockedByExpensifyCard: true, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the switch is off, enabled, and shows the regular description.
        expect(querySubtitle(smartLimitPrompt())).not.toBeOnTheScreen();
        expect(querySubtitle(addApprovalsDescription())).toBeOnTheScreen();
        const approvalsSwitch = screen.getByRole(CONST.ROLE.SWITCH, {name: addApprovalsDescription()});
        expect(approvalsSwitch.props.accessibilityState).toEqual(expect.objectContaining({checked: false, disabled: false}));

        // When the admin enables approvals.
        fireEvent.press(approvalsSwitch);
        await waitForBatchedUpdatesWithAct();

        // Then the approval mode changes to an enabled workflow.
        expect(await getApprovalMode()).toBe(CONST.POLICY.APPROVAL_MODE.BASIC);
    });

    it('keeps the Smart Limit accessibility label for an integration-managed workflow with OPTIONAL mode', async () => {
        // Given a workspace with Smart Limit cards, no configured approval mode, and a connected HR workflow source.
        await setupPolicy({
            areApprovalsLockedByExpensifyCard: true,
            approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.GUSTO]: {
                    config: {finalApprover: null, approvalMode: CONST.GUSTO.APPROVAL_MODE.CUSTOM},
                },
            },
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then integration guidance remains the visible subtitle, while the Smart Limit lock remains accessible and disabled.
        expect(querySubtitle(addApprovalsDescription())).toBeOnTheScreen();
        expect(querySubtitle(smartLimitPrompt())).not.toBeOnTheScreen();
        const approvalsSwitch = screen.getByRole(CONST.ROLE.SWITCH, {name: lockedSwitchLabel()});
        expect(approvalsSwitch.props.accessibilityState).toEqual(expect.objectContaining({disabled: true}));
    });

    it.each([
        [CONST.POLICY.APPROVAL_MODE.BASIC, true],
        [CONST.POLICY.APPROVAL_MODE.ADVANCED, true],
        [CONST.POLICY.APPROVAL_MODE.SMARTREPORT, false],
        [CONST.POLICY.APPROVAL_MODE.BILLCOM, false],
    ] as const)('keeps the %s approval mode locked with its established displayed state', async (approvalMode, isActive) => {
        // Given a loaded group policy with Smart Limit cards and a configured approval mode.
        await setupPolicy({areApprovalsLockedByExpensifyCard: true, approvalMode});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then every configured mode remains locked, and legacy modes retain their existing off display.
        expect(querySubtitle(smartLimitPrompt())).toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.SWITCH, {name: lockedSwitchLabel()}).props.accessibilityState).toEqual(expect.objectContaining({checked: isActive, disabled: true}));
    });

    it('locks a loaded group policy with a missing mode using the effective ADVANCED default', async () => {
        // Given a loaded group policy with Smart Limit cards and no stored mode, which getApprovalWorkflow treats as ADVANCED.
        await setupPolicy({areApprovalsLockedByExpensifyCard: true, approvalMode: undefined});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the toggle keeps its established off display but remains locked with the Smart Limit warning.
        expect(querySubtitle(smartLimitPrompt())).toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.SWITCH, {name: lockedSwitchLabel()}).props.accessibilityState).toEqual(expect.objectContaining({checked: false, disabled: true}));
    });

    it('does not let the Smart Limit lock block the Submit workspace upgrade path', async () => {
        // Given a Submit workspace with a Smart Limit flag and stored ADVANCED mode, which the UI still treats as off.
        await setupPolicy({type: CONST.POLICY.TYPE.SUBMIT, role: CONST.POLICY.ROLE.EDITOR, areApprovalsLockedByExpensifyCard: true, approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the switch remains off and available so its existing enable handler can route to the upgrade flow.
        expect(screen.getByRole(CONST.ROLE.SWITCH, {name: addApprovalsDescription()}).props.accessibilityState).toEqual(expect.objectContaining({checked: false, disabled: false}));
    });

    it('keeps the Smart Limit lock when a configured mode has an approval update error', async () => {
        // Given a persisted ADVANCED mode and a failure error, the mode still indicates that approvals are configured.
        await setupPolicy({areApprovalsLockedByExpensifyCard: true, approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED, errorFields: {approvalMode: {error: 'Update failed'}}});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the error does not unlock the switch, although the existing active-state logic may display it as off.
        expect(screen.getByRole(CONST.ROLE.SWITCH, {name: lockedSwitchLabel()}).props.accessibilityState).toEqual(expect.objectContaining({checked: false, disabled: true}));
    });

    it('leaves approvals unlocked when Smart Limit cards are absent', async () => {
        // Given approvals are configured but the Smart Limit policy flag is false.
        await setupPolicy({areApprovalsLockedByExpensifyCard: false, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the switch keeps the existing behavior and is available to disable approvals.
        expect(querySubtitle(smartLimitPrompt())).not.toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.SWITCH, {name: addApprovalsDescription()}).props.accessibilityState).toEqual(expect.objectContaining({checked: true, disabled: false}));
    });
});
