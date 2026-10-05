import {act, render} from '@testing-library/react-native';

import Header from '@components/Header';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';
import SelectionList from '@components/SelectionList';

import {setEmployeeWorkArrangement} from '@libs/actions/Policy/DistanceRate';
import Navigation from '@libs/Navigation/Navigation';
import {canMemberWrite} from '@libs/PolicyUtils';
import {generateAccountID} from '@libs/UserUtils';

import WorkArrangementPage from '@pages/workspace/members/WorkArrangementPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList, Policy} from '@src/types/onyx';

import type React from 'react';
import type {PropsWithChildren} from 'react';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

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
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => true})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@libs/actions/Policy/DistanceRate', () => ({setEmployeeWorkArrangement: jest.fn()}));
jest.mock('@libs/PolicyUtils', () => ({
    canMemberWrite: jest.fn(() => true),
    isMemberInHomeAndOfficeWorkspace: jest.fn((_policy: Policy, login: string) => login === 'member@example.com'),
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children, shouldBeBlocked}: PropsWithChildren<{shouldBeBlocked: boolean}>) => (shouldBeBlocked ? null : children),
}));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);

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
        employeeList: {[memberLogin]: {email: memberLogin}},
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
        jest.mocked(canMemberWrite).mockReturnValue(true);
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

    it('updates the arrangement and returns to member details when a different option is selected', () => {
        // Given the page is open for a member whose current arrangement is no regular workspace
        renderPage();

        // When the user selects office-based
        act(() => {
            getSelectionListProps()?.onSelectRow?.({value: true});
        });

        // Then the update is requested and the member details page is shown
        expect(setEmployeeWorkArrangement).toHaveBeenCalledWith(policy, [accountID], true, personalDetails, expect.any(Function));
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
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(policyID));
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

    it('uses the resolved account ID for the first arrangement change after an offline invite syncs', async () => {
        // Given the arrangement page was opened while the invite had only an optimistic account ID
        const optimisticAccountID = generateAccountID(memberLogin);
        const optimisticPersonalDetails: PersonalDetailsList = {
            [optimisticAccountID]: createMock<PersonalDetails>({accountID: optimisticAccountID, login: memberLogin, isOptimisticPersonalDetail: true}),
        };
        const pendingInvitePolicy = createMock<Policy>({
            ...policy,
            employeeList: {[memberLogin]: {email: memberLogin, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}},
        });
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, optimisticPersonalDetails);
        });
        const renderedPage = renderPage(optimisticAccountID, optimisticPersonalDetails, pendingInvitePolicy);

        // When the invite syncs and replaces the optimistic personal details with the server account ID
        const syncedAccountID = 67890;
        const syncedPersonalDetail = createMock<PersonalDetails>({accountID: syncedAccountID, login: memberLogin});
        const syncedPersonalDetails: PersonalDetailsList = {[syncedAccountID]: syncedPersonalDetail};
        const syncedPolicy = createMock<Policy>({...pendingInvitePolicy, employeeList: {[memberLogin]: {email: memberLogin, pendingAction: null}}});
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, syncedPersonalDetails);
        });
        renderedPage.rerender(getPage(optimisticAccountID, syncedPersonalDetails, syncedPolicy));

        // And the admin changes the arrangement for the first time
        act(() => {
            getSelectionListProps()?.onSelectRow?.({value: true});
        });

        // Then the update uses the synced account ID and the current personal details
        expect(setEmployeeWorkArrangement).toHaveBeenCalledWith(syncedPolicy, [syncedAccountID], true, syncedPersonalDetails, expect.any(Function));
    });

    it('keeps the member profile as the back destination after an offline invite syncs', async () => {
        // Given the arrangement page was opened while the invite had only an optimistic account ID
        const optimisticAccountID = generateAccountID(memberLogin);
        const optimisticPersonalDetails: PersonalDetailsList = {
            [optimisticAccountID]: createMock<PersonalDetails>({accountID: optimisticAccountID, login: memberLogin, isOptimisticPersonalDetail: true}),
        };
        const pendingInvitePolicy = createMock<Policy>({
            ...policy,
            employeeList: {[memberLogin]: {email: memberLogin, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}},
        });
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, optimisticPersonalDetails);
        });
        const renderedPage = renderPage(optimisticAccountID, optimisticPersonalDetails, pendingInvitePolicy);

        // When the invite syncs and replaces the optimistic personal details with the server account ID
        const syncedAccountID = 67890;
        const syncedPersonalDetail = createMock<PersonalDetails>({accountID: syncedAccountID, login: memberLogin});
        const syncedPersonalDetails: PersonalDetailsList = {[syncedAccountID]: syncedPersonalDetail};
        const syncedPolicy = createMock<Policy>({...pendingInvitePolicy, employeeList: {[memberLogin]: {email: memberLogin, pendingAction: null}}});
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

        // Then navigation targets the member profile with the synced account ID
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, syncedAccountID));
    });
});
