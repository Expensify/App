import {act, render} from '@testing-library/react-native';

import Button from '@components/Button';
import SelectionList from '@components/SelectionList';

import useOnyx from '@hooks/useOnyx';

import {updateEmployeeOfficeLocation} from '@libs/actions/Policy/DistanceRate';
import {clearWorkspaceMembersSelectedForBulkEdit} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspaceMembersChangeOfficeLocationPage from '@pages/workspace/members/WorkspaceMembersChangeOfficeLocationPage';

import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';
import type {OfficeLocation} from '@src/types/onyx/Policy';

import type React from 'react';
import type {PropsWithChildren} from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/Button', () =>
    Object.assign(
        jest.fn(() => null),
        {Text: () => null, KeyboardShortcut: () => null},
    ),
);
jest.mock('@components/FixedFooter', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'admin@example.com'})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key, localeCompare: (a: string, b: string) => a.localeCompare(b)})));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => true})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@libs/actions/Policy/DistanceRate', () => ({updateEmployeeOfficeLocation: jest.fn()}));
jest.mock('@libs/actions/Policy/Member', () => ({clearWorkspaceMembersSelectedForBulkEdit: jest.fn()}));
jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils'),
    canMemberWrite: jest.fn(() => true),
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({__esModule: true, default: jest.fn(({children}: PropsWithChildren) => children)}));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);

const headquartersAndNewJerseyOffices: Record<string, OfficeLocation> = {
    OFFICE1: {name: 'Headquarters', address: {addressStreet: '88 Kearny St', city: 'San Francisco', state: 'CA', zipCode: '94108', country: 'US'}, isDefault: true},
    OFFICE2: {name: 'New Jersey Office', address: {addressStreet: '900 Asbury Ave', city: 'Ocean City', state: 'NJ', zipCode: '08226', country: 'US'}},
};

type MockOfficeLocationOption = {keyForList: string; isSelected?: boolean};

type MockSelectionListProps = {
    data: MockOfficeLocationOption[];
    onSelectRow?: (item: MockOfficeLocationOption) => void;
};

type MockButtonProps = {
    onPress?: () => void;
    isDisabled?: boolean;
};

type WorkspaceMembersChangeOfficeLocationPageTestProps = React.ComponentProps<typeof WorkspaceMembersChangeOfficeLocationPage> & {
    policy: Policy;
    personalDetails: PersonalDetailsList;
};

describe('WorkspaceMembersChangeOfficeLocationPage', () => {
    const policyID = 'policy123';
    const member1AccountID = 1;
    const member2AccountID = 2;
    const member1Login = 'member1@example.com';
    const member2Login = 'member2@example.com';
    const personalDetails = {[member1AccountID]: {login: member1Login}, [member2AccountID]: {login: member2Login}};
    const getSelectionListProps = () => jest.mocked(SelectionList).mock.lastCall?.[0] as MockSelectionListProps | undefined;
    const getConfirmButtonProps = () => jest.mocked(Button).mock.lastCall?.[0] as MockButtonProps | undefined;
    const getSelectedOfficeIDs = () =>
        getSelectionListProps()
            ?.data.filter((option) => option.isSelected)
            .map((option) => option.keyForList);

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useOnyx).mockReturnValue([{policyID, accountIDs: [member1AccountID, member2AccountID]}, {status: 'loaded'}]);
    });

    const renderPage = (member1OfficeID?: string, member2OfficeID?: string) => {
        const policy = {
            id: policyID,
            officeLocations: headquartersAndNewJerseyOffices,
            employeeList: {
                [member1Login]: {email: member1Login, officeID: member1OfficeID},
                [member2Login]: {email: member2Login, officeID: member2OfficeID},
            },
        };
        const props = createMock<WorkspaceMembersChangeOfficeLocationPageTestProps>({
            policy: createMock<Policy>(policy),
            personalDetails,
            route: {params: {policyID}},
        });
        // The HOC mock exposes the wrapped screen directly, which accepts the policy prop that the production HOC normally injects.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the test HOC mock returns the unwrapped component with its injected policy props restored
        const UnwrappedPage = WorkspaceMembersChangeOfficeLocationPage as React.ComponentType<WorkspaceMembersChangeOfficeLocationPageTestProps>;
        render(<UnwrappedPage {...props} />);
        return props.policy;
    };

    it('selects the office the selected members share', () => {
        // Given one member assigned to the primary office and one following it
        renderPage('OFFICE1');

        // When the page lists the offices
        // Then their shared office is selected and can be confirmed
        expect(getSelectedOfficeIDs()).toEqual(['OFFICE1']);
        expect(getConfirmButtonProps()?.isDisabled).toBe(false);
    });

    it('selects nothing while the selected members are in different offices', () => {
        // Given members in different offices
        renderPage('OFFICE1', 'OFFICE2');

        // When the page lists the offices
        // Then no office is selected and there is nothing to confirm yet
        expect(getSelectedOfficeIDs()).toEqual([]);
        expect(getConfirmButtonProps()?.isDisabled).toBe(true);
    });

    it('assigns the chosen office to the selected members outside it and hands back the selection once the page closes', () => {
        // Given members in different offices
        const policy = renderPage('OFFICE1', 'OFFICE2');

        // When the New Jersey office is chosen and confirmed
        act(() => {
            getSelectionListProps()?.onSelectRow?.({keyForList: 'OFFICE2'});
        });
        act(() => {
            getConfirmButtonProps()?.onPress?.();
        });

        // Then only the member outside it is assigned to it, and the selection is cleared after returning to the members
        expect(updateEmployeeOfficeLocation).toHaveBeenCalledWith(policy, [member1AccountID], 'OFFICE2', personalDetails);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID), {afterTransition: clearWorkspaceMembersSelectedForBulkEdit});
    });

    it('keeps members following the primary office unassigned when their shared office is confirmed', () => {
        // Given both members follow the primary office
        renderPage();

        // When the office they share is confirmed without choosing another one
        act(() => {
            getConfirmButtonProps()?.onPress?.();
        });

        // Then nobody is assigned to it, so both keep following whichever office is primary, and the page still closes
        expect(updateEmployeeOfficeLocation).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID), {afterTransition: clearWorkspaceMembersSelectedForBulkEdit});
    });

    it('leaves out members picked on another workspace', () => {
        // Given members picked on another workspace's member list who also belong to this workspace
        jest.mocked(useOnyx).mockReturnValue([{policyID: 'otherPolicy', accountIDs: [member1AccountID, member2AccountID]}, {status: 'loaded'}]);
        renderPage('OFFICE1', 'OFFICE2');

        // When an office is chosen and confirmed on this workspace's page
        act(() => {
            getSelectionListProps()?.onSelectRow?.({keyForList: 'OFFICE2'});
        });
        act(() => {
            getConfirmButtonProps()?.onPress?.();
        });

        // Then the page is blocked and nobody is assigned to the office
        expect(jest.mocked(AccessOrNotFoundWrapper).mock.lastCall?.[0].shouldBeBlocked).toBe(true);
        expect(updateEmployeeOfficeLocation).not.toHaveBeenCalled();
    });
});
