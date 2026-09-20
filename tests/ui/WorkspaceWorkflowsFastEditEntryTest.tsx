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
const APPROVER_EMAIL = 'approver@example.com';
const APPROVER_ACCOUNT_ID = 100;
// UserPills shows 6 avatars and collapses the rest, but only once more than one would be hidden. 8 members is the
// smallest list that renders the "+2 more" chip this test presses.
const MEMBER_COUNT = 8;
const HIDDEN_MEMBER_COUNT = 2;

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

/** One custom workflow: `MEMBER_COUNT` submitters all routed to the same approver, plus the default workflow. */
function buildWorkflowData(): {employeeList: PolicyEmployeeList; personalDetails: PersonalDetailsList} {
    const employeeList: PolicyEmployeeList = {
        [OWNER_EMAIL]: {email: OWNER_EMAIL, submitsTo: OWNER_EMAIL, forwardsTo: undefined},
        // The approver doesn't submit anywhere, so it never forms a workflow of its own.
        [APPROVER_EMAIL]: {email: APPROVER_EMAIL, submitsTo: undefined, forwardsTo: undefined},
    };
    const personalDetails: PersonalDetailsList = {
        [OWNER_ACCOUNT_ID]: TestHelper.buildPersonalDetails(OWNER_EMAIL, OWNER_ACCOUNT_ID, 'Owner'),
        [APPROVER_ACCOUNT_ID]: TestHelper.buildPersonalDetails(APPROVER_EMAIL, APPROVER_ACCOUNT_ID, 'Approver'),
    };

    for (let i = 1; i <= MEMBER_COUNT; i++) {
        const memberEmail = `member${i}@example.com`;
        const memberAccountID = 200 + i;
        employeeList[memberEmail] = {email: memberEmail, submitsTo: APPROVER_EMAIL, forwardsTo: undefined};
        personalDetails[memberAccountID] = TestHelper.buildPersonalDetails(memberEmail, memberAccountID, `Member ${i}`);
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

async function pressShowAllMembers() {
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('common.plusMore', {count: HIDDEN_MEMBER_COUNT})}));
    await waitForBatchedUpdatesWithAct();
}

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

        await pressShowAllMembers();

        // No edit page is in the stack, so expenses-from is the only screen that will ever save this workflow.
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.isFastEdit).toBe(true);
    });

    it('does not mark a fast edit while the Edit RHP is already open for that workflow', async () => {
        // On a large layout the list stays visible underneath the Edit RHP, so "+N more" is still tappable there.
        jest.spyOn(Navigation, 'getActiveRoute').mockReturnValue(`/${ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(POLICY_ID, APPROVER_EMAIL)}`);

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await pressShowAllMembers();

        // The Edit page is still mounted and owns the save. Flagging this as a fast edit would let expenses-from
        // persist immediately and clear the draft out from under it.
        const draft = await getOnyxValue(ONYXKEYS.APPROVAL_WORKFLOW);
        expect(draft?.isFastEdit).toBe(false);
        // The draft still has to be seeded, so expenses-from opens with this workflow's members and goes back to Edit.
        expect(draft?.members).toHaveLength(MEMBER_COUNT);
    });
});
