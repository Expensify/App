import {act, fireEvent, screen} from '@testing-library/react-native';

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
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';
import type {PolicyEmployeeList} from '@src/types/onyx/PolicyEmployee';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@src/libs/Log');

jest.mock('react-native-render-html', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        RenderHTMLConfigProvider: ({children}: {children: React.ReactNode}) => children,
        RenderHTMLSource: () => <MockView />,
    };
});

TestHelper.setupGlobalFetchMock();

const POLICY_ID = 'workflows-search-perf-test';
const OWNER_EMAIL = 'test@user.com';
const OWNER_ACCOUNT_ID = 1;
const WORKFLOW_COUNT = 50;
const MEMBERS_PER_WORKFLOW = 5;

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

function buildWorkflowData(): {employeeList: PolicyEmployeeList; personalDetails: PersonalDetailsList} {
    const employeeList: PolicyEmployeeList = {
        [OWNER_EMAIL]: {email: OWNER_EMAIL, submitsTo: OWNER_EMAIL, forwardsTo: undefined},
    };
    const personalDetails: PersonalDetailsList = {
        [OWNER_ACCOUNT_ID]: TestHelper.buildPersonalDetails(OWNER_EMAIL, OWNER_ACCOUNT_ID, 'Owner'),
    };

    for (let i = 1; i <= WORKFLOW_COUNT; i++) {
        const approverEmail = `approver${i}@example.com`;
        const approverAccountID = 1000 + i;
        employeeList[approverEmail] = {email: approverEmail, submitsTo: undefined, forwardsTo: undefined};
        personalDetails[approverAccountID] = TestHelper.buildPersonalDetails(approverEmail, approverAccountID, `Approver ${i}`);

        for (let j = 1; j <= MEMBERS_PER_WORKFLOW; j++) {
            const memberEmail = `member${i}-${j}@example.com`;
            const memberAccountID = 100000 + i * 100 + j;
            employeeList[memberEmail] = {email: memberEmail, submitsTo: approverEmail, forwardsTo: undefined};
            personalDetails[memberAccountID] = TestHelper.buildPersonalDetails(memberEmail, memberAccountID, `Member ${i}-${j}`);
        }
    }

    return {employeeList, personalDetails};
}

const renderPage = () => (
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
    </ComposeProviders>
);

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

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(async () => {
    jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(wideLayout);
    const {employeeList, personalDetails} = buildWorkflowData();
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
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
        });
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
    });
    await TestHelper.signInWithTestUser(OWNER_ACCOUNT_ID, OWNER_EMAIL);
});

afterEach(async () => {
    await act(async () => {
        await Onyx.clear();
    });
    jest.clearAllMocks();
});

test('[Workflows] typing in Find workflow', async () => {
    const scenario = async () => {
        await waitForBatchedUpdatesWithAct();
        const input = screen.getByLabelText(TestHelper.translateLocal('workflowsPage.findWorkflow'));
        const typedText = 'Member';
        for (let index = 1; index <= typedText.length; index++) {
            fireEvent.changeText(input, typedText.slice(0, index));
            // Lets the search debounce apply the filter after every key, like typing at a normal speed
            // eslint-disable-next-line no-await-in-loop
            await act(async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME + 50);
                });
            });
        }
    };

    await measureRenders(renderPage(), {scenario});
});
