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
const lockedLabel = (label: string) => `${label}, ${TestHelper.translateLocal('common.locked')}`;
// The subtitle is hidden from screen readers to avoid announcing it twice, so it has to be queried with hidden elements included.
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

    it('lets the admin turn approvals on when Smart Limit cards exist and approvals are off', async () => {
        // Given a workspace with Smart Limit cards whose approvals were turned off before the Smart Limit lock existed
        await setupPolicy({areApprovalsLockedByExpensifyCard: true, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the toggle is unlocked and shows the regular subtitle, since the lock only guards against turning approvals off
        expect(querySubtitle(smartLimitPrompt())).not.toBeOnTheScreen();
        expect(querySubtitle(addApprovalsDescription())).toBeOnTheScreen();
        expect(screen.queryByLabelText(lockedLabel(smartLimitPrompt()))).not.toBeOnTheScreen();
        const approvalsSwitch = screen.getByLabelText(addApprovalsDescription());

        // When the admin turns approvals on
        fireEvent.press(approvalsSwitch);
        await waitForBatchedUpdatesWithAct();

        // Then approvals are enabled on the workspace
        expect(await getApprovalMode()).toBe(CONST.POLICY.APPROVAL_MODE.BASIC);
    });

    it('keeps the toggle locked when Smart Limit cards exist and approvals are on', async () => {
        // Given a workspace with Smart Limit cards and approvals on
        await setupPolicy({areApprovalsLockedByExpensifyCard: true, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the toggle is locked and prompts the admin to amend the Smart Limits, because the cards rely on approvals
        expect(querySubtitle(smartLimitPrompt())).toBeOnTheScreen();
        expect(screen.getByLabelText(lockedLabel(smartLimitPrompt()))).toBeOnTheScreen();
        expect(screen.queryByLabelText(addApprovalsDescription())).not.toBeOnTheScreen();
    });

    it('keeps the toggle unlocked when the workspace has no Smart Limit cards', async () => {
        // Given a workspace with approvals on and no Smart Limit cards
        await setupPolicy({areApprovalsLockedByExpensifyCard: false, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the toggle behaves as before, so the admin can still turn approvals off
        expect(querySubtitle(smartLimitPrompt())).not.toBeOnTheScreen();
        expect(screen.getByLabelText(addApprovalsDescription())).toBeOnTheScreen();
    });
});
