import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import WorkspaceWorkflowsPageRevamp from '@pages/workspace/workflows/WorkspaceWorkflowsPageRevamp';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {ApprovalWorkflowOnyx} from '@src/types/onyx/ApprovalWorkflow';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('react-native-render-html', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        RenderHTMLConfigProvider: ({children}: {children: React.ReactNode}) => children,
        RenderHTMLSource: () => <MockView />,
    };
});

TestHelper.setupGlobalFetchMock();

const POLICY_ID = 'workflows-fast-edit-entry-test';
const OWNER_EMAIL = 'test@user.com';
const OWNER_ACCOUNT_ID = 1;

// Two custom workflows, each big enough to collapse into a "+N more" chip. UserPills shows 6 avatars and only
// collapses once more than one would be hidden, so 8 members renders "+2 more" and 9 renders "+3 more". The
// different counts give each row's chip a distinct accessibility label, so a test can press one specific row.
const WORKFLOW_ONE = {approverEmail: 'approver1@example.com', approverName: 'Approver One', approverAccountID: 101, memberPrefix: 'w1m', memberCount: 8, hiddenCount: 2};
const WORKFLOW_TWO = {approverEmail: 'approver2@example.com', approverName: 'Approver Two', approverAccountID: 102, memberPrefix: 'w2m', memberCount: 9, hiddenCount: 3};

const workflowMemberEmail = (workflow: typeof WORKFLOW_ONE, index: number) => `${workflow.memberPrefix}${index}@example.com`;

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

/** Employees forming both custom workflows, plus the owner's default one. */
function buildWorkflowData(): {employeeList: PolicyEmployeeList; personalDetails: PersonalDetailsList} {
    const employeeList: PolicyEmployeeList = {
        [OWNER_EMAIL]: {email: OWNER_EMAIL, submitsTo: OWNER_EMAIL, forwardsTo: undefined},
    };
    const personalDetails: PersonalDetailsList = {
        [OWNER_ACCOUNT_ID]: TestHelper.buildPersonalDetails(OWNER_EMAIL, OWNER_ACCOUNT_ID, 'Owner'),
    };

    for (const workflow of [WORKFLOW_ONE, WORKFLOW_TWO]) {
        // The approver doesn't submit anywhere, so it never forms a workflow of its own.
        employeeList[workflow.approverEmail] = {email: workflow.approverEmail, submitsTo: undefined, forwardsTo: undefined};
        personalDetails[workflow.approverAccountID] = TestHelper.buildPersonalDetails(workflow.approverEmail, workflow.approverAccountID, workflow.approverName);

        for (let i = 1; i <= workflow.memberCount; i++) {
            const memberEmail = workflowMemberEmail(workflow, i);
            const memberAccountID = workflow.approverAccountID * 100 + i;
            employeeList[memberEmail] = {email: memberEmail, submitsTo: workflow.approverEmail, forwardsTo: undefined};
            personalDetails[memberAccountID] = TestHelper.buildPersonalDetails(memberEmail, memberAccountID, `${workflow.approverName} Member ${i}`);
        }
    }

    return {employeeList, personalDetails};
}

const buildPolicy = (employeeList: PolicyEmployeeList): Policy =>
    ({
        ...LHNTestUtils.getFakePolicy(POLICY_ID),
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: OWNER_EMAIL,
        approver: OWNER_EMAIL,
        outputCurrency: 'USD',
        areWorkflowsEnabled: true,
        approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
        employeeList,
    }) as Policy;

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
                                // Approval workflow cards live on the Approvals tab, so deep-link straight to it.
                                initialParams={{policyID: POLICY_ID, tab: CONST.TAB.WORKFLOWS.APPROVALS}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

async function pressShowAllMembers(workflow: typeof WORKFLOW_ONE) {
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('common.plusMore', {count: workflow.hiddenCount})}));
    await waitForBatchedUpdatesWithAct();
}

/** A draft left in Onyx by some other session, used to prove a blocked "+N more" did not overwrite it. */
const OTHER_SESSION_DRAFT = {
    action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
    approvers: [{email: WORKFLOW_ONE.approverEmail, displayName: WORKFLOW_ONE.approverName}],
    originalApprovers: [{email: WORKFLOW_ONE.approverEmail, displayName: WORKFLOW_ONE.approverName}],
    members: [{email: 'someone@example.com', displayName: 'Someone'}],
    availableMembers: [],
    usedApproverEmails: [],
    isDefault: false,
} satisfies ApprovalWorkflowOnyx;

describe('WorkflowsApprovalsTab — "+N more" fast edit entry point', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue('');
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

        const {employeeList, personalDetails} = buildWorkflowData();
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy(employeeList));
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        await TestHelper.signInWithTestUser(OWNER_ACCOUNT_ID, OWNER_EMAIL);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
    });

    it('marks the session as a fast edit when the workflow list is the screen the admin is on', async () => {
        renderPage();
        await waitForBatchedUpdatesWithAct();

        await pressShowAllMembers(WORKFLOW_ONE);

        // No Edit page is in the stack, so expenses-from is the only screen that will ever save this workflow.
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.isFastEdit).toBe(true);
        expect(draft?.approvers.at(0)?.email).toBe(WORKFLOW_ONE.approverEmail);
    });

    it('does not mark a fast edit while the Edit RHP is already open for that workflow', async () => {
        // On a large layout the list stays visible underneath the Edit RHP, so "+N more" is still tappable there.
        jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(
            `/${ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(POLICY_ID, WORKFLOW_ONE.approverEmail, workflowMemberEmail(WORKFLOW_ONE, 1))}`,
        );

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await pressShowAllMembers(WORKFLOW_ONE);

        // The Edit page is still mounted and owns the save. Flagging this as a fast edit would let expenses-from
        // persist immediately and clear the draft out from under it.
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.isFastEdit).toBe(false);
        // The draft still has to be seeded, so expenses-from opens with this workflow's members and goes back to Edit.
        expect(draft?.members).toHaveLength(WORKFLOW_ONE.memberCount);
    });

    it('leaves the draft alone when the open Edit page shares the first approver but anchors a different member', async () => {
        // A first approver is not unique once rule-based chains diverge: A→B and A→C are two workflows with one
        // approver. Keyed on the approver alone this row would be mistaken for the mounted Edit session.
        jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(
            `/${ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(POLICY_ID, WORKFLOW_ONE.approverEmail, 'sibling-workflow-member@example.com')}`,
        );
        await act(async () => {
            await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, OTHER_SESSION_DRAFT);
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await pressShowAllMembers(WORKFLOW_ONE);

        // Untouched: the mounted Edit page still owns the single APPROVAL_WORKFLOW slot.
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual(['someone@example.com']);
        expect(jest.mocked(Navigation.navigate)).not.toHaveBeenCalled();
    });

    it('leaves the draft alone when another workflow Edit page is open', async () => {
        jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(
            `/${ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(POLICY_ID, WORKFLOW_ONE.approverEmail, workflowMemberEmail(WORKFLOW_ONE, 1))}`,
        );
        await act(async () => {
            await Onyx.set(ONYXKEYS.APPROVAL_WORKFLOW, OTHER_SESSION_DRAFT);
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Workflow two's chip, while workflow one's Edit page holds the draft.
        await pressShowAllMembers(WORKFLOW_TWO);

        // Seeding here would Onyx.set over the mounted Edit page's draft, and the fast-edit Save would then
        // persist workflow two and clear that page's draft from under it.
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.members.map((member) => member.email)).toEqual(['someone@example.com']);
        expect(jest.mocked(Navigation.navigate)).not.toHaveBeenCalled();
    });
});
