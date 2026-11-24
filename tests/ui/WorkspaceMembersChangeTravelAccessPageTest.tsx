import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import useOnyx from '@hooks/useOnyx';

import {clearWorkspaceMembersSelectedForBulkEdit} from '@libs/actions/Policy/Member';
import {setPolicyTravelMemberAccess} from '@libs/actions/Policy/Travel';
import Navigation from '@libs/Navigation/Navigation';
import {canChangeMemberTravelAccess} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspaceMembersChangeTravelAccessPage from '@pages/workspace/members/WorkspaceMembersChangeTravelAccessPage';

import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';

import type React from 'react';
import type {PropsWithChildren} from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/Header', () =>
    Object.assign(
        jest.fn(({children}: PropsWithChildren) => children),
        {BackButton: () => null, Title: () => null},
    ),
);
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'admin@example.com'})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => true})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn(), isNavigationReady: jest.fn(() => Promise.resolve())}));
jest.mock('@libs/actions/Policy/Member', () => ({clearWorkspaceMembersSelectedForBulkEdit: jest.fn()}));
jest.mock('@libs/actions/Policy/Travel', () => ({setPolicyTravelMemberAccess: jest.fn()}));
jest.mock('@libs/PolicyUtils', () => ({
    canChangeMemberTravelAccess: jest.fn(() => true),
    canMemberWrite: jest.fn(() => true),
    isWorkspaceProvisionedForTravel: jest.fn(() => true),
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({__esModule: true, default: jest.fn(({children}: PropsWithChildren) => children)}));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);

type WorkspaceMembersChangeTravelAccessPageTestProps = React.ComponentProps<typeof WorkspaceMembersChangeTravelAccessPage> & {
    policy: Policy;
    personalDetails: PersonalDetailsList;
};

describe('WorkspaceMembersChangeTravelAccessPage', () => {
    const policyID = 'policy123';
    const memberAccountID = 1;
    const adminAccountID = 2;
    const memberLogin = 'member@example.com';
    const adminLogin = 'otheradmin@example.com';
    const personalDetails = {[memberAccountID]: {login: memberLogin}, [adminAccountID]: {login: adminLogin}};
    const chooseOption = (canUseTravel: boolean) => {
        const selectionListProps = jest.mocked(SelectionList).mock.lastCall?.[0];
        const option = selectionListProps?.data.find((item) => item.keyForList === (canUseTravel ? 'turnOn' : 'turnOff'));
        if (!selectionListProps || !option) {
            throw new Error(`No option to turn travel ${canUseTravel ? 'on' : 'off'}`);
        }
        act(() => {
            selectionListProps.onSelectRow(option);
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(canChangeMemberTravelAccess).mockReturnValue(true);
        jest.mocked(useOnyx).mockReturnValue([{policyID, accountIDs: [memberAccountID, adminAccountID]}, {status: 'loaded'}]);
    });

    const renderPage = () => {
        const policy = {
            id: policyID,
            employeeList: {
                [memberLogin]: {email: memberLogin},
                [adminLogin]: {email: adminLogin},
            },
        };
        const props = createMock<WorkspaceMembersChangeTravelAccessPageTestProps>({
            policy: createMock<Policy>(policy),
            personalDetails,
            route: {params: {policyID}},
        });
        // The HOC mock exposes the wrapped screen directly, which accepts the policy prop that the production HOC normally injects.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the test HOC mock returns the unwrapped component with its injected policy props restored
        const UnwrappedPage = WorkspaceMembersChangeTravelAccessPage as React.ComponentType<WorkspaceMembersChangeTravelAccessPageTestProps>;
        render(<UnwrappedPage {...props} />);
        return props.policy;
    };

    it.each([
        ['off', false],
        ['on', true],
    ])('turns travel %s for every selected member and hands back the selection once the page closes', (_, canUseTravel) => {
        // Given two selected members whose travel access can be changed
        const policy = renderPage();

        // When an option is chosen
        chooseOption(canUseTravel);

        // Then both members are sent in one request, and the selection is cleared after returning to the members
        expect(setPolicyTravelMemberAccess).toHaveBeenCalledWith(
            policy,
            [
                {email: memberLogin, accountID: memberAccountID},
                {email: adminLogin, accountID: adminAccountID},
            ],
            canUseTravel,
        );
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID), {afterTransition: clearWorkspaceMembersSelectedForBulkEdit});
    });

    it('leaves out members whose travel access the current member cannot change', () => {
        // Given a travel admin, who can't change a workspace admin's travel access
        jest.mocked(canChangeMemberTravelAccess).mockImplementation((_policy, _login, targetLogin) => targetLogin !== adminLogin);
        const policy = renderPage();

        // When travel is turned off for the selection
        chooseOption(false);

        // Then only the member is sent, since the server rejects the whole request when it holds an admin
        expect(setPolicyTravelMemberAccess).toHaveBeenCalledWith(policy, [{email: memberLogin, accountID: memberAccountID}], false);
    });

    it('returns to the members without a request when nobody in the selection can be changed', () => {
        // Given every selected member became someone the current member can't change while the page was open
        jest.mocked(canChangeMemberTravelAccess).mockReturnValue(false);
        renderPage();

        // When travel is turned off for the selection
        chooseOption(false);

        // Then nothing is sent and the page goes back to the members
        expect(setPolicyTravelMemberAccess).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    });

    it('leaves out members picked on another workspace', () => {
        // Given members picked on another workspace's member list who also belong to this workspace
        jest.mocked(useOnyx).mockReturnValue([{policyID: 'otherPolicy', accountIDs: [memberAccountID, adminAccountID]}, {status: 'loaded'}]);
        renderPage();

        // When travel is turned off on this workspace's page
        chooseOption(false);

        // Then nobody's travel access changes
        expect(setPolicyTravelMemberAccess).not.toHaveBeenCalled();
    });

    it('returns to the members instead of showing the not found page when the selection is gone after a refresh', async () => {
        // Given the in-memory selection was lost because the page was refreshed
        jest.mocked(useOnyx).mockReturnValue([undefined, {status: 'loaded'}]);

        // When the page opens and navigation is ready
        renderPage();
        await act(async () => {
            await Promise.resolve();
        });

        // Then it goes back to the members list like the other bulk edit pages, rather than blocking itself
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
        expect(jest.mocked(AccessOrNotFoundWrapper).mock.lastCall?.[0].shouldBeBlocked).toBe(false);
    });
});
