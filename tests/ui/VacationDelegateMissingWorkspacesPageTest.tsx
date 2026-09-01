import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Text from '@components/Text';

import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
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
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, HTMLEngineProvider]}>
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
    // page is only ever reached with errors already null.
    await act(async () => {
        await Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
            creator: CREATOR_EMAIL,
            delegate,
            previousDelegate: PREVIOUS_DELEGATE_EMAIL,
            policyDiff,
        });
    });
}

describe('VacationDelegateMissingWorkspacesPage', () => {
    let apiSideEffectSpy: jest.SpyInstance;
    let apiWriteSpy: jest.SpyInstance;

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
        apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MEMBER_POLICY_ID}`, {
                ...getFakePolicy(MEMBER_POLICY_ID, 'Member Workspace'),
                employeeList: {[CREATOR_EMAIL]: {email: CREATOR_EMAIL, role: CONST.POLICY.ROLE.USER}},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${ADMIN_POLICY_ID}`, {
                ...getFakePolicy(ADMIN_POLICY_ID, 'Admin Workspace'),
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
        await seedVacationDelegate(undefined);
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(TestHelper.translateLocal('notFound.notHere'))).toBeOnTheScreen();
    });

    it('shows only the member-of section and a Confirm button when the delegate is admin of none', async () => {
        await seedVacationDelegate({adminPolicies: [], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('Member Workspace')).toBeOnTheScreen();
        expect(screen.queryByText('Admin Workspace')).not.toBeOnTheScreen();
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.confirm')})).toBeOnTheScreen();
        expect(screen.queryByRole('button', {name: TestHelper.translateLocal('common.invite')})).not.toBeOnTheScreen();

        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.confirm')}));
        await waitForBatchedUpdatesWithAct();

        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_VACATION_DELEGATE,
            expect.objectContaining({creator: CREATOR_EMAIL, overridePolicyDiffWarning: true, skipPolicyInviteEmails: false}),
            expect.anything(),
        );
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.anything(), expect.anything());
    });

    it('formats an SMS delegate login as a phone number in the intro copy instead of the raw @expensify.sms address', async () => {
        const smsDelegate = `+15005550006${CONST.SMS.DOMAIN}`;
        await seedVacationDelegate({adminPolicies: [], nonAdminPolicies: [MEMBER_POLICY_ID]}, smsDelegate);
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(smsDelegate)).not.toBeOnTheScreen();
        expect(screen.getByText(formatPhoneNumber(smsDelegate))).toBeOnTheScreen();
    });

    it('shows only the admin-of section and Invite/Skip buttons when the delegate is admin of all, and Skip sends no invites', async () => {
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('Admin Workspace')).toBeOnTheScreen();
        expect(screen.queryByText('Member Workspace')).not.toBeOnTheScreen();
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')})).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.skip')})).toBeOnTheScreen();

        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.skip')}));
        await waitForBatchedUpdatesWithAct();

        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_VACATION_DELEGATE,
            expect.objectContaining({overridePolicyDiffWarning: true, skipPolicyInviteEmails: true}),
            expect.anything(),
        );
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.anything(), expect.anything());
    });

    it('sends one AddMembersToWorkspace call per admin policy and then SetVacationDelegate when Invite is pressed', async () => {
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.objectContaining({policyID: ADMIN_POLICY_ID}), expect.anything());

        // Both requests go through the persisted queue, so going offline mid-flow cannot invite the delegate without setting them.
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.SET_VACATION_DELEGATE, expect.objectContaining({overridePolicyDiffWarning: true}), expect.anything());
        expect(apiSideEffectSpy).not.toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE, expect.anything(), expect.anything());
    });

    it('invites a delegate that has no personal details entry yet using an optimistic accountID', async () => {
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        // Both params are keyed off the invited accountID, so they stay empty when the delegate cannot be resolved to one.
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE,
            // require('@libs/API') is untyped (any), which taints the inferred type of these matchers; the assertion itself is fine.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect.objectContaining({employees: expect.stringContaining(DELEGATE_EMAIL), reportCreationData: expect.stringContaining(DELEGATE_EMAIL)}),
            expect.anything(),
        );
    });

    it('disables Invite and never sends AddMembersToWorkspace when an admin policy has not loaded', async () => {
        const UNAVAILABLE_POLICY_ID = 'unavailablePolicy';
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID, UNAVAILABLE_POLICY_ID], nonAdminPolicies: []});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(TestHelper.translateLocal('workspace.common.unavailable'))).toBeOnTheScreen();

        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')}));
        await waitForBatchedUpdatesWithAct();

        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, expect.anything(), expect.anything());
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.SET_VACATION_DELEGATE, expect.anything(), expect.anything());
    });

    it('shows both sections, member-of before admin-of, for a mixed diff', async () => {
        await seedVacationDelegate({adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('Member Workspace')).toBeOnTheScreen();
        expect(screen.getByText('Admin Workspace')).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.invite')})).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.skip')})).toBeOnTheScreen();
    });

    it('finishes rolling back an abandoned flow before exposing the delegate selection page', async () => {
        await seedVacationDelegate({adminPolicies: [], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage(true);
        await waitForBatchedUpdatesWithAct();

        expect(mockPreventRemoveCallback).toBeDefined();
        await act(async () => {
            mockPreventRemoveCallback?.({data: {action: StackActions.pop()}});
            await waitForBatchedUpdatesWithAct();
        });

        expect(screen.getByText('Delegate selection')).toBeOnTheScreen();
        expect(screen.queryByText('Member Workspace')).not.toBeOnTheScreen();
        const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
        expect(vacationDelegate?.delegate).toBe(PREVIOUS_DELEGATE_EMAIL);
        expect(vacationDelegate?.policyDiff).toBeFalsy();

        // Starting a new selection after the picker is visible must not be overwritten by cleanup from the route that just closed.
        const nextPolicyDiff = {adminPolicies: [ADMIN_POLICY_ID], nonAdminPolicies: []};
        await seedVacationDelegate(nextPolicyDiff, 'next@example.com');
        await waitForBatchedUpdatesWithAct();

        const nextVacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
        expect(nextVacationDelegate?.delegate).toBe('next@example.com');
        expect(nextVacationDelegate?.policyDiff).toEqual(nextPolicyDiff);
    });

    it('keeps rendering what was submitted when the flow state is cleared underneath it', async () => {
        jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await seedVacationDelegate({adminPolicies: [], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.confirm')}));
        await waitForBatchedUpdatesWithAct();

        // Navigation only pops this screen once the transition finishes, so the submitted request nulls the flow state while it is
        // still mounted. That must not turn it into the not found page or flip the copy to the previous delegate.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {delegate: PREVIOUS_DELEGATE_EMAIL, policyDiff: null});
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByText(TestHelper.translateLocal('notFound.notHere'))).not.toBeOnTheScreen();
        expect(screen.getByText('Member Workspace')).toBeOnTheScreen();
        expect(screen.getByText(DELEGATE_EMAIL)).toBeOnTheScreen();
        expect(screen.queryByText(PREVIOUS_DELEGATE_EMAIL)).not.toBeOnTheScreen();
    });

    it('keeps rendering the current flow while a back navigation action has not been handled', async () => {
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await seedVacationDelegate({adminPolicies: [], nonAdminPolicies: [MEMBER_POLICY_ID]});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));
        await waitForBatchedUpdatesWithAct();

        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_VACATION_DELEGATE);

        // The rollback runs from the route-removal handler, not from the back press, so nothing can flash while Navigation is still waiting on the transition.
        const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
        expect(vacationDelegate?.delegate).toBe(DELEGATE_EMAIL);
        expect(vacationDelegate?.policyDiff).not.toBeFalsy();
        expect(screen.queryByText(TestHelper.translateLocal('notFound.notHere'))).not.toBeOnTheScreen();
        expect(screen.getByText(DELEGATE_EMAIL)).toBeOnTheScreen();
    });
});
