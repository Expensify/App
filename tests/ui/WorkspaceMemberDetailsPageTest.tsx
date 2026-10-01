import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {generateAccountID} from '@libs/UserUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import WorkspaceMemberDetailsPage from '@pages/workspace/members/WorkspaceMemberDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.MEMBER_DETAILS]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, CurrentReportIDContextProvider, ModalProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.MEMBER_DETAILS}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.MEMBER_DETAILS}
                            component={WorkspaceMemberDetailsPage}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('WorkspaceMemberDetailsPage', () => {
    const ownerAccountID = 1;
    const ownerEmail = 'owner@example.com';
    const selfAccountID = 1206;
    const selfEmail = 'self@example.com';
    const invitedAccountID = 5555;
    const invitedEmail = 'newmember@example.com';
    const phoneAccountID = 6666;
    const phoneNumber = '+15005550006';
    const phoneLogin = `${phoneNumber}${CONST.SMS.DOMAIN}`;
    const primaryAccountID = 7777;
    const primaryEmail = 'primary@example.com';
    const secondaryEmail = 'secondary@example.com';
    const adminPayerAccountID = 8888;
    const adminPayerEmail = 'adminpayer@example.com';

    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ownerEmail,
        ownerAccountID,
        type: CONST.POLICY.TYPE.CORPORATE,
        primaryLoginsInvited: {
            [secondaryEmail]: primaryEmail,
        },
        employeeList: {
            [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN},
            [selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.ADMIN},
            [invitedEmail]: {email: invitedEmail, role: CONST.POLICY.ROLE.USER},
            [phoneLogin]: {email: phoneLogin, role: CONST.POLICY.ROLE.USER},
            [primaryEmail]: {email: primaryEmail, role: CONST.POLICY.ROLE.USER},
            [adminPayerEmail]: {email: adminPayerEmail, role: CONST.POLICY.ROLE.ADMIN},
        },
    };

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await TestHelper.signInWithTestUser(selfAccountID, selfEmail, undefined, 'Self');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                [ownerAccountID]: TestHelper.buildPersonalDetails(ownerEmail, ownerAccountID, 'Owner'),
                [selfAccountID]: TestHelper.buildPersonalDetails(selfEmail, selfAccountID, 'Self'),
                [invitedAccountID]: TestHelper.buildPersonalDetails(invitedEmail, invitedAccountID, 'Invited'),
                [phoneAccountID]: TestHelper.buildPersonalDetails(phoneLogin, phoneAccountID, 'Phone'),
                [primaryAccountID]: TestHelper.buildPersonalDetails(primaryEmail, primaryAccountID, 'Primary'),
                [adminPayerAccountID]: TestHelper.buildPersonalDetails(adminPayerEmail, adminPayerAccountID, 'AdminPayer'),
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });
        const responsiveLayout: ResponsiveLayoutResult = {
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
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(responsiveLayout);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    const setupWorkArrangement = async ({
        isOfficeWorkArrangement,
        memberArrangement,
        method,
        betaEnabled = true,
    }: {
        isOfficeWorkArrangement?: boolean;
        memberArrangement?: boolean;
        method: NonNullable<NonNullable<Policy['commuterExclusions']>['method']>;
        betaEnabled?: boolean;
    }) => {
        const typedPolicy = createMock<Policy>(policy);
        const employeeList = {
            ...typedPolicy.employeeList,
            [invitedEmail]: {...typedPolicy.employeeList?.[invitedEmail], ...(memberArrangement !== undefined ? {hasOfficeWorkArrangement: memberArrangement} : {})},
        };
        const workArrangementPolicy = createMock<Policy>({...typedPolicy, commuterExclusions: {method, isOfficeWorkArrangement}, employeeList});
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, betaEnabled ? [CONST.BETAS.COMMUTER_EXCLUSIONS_ARRANGEMENTS] : []);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, workArrangementPolicy);
        });
        const {unmount} = renderPage({policyID: policy.id, accountID: String(invitedAccountID)});
        await waitForBatchedUpdatesWithAct();
        return unmount;
    };

    it('shows the work arrangement item for home and office workspaces when the beta is enabled', async () => {
        // Given a home and office workspace and the work arrangement beta is enabled
        const unmount = await setupWorkArrangement({method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE});

        // Then the member details include the work arrangement item
        expect(await screen.findByTestId('member-work-arrangement-menu-item')).toBeOnTheScreen();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('hides the work arrangement item for other commuter exclusion methods', async () => {
        // Given a workspace using a commuter exclusion method other than home and office
        const unmount = await setupWorkArrangement({method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE});

        // Then the work arrangement item is hidden
        expect(screen.queryByTestId('member-work-arrangement-menu-item')).not.toBeOnTheScreen();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('hides the work arrangement item when the beta is disabled', async () => {
        // Given a home and office workspace but the work arrangement beta is disabled
        const unmount = await setupWorkArrangement({method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE, betaEnabled: false});

        // Then the work arrangement item is hidden
        expect(screen.queryByTestId('member-work-arrangement-menu-item')).not.toBeOnTheScreen();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('uses the member override for the work arrangement title', async () => {
        // Given the member override is office-based while the workspace default is no regular workspace
        const unmount = await setupWorkArrangement({
            method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE,
            isOfficeWorkArrangement: false,
            memberArrangement: true,
        });

        // Then the member override supplies the title
        const row = await screen.findByTestId('member-work-arrangement-menu-item');
        expect(within(row).getByText(TestHelper.translateLocal('workspace.people.officeBased'))).toBeOnTheScreen();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('falls back to the workspace default when the member arrangement is unset', async () => {
        // Given the member override is unset and the workspace default is office-based
        const unmount = await setupWorkArrangement({
            method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE,
            isOfficeWorkArrangement: true,
        });

        // Then the workspace default supplies the title
        const row = await screen.findByTestId('member-work-arrangement-menu-item');
        expect(within(row).getByText(TestHelper.translateLocal('workspace.people.officeBased'))).toBeOnTheScreen();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('prefers a no regular workspace member override over an office-based workspace default', async () => {
        // Given the member override is no regular workspace while the workspace default is office-based
        const unmount = await setupWorkArrangement({
            method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE,
            isOfficeWorkArrangement: true,
            memberArrangement: false,
        });

        // Then the member override still takes precedence
        const row = await screen.findByTestId('member-work-arrangement-menu-item');
        expect(within(row).getByText(TestHelper.translateLocal('workspace.people.noRegularWorkspace'))).toBeOnTheScreen();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should show the member details when the route accountID matches their personal details entry', async () => {
        const {unmount} = renderPage({policyID: policy.id, accountID: String(invitedAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });
        expect(screen.getAllByText('Invited User').length).toBeGreaterThan(0);
        expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should keep showing the member details when the route holds a stale optimistic accountID', async () => {
        // The route mimics a details page opened while the invite was in flight: its accountID is the
        // login-derived optimistic one, which no longer has a personal details entry after the swap.
        const staleOptimisticAccountID = generateAccountID(invitedEmail);
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });
        expect(screen.getAllByText('Invited User').length).toBeGreaterThan(0);
        expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should keep showing the member details when the stale optimistic accountID was derived without the SMS domain', async () => {
        const staleOptimisticAccountID = generateAccountID(phoneNumber);
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });
        expect(screen.getAllByText('Phone User').length).toBeGreaterThan(0);
        expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should resolve the primary member when the stale optimistic accountID was derived from an invited secondary login', async () => {
        // Inviting a secondary login lists the member under their primary login, so the stale route ID only
        // matches through the secondary-to-primary mapping the backend records.
        const staleOptimisticAccountID = generateAccountID(secondaryEmail);
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });
        expect(screen.getAllByText('Primary User').length).toBeGreaterThan(0);
        expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should show the unable-to-remove modal when the member is a RuleBot enforcing agent rules', async () => {
        // The invited member acts as the workspace RuleBot with an active agent rule
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                ruleBotAccountID: invitedAccountID,
                rules: {
                    agentRules: {
                        rule1: {ruleID: 'rule1', prompt: 'Flag all weekend expenses', created: '2025-01-01 00:00:00'},
                    },
                },
            });
        });

        const {unmount} = renderPage({policyID: policy.id, accountID: String(invitedAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });

        fireEvent.press(screen.getByText(TestHelper.translateLocal('workspace.people.removeWorkspaceMemberButtonTitle')));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('workspace.rules.agentRules.unableToRemoveTitle'))).toBeOnTheScreen();
        });
        expect(screen.queryByText(TestHelper.translateLocal('workspace.people.removeMemberTitle'))).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should not lock the Role field for a non-admin Authorized Payer so they can be promoted to Admin', async () => {
        // Make the invited member (a plain USER) the workspace Authorized Payer.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                reimburser: invitedEmail,
            });
        });

        const {unmount} = renderPage({policyID: policy.id, accountID: String(invitedAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });

        // The locked hint must NOT be shown — a non-admin payer can still be promoted to Admin.
        expect(screen.queryByText(/Role can/)).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should not lock the Role field for an Authorized Payer who is already an Admin so they can be changed to Payments Admin', async () => {
        // The admin member is the workspace Authorized Payer — Payments Admin is also a valid payer, so a lateral change is allowed.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                reimburser: adminPayerEmail,
            });
        });

        const {unmount} = renderPage({policyID: policy.id, accountID: String(adminPayerAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });

        // The locked hint must NOT be shown — an admin payer can still be changed to Payments Admin, another valid payer role.
        expect(screen.queryByText(/Role can/)).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should keep the Role field interactive for an admin Authorized Payer on a non-Control workspace because Editor also holds the payments permission', async () => {
        // On a Team (non-Control) workspace, Payments Admin is not assignable, but Editor also holds the WORKFLOWS_PAYMENTS
        // permission, so an admin payer still has another valid payer role to switch to. The Role row must stay interactive.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                type: CONST.POLICY.TYPE.TEAM,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                reimburser: adminPayerEmail,
            });
        });

        const {unmount} = renderPage({policyID: policy.id, accountID: String(adminPayerAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });

        const roleItem = await screen.findByTestId('member-role-menu-item');

        // Editor is another payer role the admin payer can switch to, so the row is interactive with no lock hint.
        expect(roleItem).not.toBeDisabled();
        expect(screen.queryByText(/Role can/)).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should show the approver row with the first approver of the member approval workflow', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: ownerEmail,
                employeeList: {
                    [invitedEmail]: {email: invitedEmail, role: CONST.POLICY.ROLE.USER, submitsTo: adminPayerEmail},
                    [adminPayerEmail]: {email: adminPayerEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: ownerEmail},
                },
            });
        });

        const {unmount} = renderPage({policyID: policy.id, accountID: String(invitedAccountID)});
        await waitForBatchedUpdatesWithAct();

        const approverItem = await screen.findByTestId('member-approver-menu-item');

        expect(within(approverItem).getByText('AdminPayer User')).toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should keep the approver row tappable and empty for a member with no approver', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: ownerEmail,
            });
        });

        const {unmount} = renderPage({policyID: policy.id, accountID: String(ownerAccountID)});
        await waitForBatchedUpdatesWithAct();

        const approverItem = await screen.findByTestId('member-approver-menu-item');

        expect(approverItem).not.toBeDisabled();
        expect(within(approverItem).queryByText('Owner User')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should open the workflow the member belongs to when they have an approver', async () => {
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: ownerEmail,
                employeeList: {
                    [invitedEmail]: {email: invitedEmail, role: CONST.POLICY.ROLE.USER, submitsTo: adminPayerEmail},
                    [adminPayerEmail]: {email: adminPayerEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: ownerEmail},
                },
            });
        });

        const {unmount} = renderPage({policyID: policy.id, accountID: String(invitedAccountID)});
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(await screen.findByTestId('member-approver-menu-item'), {nativeEvent: {}});
        await waitForBatchedUpdatesWithAct();

        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policy.id, adminPayerEmail, invitedEmail));

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should start a new workflow rather than open the one a self-approving member approves', async () => {
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: ownerEmail,
                employeeList: {
                    [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: ownerEmail},
                    [invitedEmail]: {email: invitedEmail, role: CONST.POLICY.ROLE.USER, submitsTo: ownerEmail},
                },
            });
        });

        const {unmount} = renderPage({policyID: policy.id, accountID: String(ownerAccountID)});
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(await screen.findByTestId('member-approver-menu-item'), {nativeEvent: {}});
        await waitForBatchedUpdatesWithAct();

        // The owner sits at the top of their own chain, so the row reads as having no approver. Opening the workflow
        // they approve would let an admin reassign the approver for every other member on it.
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policy.id));
        expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policy.id, ownerEmail, ownerEmail));

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should send a submit workspace to the upgrade page rather than start a workflow it cannot run', async () => {
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                type: CONST.POLICY.TYPE.SUBMIT,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: ownerEmail,
                employeeList: {
                    [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: ownerEmail},
                },
            });
        });

        const {unmount} = renderPage({policyID: policy.id, accountID: String(ownerAccountID)});
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(await screen.findByTestId('member-approver-menu-item'), {nativeEvent: {}});
        await waitForBatchedUpdatesWithAct();

        // Adding an approver is plan-gated here exactly as it is on the Workflows tab, and the upgrade page comes back
        // to this member's profile rather than to More Features, since that is where the admin started.
        expect(navigateSpy).toHaveBeenCalledWith(
            ROUTES.WORKSPACE_UPGRADE.getRoute(policy.id, CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvalSubmit.alias, ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policy.id, ownerAccountID)),
        );
        expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policy.id));

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should send a collect workspace to the upgrade page rather than start a workflow it cannot run', async () => {
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: ownerEmail,
                employeeList: {
                    [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN, submitsTo: ownerEmail},
                },
            });
        });

        const {unmount} = renderPage({policyID: policy.id, accountID: String(ownerAccountID)});
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(await screen.findByTestId('member-approver-menu-item'), {nativeEvent: {}});
        await waitForBatchedUpdatesWithAct();

        // Only Control runs the workflows this would create, so a Collect workspace is asked to upgrade first.
        expect(navigateSpy).toHaveBeenCalledWith(
            ROUTES.WORKSPACE_UPGRADE.getRoute(policy.id, CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias, ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policy.id, ownerAccountID)),
        );
        expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policy.id));

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should hide the approver row when approvals are turned off', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL});
        });

        const {unmount} = renderPage({policyID: policy.id, accountID: String(invitedAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });
        expect(screen.queryByTestId('member-approver-menu-item')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should show the not found page when the accountID matches no workspace member', async () => {
        const {unmount} = renderPage({policyID: policy.id, accountID: '999999'});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('NotFoundPage')).toBeOnTheScreen();
        });
        expect(screen.queryByTestId('WorkspaceMemberDetailsPage')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should render the read-only role of the owner at full opacity and without a caret', async () => {
        const {unmount} = renderPage({policyID: policy.id, accountID: String(ownerAccountID)});
        await waitForBatchedUpdatesWithAct();

        const roleItem = await screen.findByTestId('member-role-menu-item');

        // The owner's role stays disabled so the edit flow cannot be opened...
        expect(roleItem).toBeDisabled();

        // ...but it must not be dimmed or keep the caret, so it matches the other read-only fields.
        expect(roleItem).not.toHaveStyle({opacity: 0.5});
        expect(within(roleItem).queryByTestId('ArrowRight Icon')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
