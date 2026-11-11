import {act, render} from '@testing-library/react-native';

import Header from '@components/Header';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';
import SelectionList from '@components/SelectionList';

import useDynamicBackPath from '@hooks/useDynamicBackPath';

import {setEmployeeWorkArrangement} from '@libs/actions/Policy/DistanceRate';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {canMemberWrite} from '@libs/PolicyUtils';
import {generateAccountID} from '@libs/UserUtils';

import LoadingPage from '@pages/LoadingPage';
import WorkArrangementPage from '@pages/workspace/members/WorkArrangementPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList, Policy} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';
import type React from 'react';
import type {PropsWithChildren} from 'react';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockIsWorkArrangementBetaEnabled = true;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
}));

jest.mock('@components/Header', () => {
    const ComposedHeader = jest.fn(({children}: PropsWithChildren) => children);
    const BackButton = jest.fn(() => null);
    const Title = jest.fn(() => null);

    Object.assign(ComposedHeader, {BackButton, Title});

    return {__esModule: true, default: ComposedHeader};
});
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'admin@example.com'})));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn());
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => mockIsWorkArrangementBetaEnabled})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@libs/actions/Policy/DistanceRate', () => ({setEmployeeWorkArrangement: jest.fn()}));
jest.mock('@libs/PolicyUtils', () => ({
    canMemberWrite: jest.fn(() => true),
    isMemberInHomeAndOfficeWorkspace: jest.fn((memberPolicy: Policy, login: string) => !!memberPolicy.employeeList?.[login]?.role),
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children, shouldBeBlocked}: PropsWithChildren<{shouldBeBlocked: boolean}>) => (shouldBeBlocked ? null : children),
}));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);
jest.mock('@pages/LoadingPage', () => jest.fn(() => null));

type MockWorkArrangementOption = {value: boolean; isSelected?: boolean};

type MockSelectionListProps = {
    data: MockWorkArrangementOption[];
    onSelectRow?: (item: MockWorkArrangementOption) => void;
};

type MockHeaderBackButtonProps = {
    onPress?: () => void;
};

type WorkArrangementPageTestProps = React.ComponentProps<typeof WorkArrangementPage> & {policy: Policy; personalDetails: PersonalDetailsList};

describe('WorkArrangementPage', () => {
    const policyID = 'policy123';
    const accountID = 12345;
    const memberLogin = 'member@example.com';
    const personalDetails: PersonalDetailsList = {[accountID]: createMock<PersonalDetails>({accountID, login: memberLogin})};
    const mockedHeaderBackButton = jest.mocked(Header.BackButton);
    const policy = {
        id: policyID,
        employeeList: {[memberLogin]: {email: memberLogin, role: CONST.POLICY.ROLE.USER}},
        commuterExclusions: {method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE, isOfficeWorkArrangement: false},
    };
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows props captured from the mocked SelectionList
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsWorkArrangementBetaEnabled = true;
        jest.mocked(canMemberWrite).mockReturnValue(true);
        jest.mocked(useDynamicBackPath).mockReturnValue(`workspaces/${policyID}/members/invite/invite-message` as Route);
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, {});
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_WORK_ARRANGEMENT_DRAFT}${policyID}`, null);
        });
    });

    const getPage = (routeAccountID = accountID, details: PersonalDetailsList = personalDetails, pagePolicy: Policy = createMock<Policy>(policy), isInviteFlow = false) => {
        const props = createMock<WorkArrangementPageTestProps>({
            policy: pagePolicy,
            personalDetails: details,
            route: isInviteFlow
                ? {name: SCREENS.WORKSPACE.INVITE_WORK_ARRANGEMENT, params: {policyID}}
                : {name: SCREENS.WORKSPACE.MEMBER_WORK_ARRANGEMENT, params: {policyID, accountID: String(routeAccountID)}},
        });
        // The HOC mock exposes the wrapped screen directly, which accepts the policy prop that the production HOC normally injects.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the test HOC mock returns the unwrapped component with its injected policy props restored
        const UnwrappedWorkArrangementPage = WorkArrangementPage as React.ComponentType<WorkArrangementPageTestProps>;
        return (
            <PersonalDetailsByLoginProvider>
                <UnwrappedWorkArrangementPage {...props} />
            </PersonalDetailsByLoginProvider>
        );
    };

    const renderPage = (routeAccountID = accountID, details: PersonalDetailsList = personalDetails, pagePolicy?: Policy) => render(getPage(routeAccountID, details, pagePolicy));

    it('does nothing when the selected arrangement is already active', () => {
        // Given the workspace default is no regular workspace
        renderPage();

        // When the user selects that already active arrangement
        act(() => {
            getSelectionListProps()?.onSelectRow?.({value: false});
        });

        // Then the action is not sent and the page stays open
        expect(setEmployeeWorkArrangement).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('does nothing when the current user cannot access the work arrangement page', () => {
        // Given the user lacks write access to workspace members
        jest.mocked(canMemberWrite).mockReturnValue(false);
        renderPage();

        // When they try to select another arrangement
        act(() => {
            getSelectionListProps()?.onSelectRow?.({value: true});
        });

        // Then no update or navigation occurs
        expect(setEmployeeWorkArrangement).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('blocks direct access to the work arrangement page when the beta is disabled', () => {
        // Given the work arrangement route is opened while its beta is disabled
        mockIsWorkArrangementBetaEnabled = false;

        // When the page checks whether the current user can access it
        renderPage();

        // Then the route is blocked instead of rendering the arrangement selector
        expect(mockedSelectionList).not.toHaveBeenCalled();
    });

    it('updates the arrangement and returns to member details when a different option is selected', () => {
        // Given the page is open for a member whose current arrangement is no regular workspace
        renderPage();

        // When the user selects office-based
        act(() => {
            getSelectionListProps()?.onSelectRow?.({value: true});
        });

        // Then the update is requested and the member details page is shown
        expect(setEmployeeWorkArrangement).toHaveBeenCalledWith(policy, [accountID], true, personalDetails);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    });

    it('updates the invite draft and returns to invite confirmation when a different option is selected', async () => {
        // Given the work arrangement editor was opened from invite confirmation for an unsent invitee
        const inviteAccountID = 23456;
        const invitePolicy = createMock<Policy>({...policy, employeeList: {}});
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, {[memberLogin]: inviteAccountID});
        });
        render(getPage(inviteAccountID, {[inviteAccountID]: createMock<PersonalDetails>({accountID: inviteAccountID, login: memberLogin})}, invitePolicy, true));
        await waitForBatchedUpdatesWithAct();

        // When the admin selects office-based
        await act(async () => {
            getSelectionListProps()?.onSelectRow?.({value: true});
        });
        await waitForBatchedUpdatesWithAct();

        // Then only the invite arrangement draft changes and the editor returns to confirmation
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_WORK_ARRANGEMENT_DRAFT}${policyID}`)).toBe(true);
        expect(setEmployeeWorkArrangement).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledWith(`workspaces/${policyID}/members/invite/invite-message`);
    });

    it('defaults an invite to office-based when the workspace has no work arrangement default', async () => {
        // Given an unsent invite whose workspace has no configured work arrangement default
        const inviteAccountID = 23456;
        const invitePolicy = createMock<Policy>({
            ...policy,
            employeeList: {},
            commuterExclusions: {method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE},
        });
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, {[memberLogin]: inviteAccountID});
        });
        render(getPage(inviteAccountID, personalDetails, invitePolicy, true));
        await waitForBatchedUpdatesWithAct();

        // When the admin opens the work arrangement selection for the invite
        // Then the Office-Based option matches the confirmation page's default
        expect(getSelectionListProps()?.data.find((option) => option.value)?.isSelected).toBe(true);
    });

    it('defaults a member to office-based when neither the member nor workspace has an arrangement', () => {
        // Given a home and office workspace with no member override or workspace default
        const policyWithoutDefault = createMock<Policy>({...policy, commuterExclusions: {method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE}});
        renderPage(accountID, personalDetails, policyWithoutDefault);

        // When the member's work arrangement settings load
        // Then Office-based is selected, matching the member details page and server fallback
        expect(getSelectionListProps()?.data.find((option) => option.value)?.isSelected).toBe(true);
        expect(getSelectionListProps()?.data.find((option) => !option.value)?.isSelected).toBe(false);
    });

    it('returns to the workflow invite confirmation after changing an invited approver arrangement', async () => {
        // Given an unsent approver invite that was opened from the workflow expenses-from flow
        const inviteAccountID = 23456;
        const invitePolicy = createMock<Policy>({...policy, employeeList: {}});
        const workflowInviteConfirmationPath = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_INVITE_MESSAGE.path, `workspaces/${policyID}/workflows/approvals/expenses-from`);
        jest.mocked(useDynamicBackPath).mockReturnValue(workflowInviteConfirmationPath);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, {[memberLogin]: inviteAccountID});
        });
        render(getPage(inviteAccountID, personalDetails, invitePolicy, true));
        await waitForBatchedUpdatesWithAct();

        // When the admin changes the invited approver to office-based
        act(() => {
            getSelectionListProps()?.onSelectRow?.({value: true});
        });

        // Then the workflow's invite confirmation stays as the return destination
        expect(Navigation.goBack).toHaveBeenCalledWith(workflowInviteConfirmationPath);
    });

    it('uses the resolved account ID for the first arrangement change after an offline invite syncs', async () => {
        // Given the arrangement page was opened while the invite had only an optimistic account ID
        const optimisticAccountID = generateAccountID(memberLogin);
        const optimisticPersonalDetails: PersonalDetailsList = {
            [optimisticAccountID]: createMock<PersonalDetails>({accountID: optimisticAccountID, login: memberLogin, isOptimisticPersonalDetail: true}),
        };
        const pendingInvitePolicy = createMock<Policy>({
            ...policy,
            employeeList: {[memberLogin]: {email: memberLogin, role: CONST.POLICY.ROLE.USER, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}},
        });
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, optimisticPersonalDetails);
        });
        const renderedPage = renderPage(optimisticAccountID, optimisticPersonalDetails, pendingInvitePolicy);

        // When the invite syncs and replaces the optimistic personal details with the server account ID
        const syncedAccountID = 67890;
        const syncedPersonalDetail = createMock<PersonalDetails>({accountID: syncedAccountID, login: memberLogin});
        const syncedPersonalDetails: PersonalDetailsList = {[syncedAccountID]: syncedPersonalDetail};
        const syncedPolicy = createMock<Policy>({...pendingInvitePolicy, employeeList: {[memberLogin]: {email: memberLogin, role: CONST.POLICY.ROLE.USER, pendingAction: null}}});
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, syncedPersonalDetails);
        });
        renderedPage.rerender(getPage(optimisticAccountID, syncedPersonalDetails, syncedPolicy));

        // And the admin changes the arrangement for the first time
        act(() => {
            getSelectionListProps()?.onSelectRow?.({value: true});
        });

        // Then the update uses the synced account ID and the current personal details
        expect(setEmployeeWorkArrangement).toHaveBeenCalledWith(syncedPolicy, [syncedAccountID], true, syncedPersonalDetails);
    });

    it('goes back to the details route that holds the optimistic account ID after an offline invite syncs', async () => {
        // Given the arrangement page was opened while the invite had only an optimistic account ID
        const optimisticAccountID = generateAccountID(memberLogin);
        const optimisticPersonalDetails: PersonalDetailsList = {
            [optimisticAccountID]: createMock<PersonalDetails>({accountID: optimisticAccountID, login: memberLogin, isOptimisticPersonalDetail: true}),
        };
        const pendingInvitePolicy = createMock<Policy>({
            ...policy,
            employeeList: {[memberLogin]: {email: memberLogin, role: CONST.POLICY.ROLE.USER, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}},
        });
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, optimisticPersonalDetails);
        });
        const renderedPage = renderPage(optimisticAccountID, optimisticPersonalDetails, pendingInvitePolicy);

        // When the invite syncs and replaces the optimistic personal details with the server account ID
        const syncedAccountID = 67890;
        const syncedPersonalDetail = createMock<PersonalDetails>({accountID: syncedAccountID, login: memberLogin});
        const syncedPersonalDetails: PersonalDetailsList = {[syncedAccountID]: syncedPersonalDetail};
        const syncedPolicy = createMock<Policy>({...pendingInvitePolicy, employeeList: {[memberLogin]: {email: memberLogin, role: CONST.POLICY.ROLE.USER, pendingAction: null}}});
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, syncedPersonalDetails);
        });
        renderedPage.rerender(getPage(optimisticAccountID, syncedPersonalDetails, syncedPolicy));

        expect(getSelectionListProps()).toBeDefined();

        // And the admin presses back
        const headerProps = mockedHeaderBackButton.mock.lastCall?.[0] as MockHeaderBackButtonProps | undefined;
        act(() => {
            headerProps?.onPress?.();
        });

        // Then navigation targets the details route with the optimistic account ID, so it pops to the details screen below that was
        // opened with it instead of replacing this page with a second details screen for the synced account ID
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, optimisticAccountID));
    });
    it.each([true, false])('handles a secondary-login swap with a primary login mapping of %s', async (hasMapping) => {
        // Given the existing-member arrangement page is open on an offline secondary-login invite
        const secondaryLogin = 'secondary@example.com';
        const optimisticAccountID = generateAccountID(secondaryLogin);
        const optimisticDetails: PersonalDetailsList = {
            [optimisticAccountID]: createMock<PersonalDetails>({accountID: optimisticAccountID, login: secondaryLogin, isOptimisticPersonalDetail: true}),
        };
        const pendingPolicy = createMock<Policy>({
            ...policy,
            employeeList: {[secondaryLogin]: {email: secondaryLogin, role: CONST.POLICY.ROLE.USER, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}},
        });
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, optimisticDetails);
        });
        const renderedPage = renderPage(optimisticAccountID, optimisticDetails, pendingPolicy);
        expect(getSelectionListProps()?.data).toHaveLength(2);

        // When sync replaces the secondary login, leaving only a pendingAction tombstone and optionally a primary mapping
        const syncedPolicy = createMock<Policy>({
            ...policy,
            employeeList: {...policy.employeeList, [secondaryLogin]: {pendingAction: null}},
            ...(hasMapping ? {primaryLoginsInvited: {[secondaryLogin]: memberLogin}} : {}),
        });
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        renderedPage.rerender(getPage(optimisticAccountID, personalDetails, syncedPolicy));

        // Then a resolvable member stays editable with the real account ID, otherwise the route waits without a redirect
        if (hasMapping) {
            expect(Navigation.goBack).not.toHaveBeenCalled();
            act(() => {
                getSelectionListProps()?.onSelectRow?.({value: true});
            });
            expect(setEmployeeWorkArrangement).toHaveBeenCalledWith(syncedPolicy, [accountID], true, personalDetails);
            expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, optimisticAccountID));
        } else {
            expect(renderedPage.toJSON()).toBeNull();
            expect(LoadingPage).toHaveBeenCalled();
            expect(Navigation.goBack).not.toHaveBeenCalled();
            expect(setEmployeeWorkArrangement).not.toHaveBeenCalled();
            const loadingProps = jest.mocked(LoadingPage).mock.lastCall?.[0];
            act(() => loadingProps?.onBackButtonPress?.());
            expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, optimisticAccountID));
            jest.mocked(Navigation.goBack).mockClear();

            renderedPage.rerender(getPage(optimisticAccountID, personalDetails, {...syncedPolicy, primaryLoginsInvited: {[secondaryLogin]: memberLogin}}));
            expect(getSelectionListProps()?.data).toHaveLength(2);
            expect(Navigation.goBack).not.toHaveBeenCalled();
            act(() => {
                getSelectionListProps()?.onSelectRow?.({value: true});
            });
            expect(setEmployeeWorkArrangement).toHaveBeenCalledWith(expect.objectContaining({id: policyID}), [accountID], true, personalDetails);
            expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, optimisticAccountID));
        }
    });

    it('keeps a failed secondary-login invite editable', async () => {
        // Given an existing-member arrangement page opened before the secondary-login invite finishes
        const pendingPolicy = createMock<Policy>({
            ...policy,
            employeeList: {[memberLogin]: {...policy.employeeList[memberLogin], pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}},
        });
        const renderedPage = renderPage(accountID, personalDetails, pendingPolicy);

        // When the invite fails, keeping the optimistic member and its error
        const failedPolicy = createMock<Policy>({
            ...policy,
            employeeList: {[memberLogin]: {...policy.employeeList[memberLogin], pendingAction: null, errors: {[Date.now()]: 'Invite failed'}}},
        });
        renderedPage.rerender(getPage(accountID, personalDetails, failedPolicy));

        // Then no removal redirect or automatic arrangement change occurs
        expect(getSelectionListProps()?.data).toHaveLength(2);
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(setEmployeeWorkArrangement).not.toHaveBeenCalled();
    });

    it.each(['beta', 'workspace configuration', 'viewer permission'])('does not bypass %s restrictions while identity is resolving', async (restriction) => {
        // Given an existing member page opened for an optimistic secondary-login invitation
        const secondaryLogin = 'secondary@example.com';
        const optimisticAccountID = generateAccountID(secondaryLogin);
        const optimisticDetails: PersonalDetailsList = {
            [optimisticAccountID]: createMock<PersonalDetails>({accountID: optimisticAccountID, login: secondaryLogin, isOptimisticPersonalDetail: true}),
        };
        const pendingPolicy = createMock<Policy>({
            ...policy,
            employeeList: {[secondaryLogin]: {email: secondaryLogin, role: CONST.POLICY.ROLE.USER, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}},
        });
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, optimisticDetails);
        });
        const renderedPage = renderPage(optimisticAccountID, optimisticDetails, pendingPolicy);

        // When the identity disappears and a separate access condition stops permitting the page
        mockIsWorkArrangementBetaEnabled = restriction !== 'beta';
        jest.mocked(canMemberWrite).mockReturnValue(restriction !== 'viewer permission');
        const resolvingPolicy = createMock<Policy>({
            ...pendingPolicy,
            employeeList: {},
            ...(restriction === 'workspace configuration' ? {commuterExclusions: {method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE}} : {}),
        });
        jest.mocked(LoadingPage).mockClear();
        mockedSelectionList.mockClear();
        renderedPage.rerender(getPage(optimisticAccountID, optimisticDetails, resolvingPolicy));

        // Then neither loading nor stale editing bypasses the restriction, and no mutation or automatic navigation occurs
        expect(LoadingPage).not.toHaveBeenCalled();
        expect(mockedSelectionList).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(setEmployeeWorkArrangement).not.toHaveBeenCalled();
    });
});
