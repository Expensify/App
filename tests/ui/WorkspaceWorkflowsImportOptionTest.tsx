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

import type {ValueOf} from 'type-fest';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

TestHelper.setupGlobalFetchMock();

const POLICY_ID = 'workflows-import-option-test';
const OWNER_EMAIL = 'test@user.com';
const OWNER_ACCOUNT_ID = 1;

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

async function setUp(approvalMode: ValueOf<typeof CONST.POLICY.APPROVAL_MODE>, isMultipleApproversBetaEnabled: boolean) {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            ...LHNTestUtils.getFakePolicy(POLICY_ID),
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: OWNER_EMAIL,
            approver: OWNER_EMAIL,
            outputCurrency: 'USD',
            areWorkflowsEnabled: true,
            approvalMode,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
            employeeList: {[OWNER_EMAIL]: {email: OWNER_EMAIL, role: CONST.POLICY.ROLE.ADMIN, submitsTo: OWNER_EMAIL}},
        } as Policy);
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[OWNER_ACCOUNT_ID]: TestHelper.buildPersonalDetails(OWNER_EMAIL, OWNER_ACCOUNT_ID, 'Owner')});
        await Onyx.set(ONYXKEYS.BETAS, isMultipleApproversBetaEnabled ? [CONST.BETAS.MULTIPLE_APPROVERS] : []);
    });
}

/** Opens the More menu of the Workflows page */
async function openMoreMenu() {
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
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByText(TestHelper.translateLocal('common.more')));
    await waitForBatchedUpdatesWithAct();
}

const queryImportOption = () => screen.queryByText(TestHelper.translateLocal('spreadsheet.importWorkflows'));
const queryDownloadOption = () => screen.queryByText(TestHelper.translateLocal('spreadsheet.downloadWorkflows'));

describe('WorkspaceWorkflowsPageRevamp - Import workflows option', () => {
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

    it('hides the import while approvals are off with multiple approvers', async () => {
        // Given multiple approvers on a workspace with approvals turned off
        await setUp(CONST.POLICY.APPROVAL_MODE.OPTIONAL, true);

        // When the admin opens the More menu
        await openMoreMenu();

        // Then the workflows can be downloaded but not imported, since imported workflows wouldn't route anything
        expect(queryDownloadOption()).toBeOnTheScreen();
        expect(queryImportOption()).not.toBeOnTheScreen();
    });

    it('offers the import once approvals are on with multiple approvers', async () => {
        // Given multiple approvers on a workspace with approvals turned on
        await setUp(CONST.POLICY.APPROVAL_MODE.ADVANCED, true);

        // When the admin opens the More menu
        await openMoreMenu();

        // Then the workflows can be imported
        expect(queryImportOption()).toBeOnTheScreen();
    });

    it('keeps offering the import while approvals are off without multiple approvers', async () => {
        // Given a workspace with approvals turned off, without multiple approvers
        await setUp(CONST.POLICY.APPROVAL_MODE.OPTIONAL, false);

        // When the admin opens the More menu
        await openMoreMenu();

        // Then the import is still there, as it was before multiple approvers
        expect(queryImportOption()).toBeOnTheScreen();
    });
});
