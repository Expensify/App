import {act, render, screen} from '@testing-library/react-native';

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

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

// RenderHTML is only used by the DEW info banner here, so render its source as a plain View and assert on the banner
// through the surrounding Info icon instead.
jest.mock('react-native-render-html', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        RenderHTMLConfigProvider: ({children}: {children: React.ReactNode}) => children,
        RenderHTMLSource: () => <MockView testID="DEWInfoBanner" />,
    };
});

TestHelper.setupGlobalFetchMock();

const POLICY_ID = 'workflows-dew-hide-people-test';
const OWNER_EMAIL = 'test@user.com';
const OWNER_ACCOUNT_ID = 1;
const APPROVER_EMAIL = 'approver@example.com';
const APPROVER_ACCOUNT_ID = 2;
const MEMBER_EMAIL = 'member@example.com';
const MEMBER_ACCOUNT_ID = 3;

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const employeeList: PolicyEmployeeList = {
    [OWNER_EMAIL]: {email: OWNER_EMAIL, submitsTo: OWNER_EMAIL, forwardsTo: undefined},
    [APPROVER_EMAIL]: {email: APPROVER_EMAIL, submitsTo: undefined, forwardsTo: undefined},
    [MEMBER_EMAIL]: {email: MEMBER_EMAIL, submitsTo: APPROVER_EMAIL, forwardsTo: undefined},
};

const personalDetails: PersonalDetailsList = {
    [OWNER_ACCOUNT_ID]: TestHelper.buildPersonalDetails(OWNER_EMAIL, OWNER_ACCOUNT_ID, 'Owner'),
    [APPROVER_ACCOUNT_ID]: TestHelper.buildPersonalDetails(APPROVER_EMAIL, APPROVER_ACCOUNT_ID, 'Approver'),
    [MEMBER_ACCOUNT_ID]: TestHelper.buildPersonalDetails(MEMBER_EMAIL, MEMBER_ACCOUNT_ID, 'Member'),
};

/**
 * The backend only returns `dynamicExternalWorkflowHidePeople` when it is `true`, so the negative cases omit the field
 * rather than setting it to `false`.
 */
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
        employeeList,
        ...policyOverrides,
    }) as Policy;

const setupPolicy = async (policyOverrides: Partial<Policy>) => {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy(policyOverrides));
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
                                initialParams={{policyID: POLICY_ID, tab: CONST.TAB.WORKFLOWS.APPROVALS}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

const countWorkflowCards = () => screen.queryAllByText(TestHelper.translateLocal('workflowsExpensesFromPage.title')).length;
const queryAddApprovalButton = () => screen.queryByText(TestHelper.translateLocal('workflowsPage.addApprovalButton'));
// Both More-menu actions (Import workflows, Download workflows) are filtered out when the workflow is hidden, so the
// dropdown that would hold them is gone too. Asserting on the button covers both filters at once.
const queryMoreButton = () => screen.queryByText(TestHelper.translateLocal('common.more'));

describe('WorkspaceWorkflowsPage - DEW "Hide People Table Columns"', () => {
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

    it('hides the approval workflows but keeps the info banner when the flag is set on a DEW workspace', async () => {
        await setupPolicy({approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, dynamicExternalWorkflowHidePeople: true});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('DEWInfoBanner')).toBeOnTheScreen();
        expect(countWorkflowCards()).toBe(0);
        expect(queryAddApprovalButton()).not.toBeOnTheScreen();
        expect(queryMoreButton()).not.toBeOnTheScreen();
    });

    it('keeps the read-only approval workflows on a DEW workspace when the flag is absent', async () => {
        await setupPolicy({approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('DEWInfoBanner')).toBeOnTheScreen();
        expect(countWorkflowCards()).toBeGreaterThan(0);
        expect(queryMoreButton()).toBeOnTheScreen();
    });

    it('keeps the approval workflows when a stale flag is left on a workspace that no longer uses a DEW', async () => {
        await setupPolicy({approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED, dynamicExternalWorkflowHidePeople: true});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('DEWInfoBanner')).not.toBeOnTheScreen();
        expect(countWorkflowCards()).toBeGreaterThan(0);
        expect(queryAddApprovalButton()).toBeOnTheScreen();
        expect(queryMoreButton()).toBeOnTheScreen();
    });
});
