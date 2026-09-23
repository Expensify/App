import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';
import Text from '@components/Text';

import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import VacationDelegateMissingWorkspacesPage from '@pages/settings/Profile/CustomStatus/VacationDelegateMissingWorkspacesPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {VacationDelegatePolicyDiff} from '@src/types/onyx/VacationDelegate';

import type * as ReactNavigation from '@react-navigation/native';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer, StackActions} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CREATOR_ACCOUNT_ID = 1;
const CREATOR_EMAIL = 'creator@example.com';
const DELEGATE_EMAIL = 'delegate@example.com';
const PREVIOUS_DELEGATE_EMAIL = 'previous@example.com';

const MEMBER_POLICY_ID = 'memberPolicy';
const ADMIN_POLICY_ID = 'adminPolicy';
const SECOND_ADMIN_POLICY_ID = 'secondAdminPolicy';

const DELEGATE_ACCOUNT_ID = 2;
const EXISTING_CHAT_REPORT_ID = 'existingExpenseChat';
const ARCHIVED_EXPENSE_REPORT_ID = 'archivedExpenseReport';

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();
let mockPreventRemoveCallback: Parameters<typeof ReactNavigation.usePreventRemove>[1] | undefined;

jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNavigation,
        usePreventRemove: (preventRemove: boolean, callback: Parameters<typeof ReactNavigation.usePreventRemove>[1]) => {
            if (!preventRemove) {
                return;
            }
            mockPreventRemoveCallback = callback;
        },
    };
});

function getFakePolicy(id: string, name: string): Policy {
    return {
        id,
        name,
        isFromFullPolicy: false,
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        owner: CREATOR_EMAIL,
        outputCurrency: CONST.CURRENCY.USD,
        avatarURL: '',
        employeeList: {},
        lastModified: '1697323926777105',
        autoReporting: true,
        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        harvesting: {enabled: true},
        autoReportingOffset: 1,
        preventSelfApproval: true,
        defaultBillable: false,
        disabledFields: {defaultBillable: true, reimbursable: false},
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
    };
}

type InviteOnyxData = {
    optimisticData?: Array<{key: string}>;
    successData?: Array<{key: string}>;
};

// Only the shape this test asserts on; API.write is spied through an untyped require, so the calls need a type to read.
type ApiWriteCall = [command: string, params: unknown, onyxData: InviteOnyxData];

function getInviteOnyxData(calls: ApiWriteCall[]): InviteOnyxData[] {
    return calls.filter(([command]) => command === WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE).map(([, , onyxData]) => onyxData);
}

function hasPersonalDetailsUpdate(updates: Array<{key: string}> | undefined) {
    return !!updates?.some((update) => update.key === ONYXKEYS.PERSONAL_DETAILS_LIST);
}

/**
 * Seeds a policy expense chat the delegate already owns in ADMIN_POLICY_ID, holding a report preview of an
 * archived expense report. Re-inviting them has to un-archive that preview's child report, which is only
 * reachable through the report actions the page hands to addMembersToWorkspace.
 */
async function seedExistingDelegateExpenseChat() {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[DELEGATE_ACCOUNT_ID]: {accountID: DELEGATE_ACCOUNT_ID, login: DELEGATE_EMAIL}});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXISTING_CHAT_REPORT_ID}`, {
            reportID: EXISTING_CHAT_REPORT_ID,
            policyID: ADMIN_POLICY_ID,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            ownerAccountID: DELEGATE_ACCOUNT_ID,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXISTING_CHAT_REPORT_ID}`, {
            previewAction: {
                reportActionID: 'previewAction',
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                childReportID: ARCHIVED_EXPENSE_REPORT_ID,
                created: '2024-01-01 00:00:00.000',
            },
        });
    });
    await waitForBatchedUpdatesWithAct();
}

function VacationDelegateSelectionPage() {
    return <Text>Delegate selection</Text>;
}

function renderPage(shouldIncludeBackRoute = false) {
    const initialState = shouldIncludeBackRoute
        ? {
              index: 1,
              routes: [{name: SCREENS.SETTINGS.PROFILE.VACATION_DELEGATE}, {name: SCREENS.SETTINGS.PROFILE.VACATION_DELEGATE_MISSING_WORKSPACES}],
          }
        : undefined;

    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, HTMLEngineProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <NavigationContainer
                    ref={navigationRef}
                    initialState={initialState}
                >
                    <Stack.Navigator initialRouteName={SCREENS.SETTINGS.PROFILE.VACATION_DELEGATE_MISSING_WORKSPACES}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.PROFILE.VACATION_DELEGATE}
                            component={VacationDelegateSelectionPage}
                        />
                        <Stack.Screen
                            name={SCREENS.SETTINGS.PROFILE.VACATION_DELEGATE_MISSING_WORKSPACES}
                            component={VacationDelegateMissingWorkspacesPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

async function seedVacationDelegate(policyDiff?: VacationDelegatePolicyDiff, delegate: string = DELEGATE_EMAIL) {
    // The real 305 policy-diff-warning response never writes NVP errors (see VacationDelegate.ts), so this
    // page is only ever reached with errors already null. It also puts the saved delegate back and parks the pick
    // in pendingDelegate, so seed that shape.
    await act(async () => {
        await Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
            creator: CREATOR_EMAIL,
            delegate: PREVIOUS_DELEGATE_EMAIL,
            pendingDelegate: delegate,
            previousDelegate: PREVIOUS_DELEGATE_EMAIL,
            policyDiff,
        });
    });
}

describe('VacationDelegateMissingWorkspacesPage', () => {
    let apiSideEffectSpy: jest.SpyInstance;
    let apiReadSpy: jest.SpyInstance;
    let apiWriteSpy: jest.SpyInstance<Promise<void>, ApiWriteCall>;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockPreventRemoveCallback = undefined;
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await TestHelper.signInWithTestUser(CREATOR_ACCOUNT_ID, CREATOR_EMAIL);

        // Mocked only after signing in: TestHelper.signInWithTestUser relies on the real
        // API.write/makeRequestWithSideEffects to apply the SESSION/PERSONAL_DETAILS_LIST onyxData
        // from its mocked XHR responses. Mocking them earlier silently no-ops that Onyx application,
        // leaving useCurrentUserPersonalDetails() stuck on its default (unauthenticated) value.
        apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve());
        // require('@libs/API') is untyped (any), so the spy has to be re-typed here for mock.calls to be readable.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve()) as jest.SpyInstance<Promise<void>, ApiWriteCall>;
        apiReadSpy = jest.spyOn(require('@libs/API'), 'read').mockImplementation(() => {});

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MEMBER_POLICY_ID}`, {
                ...getFakePolicy(MEMBER_POLICY_ID, 'Member Workspace'),
                employeeList: {[CREATOR_EMAIL]: {email: CREATOR_EMAIL, role: CONST.POLICY.ROLE.USER}},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${ADMIN_POLICY_ID}`, {
                ...getFakePolicy(ADMIN_POLICY_ID, 'Admin Workspace'),
                employeeList: {[CREATOR_EMAIL]: {email: CREATOR_EMAIL, role: CONST.POLICY.ROLE.ADMIN}},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_ADMIN_POLICY_ID}`, {
                ...getFakePolicy(SECOND_ADMIN_POLICY_ID, 'Second Admin Workspace'),
                employeeList: {[CREATOR_EMAIL]: {email: CREATOR_EMAIL, role: CONST.POLICY.ROLE.ADMIN}},
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('renders the not found page when there is no policy diff', async () => {
        // Given no policy diff is seeded, which is the shape the NVP has when the page is reached without a pending 305
        await seedVacationDelegate(undefined);
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the not found page is shown instead of any workspace content
        expect(screen.getByText(TestHelper.translateLocal('notFound.notHere'))).toBeOnTheScreen();
    });

    it('shows only the member-of section and a Confirm button when the delegate is admin of none', async () => {
        // Given a policy diff where the delegate is a member of one workspace and admin of none
        await seedVacationDelegate({adminPolicies: [], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then only the member-of section and a Confirm button are shown, since there is nothing to invite into
        expect(screen.getByText('Member Workspace')).toBeOnTheScreen();
        expect(screen.queryByText('Admin Workspace')).not.toBeOnTheScreen();
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.confirm')})).toBeOnTheScreen();
        expect(screen.queryByRole('button', {name: TestHelper.translateLocal('common.invite')})).not.toBeOnTheScreen();

        // When Confirm is pressed
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.confirm')}));
        await waitForBatchedUpdatesWithAct();

        // Then the pick is finalized with the override flag and no invite is sent, since admin-of is empty
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.SET_VACATION_DELEGATE, expect.objectContaining({creator: CREATOR_EMAIL, overridePolicyDiffWarning: true}), expect.anything());
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.anything(), expect.anything());
    });

    it('formats an SMS delegate login as a phone number in the intro copy instead of the raw @expensify.sms address', async () => {
        // Given a delegate whose login is an SMS address, since bug #89578 once showed the raw @expensify.sms address
        // and this page replaced the warning modal that first carried the fix, so it now owns the guarantee
        const smsDelegate = `+15005550006${CONST.SMS.DOMAIN}`;
        await seedVacationDelegate({adminPolicies: [], nonAdminPolicies: [MEMBER_POLICY_ID]}, smsDelegate);
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the intro copy shows the formatted phone number, not the raw SMS login
        expect(screen.queryByText(smsDelegate)).not.toBeOnTheScreen();
        expect(screen.getByText(formatPhoneNumber(smsDelegate))).toBeOnTheScreen();
    });

    it('uses the display name for the intro copy instead of the raw login when the delegate has one', async () => {
        // Given a delegate whose personal details already carry a display name
        const DELEGATE_DISPLAY_NAME = 'Jane Doe';
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[DELEGATE_ACCOUNT_ID]: {accountID: DELEGATE_ACCOUNT_ID, login: DELEGATE_EMAIL, displayName: DELEGATE_DISPLAY_NAME}});
        });
        await seedVacationDelegate({adminPolicies: [], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the intro copy shows the display name, not the raw login
        expect(screen.getByText(DELEGATE_DISPLAY_NAME)).toBeOnTheScreen();
        expect(screen.queryByText(DELEGATE_EMAIL)).not.toBeOnTheScreen();
    });

    it('shows only the admin-of section and Invite/Skip buttons when the delegate is admin of all, and Skip sends no invites', async () => {
        // Given a policy diff where the delegate is admin of every workspace and a member of none
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then only the admin-of section and Invite/Skip buttons are shown, since there is nothing to acknowledge in member-of
        expect(screen.getByText('Admin Workspace')).toBeOnTheScreen();
        expect(screen.queryByText('Member Workspace')).not.toBeOnTheScreen();
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')})).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.skip')})).toBeOnTheScreen();

        // When Skip is pressed
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.skip')}));
        await waitForBatchedUpdatesWithAct();

        // Then the pick is finalized with the override flag and no invite is sent, since Skip declines every invite
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.SET_VACATION_DELEGATE, expect.objectContaining({overridePolicyDiffWarning: true}), expect.anything());
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.anything(), expect.anything());
    });

    it('sends one AddMembersToWorkspace call per admin policy and then SetVacationDelegate when Invite is pressed', async () => {
        // Given a policy diff where the delegate is admin of one workspace
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When Invite is pressed
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        // Then an AddMembersToWorkspace write is sent for that workspace, followed by SetVacationDelegate with the
        // override flag, and both go through the persisted write queue rather than a side-effect request, so going
        // offline mid-flow cannot invite the delegate without also setting them
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.objectContaining({policyID: ADMIN_POLICY_ID}), expect.anything());
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.SET_VACATION_DELEGATE, expect.objectContaining({overridePolicyDiffWarning: true}), expect.anything());
        expect(apiSideEffectSpy).not.toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE, expect.anything(), expect.anything());
    });

    it('stays usable offline instead of blocking the step, since every button it offers is a persisted write', async () => {
        // Given the network forced offline and a policy diff where the delegate is admin of one workspace
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: []});
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the offline-blocking view is not shown, only the offline indicator, since the delegate is already
        // optimistically set at this point and blocking the page would strand the user with an unconfirmed change until they reconnect
        expect(screen.queryByText(TestHelper.translateLocal('common.thisFeatureRequiresInternet'))).not.toBeOnTheScreen();
        expect(screen.getByText('Admin Workspace')).toBeOnTheScreen();

        // When Invite is pressed while offline
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        // Then both writes are still sent, since persisted writes are queued and survive being offline
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.objectContaining({policyID: ADMIN_POLICY_ID}), expect.anything());
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.SET_VACATION_DELEGATE, expect.objectContaining({overridePolicyDiffWarning: true}), expect.anything());
    });

    it('invites a delegate that has no personal details entry yet using an optimistic accountID', async () => {
        // Given a delegate with no personal details entry yet, so no real accountID exists for them
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When Invite is pressed
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        // Then the invite still carries the delegate's login in both employees and reportCreationData, keyed off an
        // optimistic accountID, rather than staying empty because the delegate could not be resolved to one
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE,
            // require('@libs/API') is untyped (any), which taints the inferred type of these matchers; the assertion itself is fine.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect.objectContaining({employees: expect.stringContaining(DELEGATE_EMAIL), reportCreationData: expect.stringContaining(DELEGATE_EMAIL)}),
            expect.anything(),
        );
    });

    it('reuses the expense chat the delegate already owns and un-archives its report previews', async () => {
        // Given a delegate who already owns a policy expense chat in the admin workspace, holding a report preview of
        // an archived expense report (see seedExistingDelegateExpenseChat)
        await seedExistingDelegateExpenseChat();
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When Invite is pressed
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        // Then the existing chat is reused rather than recreated
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE,
            // require('@libs/API') is untyped (any), which taints the inferred type of these matchers; the assertion itself is fine.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect.objectContaining({reportCreationData: expect.stringContaining(EXISTING_CHAT_REPORT_ID)}),
            expect.anything(),
        );

        // Then its preview's expense report is un-archived, which only happens when that chat's report actions reach
        // the invite, since re-inviting the delegate must not leave old previews stuck archived
        const [inviteOnyxData] = getInviteOnyxData(apiWriteSpy.mock.calls);
        expect(inviteOnyxData.optimisticData?.some((update) => update.key === `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${ARCHIVED_EXPENSE_REPORT_ID}`)).toBe(true);
    });

    it('lets only the last queued invite clean up the delegate optimistic personal details', async () => {
        // Given a policy diff where the delegate is admin of two workspaces, so two invites get queued
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID, SECOND_ADMIN_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When Invite is pressed
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        const inviteCalls = getInviteOnyxData(apiWriteSpy.mock.calls);
        expect(inviteCalls).toHaveLength(2);

        // Then every invite still seeds the optimistic delegate, so each policy expense chat renders them
        expect(inviteCalls.every((onyxData) => hasPersonalDetailsUpdate(onyxData.optimisticData))).toBe(true);

        // Then only the last invite tears the optimistic personal details down, because writes resolve in queue order
        // and a cleanup on the first invite would wipe the delegate out from under the invites still in flight
        expect(hasPersonalDetailsUpdate(inviteCalls.at(0)?.successData)).toBe(false);
        expect(hasPersonalDetailsUpdate(inviteCalls.at(-1)?.successData)).toBe(true);
    });

    it('disables Invite and never sends AddMembersToWorkspace when an admin policy has not loaded', async () => {
        // Given a policy diff that references an admin workspace not present in Onyx at all
        const UNAVAILABLE_POLICY_ID = 'unavailablePolicy';
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID, UNAVAILABLE_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then that workspace is shown as unavailable
        expect(screen.getByText(TestHelper.translateLocal('workspace.common.unavailable'))).toBeOnTheScreen();

        // When Invite is pressed anyway
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        // Then nothing is sent, since inviting into a workspace the client knows nothing about could not be done safely
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.anything(), expect.anything());
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.SET_VACATION_DELEGATE, expect.anything(), expect.anything());
    });

    it('disables Invite when an admin policy has no employee list, and refreshes every admin policy on entry', async () => {
        // Given an admin workspace present in Onyx but with no employee list loaded yet (unlike one missing from
        // Onyx entirely, this one is named, so the blocked Invite button is the only signal it isn't ready), alongside
        // another admin workspace whose employee list already loaded
        const SUMMARY_POLICY_ID = 'summaryPolicy';
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SUMMARY_POLICY_ID}`, getFakePolicy(SUMMARY_POLICY_ID, 'Summary Workspace'));
        });
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID, SUMMARY_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the workspace is still named on screen, and every admin workspace is refreshed on entry, sending the
        // members the client already knows so the server can drop the ones that no longer exist
        expect(screen.getByText('Summary Workspace')).toBeOnTheScreen();
        expect(apiReadSpy).toHaveBeenCalledWith(
            READ_COMMANDS.OPEN_WORKSPACE_MEMBERS_PAGE,
            expect.objectContaining({policyID: ADMIN_POLICY_ID, clientMemberEmails: JSON.stringify([CREATOR_EMAIL])}),
        );
        expect(apiReadSpy).toHaveBeenCalledWith(READ_COMMANDS.OPEN_WORKSPACE_MEMBERS_PAGE, expect.objectContaining({policyID: SUMMARY_POLICY_ID, clientMemberEmails: '[]'}));

        // When Invite is pressed
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        // Then nothing is sent, since a workspace with no employee list at all cannot be invited into (a partial list
        // is accepted, the same as in the regular invite flow, since it only affects the optimistic #announce room)
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.anything(), expect.anything());
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.SET_VACATION_DELEGATE, expect.anything(), expect.anything());
    });

    it('enables Invite once the fetched employee list arrives', async () => {
        // Given an admin workspace whose employee list has not loaded yet
        const SUMMARY_POLICY_ID = 'summaryPolicy';
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SUMMARY_POLICY_ID}`, getFakePolicy(SUMMARY_POLICY_ID, 'Summary Workspace'));
        });
        await seedVacationDelegate({adminPolicies: [SUMMARY_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When Invite is pressed before the list arrives
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        // Then nothing is sent, since the workspace isn't ready yet
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.anything(), expect.anything());

        // When the employee list then arrives and Invite is pressed again
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SUMMARY_POLICY_ID}`, {
                employeeList: {[CREATOR_EMAIL]: {email: CREATOR_EMAIL, role: CONST.POLICY.ROLE.ADMIN}},
            });
        });
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        // Then the invite is sent for that workspace, since it's now ready
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.objectContaining({policyID: SUMMARY_POLICY_ID}), expect.anything());
    });

    it('shows both sections, member-of before admin-of, for a mixed diff', async () => {
        // Given a mixed policy diff where the delegate is both a member of one workspace and admin of another
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then both sections are shown, member-of before admin-of, along with Invite and Skip buttons for the admin-of section
        expect(screen.getByText('Member Workspace')).toBeOnTheScreen();
        expect(screen.getByText('Admin Workspace')).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')})).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.skip')})).toBeOnTheScreen();
    });

    it('still asks the backend to email the non-admin workspaces when Skip is pressed on a mixed diff', async () => {
        // Given a mixed policy diff, since Skip only skips the invites the user controls: the owners of the
        // workspaces they don't administer are still emailed, matching Classic
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When Skip is pressed
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.skip')}));
        await waitForBatchedUpdatesWithAct();

        // Then the pick is finalized with the override flag so the backend can still email the non-admin workspaces,
        // and no AddMembersToWorkspace write is sent, since Skip only declines the invites the user controls
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.SET_VACATION_DELEGATE, expect.objectContaining({overridePolicyDiffWarning: true}), expect.anything());
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.anything(), expect.anything());
    });

    it('finishes rolling back an abandoned flow before exposing the delegate selection page', async () => {
        // Given a policy diff seeded with a back route to the delegate selection page
        await seedVacationDelegate({adminPolicies: [], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage(true);
        await waitForBatchedUpdatesWithAct();

        expect(mockPreventRemoveCallback).toBeDefined();

        // When the route is popped, abandoning the flow
        await act(async () => {
            mockPreventRemoveCallback?.({data: {action: StackActions.pop()}});
            await waitForBatchedUpdatesWithAct();
        });

        // Then the rollback finishes before the selection page underneath is shown, restoring the previous delegate and leaving no policy diff behind
        expect(screen.getByText('Delegate selection')).toBeOnTheScreen();
        expect(screen.queryByText('Member Workspace')).not.toBeOnTheScreen();
        const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
        expect(vacationDelegate?.delegate).toBe(PREVIOUS_DELEGATE_EMAIL);
        expect(vacationDelegate?.policyDiff).toBeFalsy();

        // When a new selection is seeded right after the picker becomes visible
        const nextPolicyDiff = {adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: []};
        await seedVacationDelegate(nextPolicyDiff, 'next@example.com');
        await waitForBatchedUpdatesWithAct();

        // Then it is not overwritten by cleanup from the route that just closed, since that cleanup must only ever affect the flow it belonged to
        const nextVacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
        expect(nextVacationDelegate?.pendingDelegate).toBe('next@example.com');
        expect(nextVacationDelegate?.policyDiff).toEqual(nextPolicyDiff);
    });

    it('keeps rendering what was submitted when the flow state is cleared underneath it', async () => {
        // Given Navigation.goBack stubbed out, so the screen stays mounted past submission the same way it does in
        // the real app, where navigation only pops this screen once the transition finishes
        jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await seedVacationDelegate({adminPolicies: [], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When Confirm is pressed
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.confirm')}));
        await waitForBatchedUpdatesWithAct();

        // When the submitted request then nulls the flow state (delegate/policyDiff) while the screen is still mounted
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {delegate: PREVIOUS_DELEGATE_EMAIL, policyDiff: null});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the page keeps rendering what was submitted rather than turning into the not found page or flipping the copy to the previous delegate
        expect(screen.queryByText(TestHelper.translateLocal('notFound.notHere'))).not.toBeOnTheScreen();
        expect(screen.getByText('Member Workspace')).toBeOnTheScreen();
        expect(screen.getByText(DELEGATE_EMAIL)).toBeOnTheScreen();
        expect(screen.queryByText(PREVIOUS_DELEGATE_EMAIL)).not.toBeOnTheScreen();
    });

    it('keeps rendering the current flow while a back navigation action has not been handled', async () => {
        // Given Navigation.goBack stubbed out, so pressing back does not itself complete the navigation
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await seedVacationDelegate({adminPolicies: [], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the back button is pressed
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));
        await waitForBatchedUpdatesWithAct();

        // Then Navigation.goBack is asked to go to the selection page, but the rollback itself runs from the
        // route-removal handler, not from the back press, so nothing can flash while Navigation is still waiting on the transition
        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_VACATION_DELEGATE);
        const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
        expect(vacationDelegate?.pendingDelegate).toBe(DELEGATE_EMAIL);
        expect(vacationDelegate?.policyDiff).not.toBeFalsy();
        expect(screen.queryByText(TestHelper.translateLocal('notFound.notHere'))).not.toBeOnTheScreen();
        expect(screen.getByText(DELEGATE_EMAIL)).toBeOnTheScreen();
    });
});
