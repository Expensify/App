import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import WorkspaceWorkflowsPage from '@pages/workspace/workflows/WorkspaceWorkflowsPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';
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

const POLICY_ID = 'workflows-load-more-test';
const OWNER_EMAIL = 'test@user.com';
const OWNER_ACCOUNT_ID = 1;
const BATCH = CONST.WORKFLOW_APPROVALS_INITIAL_BATCH;

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

/**
 * Builds an employeeList that yields `customWorkflowCount` custom approval workflows. Each custom workflow is one
 * submitter routed to its own approver; the conversion always prepends the default ("Everyone") workflow, so the
 * total rendered card count is `customWorkflowCount + 1`.
 */
function buildWorkflowData(customWorkflowCount: number): {employeeList: PolicyEmployeeList; personalDetails: PersonalDetailsList} {
    const employeeList: PolicyEmployeeList = {
        [OWNER_EMAIL]: {email: OWNER_EMAIL, submitsTo: OWNER_EMAIL, forwardsTo: undefined},
    };
    const personalDetails: PersonalDetailsList = {
        [OWNER_ACCOUNT_ID]: TestHelper.buildPersonalDetails(OWNER_EMAIL, OWNER_ACCOUNT_ID, 'Owner'),
    };

    for (let i = 1; i <= customWorkflowCount; i++) {
        const approverEmail = `approver${i}@example.com`;
        const memberEmail = `member${i}@example.com`;
        const approverAccountID = 100 + i;
        const memberAccountID = 200 + i;

        // The approver itself doesn't submit anywhere, so it never creates its own workflow — only the submitter does.
        employeeList[approverEmail] = {email: approverEmail, submitsTo: undefined, forwardsTo: undefined};
        employeeList[memberEmail] = {email: memberEmail, submitsTo: approverEmail, forwardsTo: undefined};
        personalDetails[approverAccountID] = TestHelper.buildPersonalDetails(approverEmail, approverAccountID, `Approver ${i}`);
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

const setupPolicy = async (customWorkflowCount: number) => {
    const {employeeList, personalDetails} = buildWorkflowData(customWorkflowCount);
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy(employeeList));
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
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
                                component={WorkspaceWorkflowsPage}
                                initialParams={{policyID: POLICY_ID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

const loadMoreLabel = (count: number) => TestHelper.translateLocal('workflowsPage.loadMoreWorkflows', {count});
const countWorkflowCards = () => screen.queryAllByText(TestHelper.translateLocal('workflowsExpensesFromPage.title')).length;

describe('WorkspaceWorkflowsPage - Approvals Load more', () => {
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

    it('renders all workflows without a Load more button when there are no more than the initial batch', async () => {
        // BATCH - 1 custom workflows + 1 default = BATCH total (exactly the initial batch).
        await setupPolicy(BATCH - 1);
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(countWorkflowCards()).toBe(BATCH);
        expect(screen.queryByRole(CONST.ROLE.BUTTON, {name: /load .* more/i})).not.toBeOnTheScreen();
    });

    it('shows only the initial batch with a "Load more" button labelled with the full remaining count', async () => {
        // 10 custom + 1 default = 11 total, so BATCH are shown and the remaining (11 - BATCH) are hidden.
        await setupPolicy(10);
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(countWorkflowCards()).toBe(BATCH);
        expect(screen.getByText(loadMoreLabel(11 - BATCH))).toBeOnTheScreen();
    });

    it('reveals all remaining workflows in a single press and hides the button', async () => {
        await setupPolicy(10); // 11 total
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Single press reveals every remaining workflow at once.
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: loadMoreLabel(11 - BATCH)}));
        await waitForBatchedUpdatesWithAct();
        expect(countWorkflowCards()).toBe(11);
        expect(screen.queryByRole(CONST.ROLE.BUTTON, {name: /load .* more/i})).not.toBeOnTheScreen();
    });

    it('shows every match and hides the Load more button while searching (search bypasses pagination)', async () => {
        await setupPolicy(10); // 11 total; search bar appears above the SEARCH_BAR_THRESHOLD
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // "Member" matches all 10 custom workflows but not the default "Everyone" workflow.
        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('workflowsPage.findWorkflow')), 'Member');

        await waitFor(() => {
            expect(countWorkflowCards()).toBe(10);
        });
        expect(screen.queryByRole(CONST.ROLE.BUTTON, {name: /load .* more/i})).not.toBeOnTheScreen();
    });
});
