import {act, render} from '@testing-library/react-native';

import Button from '@components/Button';
import SelectionList from '@components/SelectionList';

import {updateEmployeeOfficeLocation} from '@libs/actions/Policy/DistanceRate';
import Navigation from '@libs/Navigation/Navigation';
import {canMemberWrite} from '@libs/PolicyUtils';

import WorkspaceMemberOfficeLocationPage from '@pages/workspace/members/WorkspaceMemberOfficeLocationPage';

import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';
import type {CompanyAddress, OfficeLocation} from '@src/types/onyx/Policy';

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
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => true})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@libs/actions/Policy/DistanceRate', () => ({updateEmployeeOfficeLocation: jest.fn()}));
jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils'),
    canMemberWrite: jest.fn(() => true),
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({__esModule: true, default: ({children}: PropsWithChildren) => children}));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);

const companyAddress: CompanyAddress = {addressStreet: '1 Market St', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'US'};
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

type WorkspaceMemberOfficeLocationPageTestProps = React.ComponentProps<typeof WorkspaceMemberOfficeLocationPage> & {policy: Policy; personalDetails: PersonalDetailsList};

describe('WorkspaceMemberOfficeLocationPage', () => {
    const policyID = 'policy123';
    const accountID = 12345;
    const memberLogin = 'member@example.com';
    const personalDetails = {[accountID]: {login: memberLogin}};
    const mockedSelectionList = jest.mocked(SelectionList);
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;
    const getConfirmButtonProps = () => jest.mocked(Button).mock.lastCall?.[0] as MockButtonProps | undefined;
    const getSelectedOfficeIDs = () =>
        getSelectionListProps()
            ?.data.filter((option) => option.isSelected)
            .map((option) => option.keyForList);

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(canMemberWrite).mockReturnValue(true);
    });

    const renderPage = (officeID?: string) => {
        const policy = {
            id: policyID,
            address: companyAddress,
            officeLocations: headquartersAndNewJerseyOffices,
            employeeList: {[memberLogin]: {email: memberLogin, officeID}},
        };
        const props = createMock<WorkspaceMemberOfficeLocationPageTestProps>({
            policy: createMock<Policy>(policy),
            personalDetails,
            route: {params: {policyID, accountID: String(accountID)}},
        });
        // The HOC mock exposes the wrapped screen directly, which accepts the policy prop that the production HOC normally injects.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the test HOC mock returns the unwrapped component with its injected policy props restored
        const UnwrappedPage = WorkspaceMemberOfficeLocationPage as React.ComponentType<WorkspaceMemberOfficeLocationPageTestProps>;
        render(<UnwrappedPage {...props} />);
        return props.policy;
    };

    it('lists the company address and the offices, with the primary office selected for a member without one', () => {
        // Given a member who follows the primary office
        renderPage();

        // When the page lists the offices
        // Then the company address and every office are offered, and the primary office is the selected one and can be confirmed
        expect(getSelectionListProps()?.data.map((option) => option.keyForList)).toEqual(['1', 'OFFICE1', 'OFFICE2']);
        expect(getSelectedOfficeIDs()).toEqual(['OFFICE1']);
        expect(getConfirmButtonProps()?.isDisabled).toBe(false);
    });

    it('returns to the member details without a change when the member’s office is confirmed', () => {
        // Given a member who follows the primary office
        renderPage();

        // When the office they follow is confirmed without choosing another one
        act(() => {
            getConfirmButtonProps()?.onPress?.();
        });

        // Then nothing is sent, so they keep following whichever office is primary, and the member details are shown
        expect(updateEmployeeOfficeLocation).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    });

    it('does nothing for a user who cannot manage members', () => {
        // Given a user without write access to the workspace members
        jest.mocked(canMemberWrite).mockReturnValue(false);
        renderPage();

        // When they choose another office and confirm
        act(() => {
            getSelectionListProps()?.onSelectRow?.({keyForList: 'OFFICE2'});
        });
        act(() => {
            getConfirmButtonProps()?.onPress?.();
        });

        // Then nothing is sent, since changing office assignments needs write access to the members
        expect(updateEmployeeOfficeLocation).not.toHaveBeenCalled();
    });

    it('assigns the chosen office once it is confirmed and returns to the member details', () => {
        // Given a member who follows the primary office
        const policy = renderPage();

        // When the company address is chosen
        act(() => {
            getSelectionListProps()?.onSelectRow?.({keyForList: '1'});
        });

        // Then it is selected but nothing is sent before confirming
        expect(getSelectedOfficeIDs()).toEqual(['1']);
        expect(updateEmployeeOfficeLocation).not.toHaveBeenCalled();

        // When the choice is confirmed
        act(() => {
            getConfirmButtonProps()?.onPress?.();
        });

        // Then the member is assigned to it and the member details are shown
        expect(updateEmployeeOfficeLocation).toHaveBeenCalledWith(policy, [accountID], '1', personalDetails);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    });
});
