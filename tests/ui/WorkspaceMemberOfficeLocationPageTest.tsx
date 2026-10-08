import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import {updateEmployeeOfficeLocation} from '@libs/actions/Policy/DistanceRate';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyAdmin} from '@libs/PolicyUtils';

import WorkspaceMemberOfficeLocationPage from '@pages/workspace/members/WorkspaceMemberOfficeLocationPage';

import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';
import type {CompanyAddress, OfficeLocation} from '@src/types/onyx/Policy';

import type React from 'react';
import type {PropsWithChildren} from 'react';

import createMock from '../utils/createMock';

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
    isPolicyAdmin: jest.fn(() => true),
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

type WorkspaceMemberOfficeLocationPageTestProps = React.ComponentProps<typeof WorkspaceMemberOfficeLocationPage> & {policy: Policy; personalDetails: PersonalDetailsList};

describe('WorkspaceMemberOfficeLocationPage', () => {
    const policyID = 'policy123';
    const accountID = 12345;
    const memberLogin = 'member@example.com';
    const personalDetails = {[accountID]: {login: memberLogin}};
    const mockedSelectionList = jest.mocked(SelectionList);
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;
    const getSelectedOfficeIDs = () =>
        getSelectionListProps()
            ?.data.filter((option) => option.isSelected)
            .map((option) => option.keyForList);

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(isPolicyAdmin).mockReturnValue(true);
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
        // Then the company address and every office are offered, and the primary office is the selected one
        expect(getSelectionListProps()?.data.map((option) => option.keyForList)).toEqual(['1', 'OFFICE1', 'OFFICE2']);
        expect(getSelectedOfficeIDs()).toEqual(['OFFICE1']);
    });

    it('does nothing when the selected office is already the member’s', () => {
        // Given a member assigned to the New Jersey office
        renderPage('OFFICE2');

        // When that office is selected again
        act(() => {
            getSelectionListProps()?.onSelectRow?.({keyForList: 'OFFICE2'});
        });

        // Then nothing is sent and the page stays open
        expect(updateEmployeeOfficeLocation).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('does nothing for a user who is not a workspace admin', () => {
        // Given a user who manages members without being a workspace admin
        jest.mocked(isPolicyAdmin).mockReturnValue(false);
        renderPage();

        // When they select another office
        act(() => {
            getSelectionListProps()?.onSelectRow?.({keyForList: 'OFFICE2'});
        });

        // Then nothing is sent, since only admins can change office assignments
        expect(updateEmployeeOfficeLocation).not.toHaveBeenCalled();
    });

    it('assigns the selected office and returns to the member details', () => {
        // Given a member who follows the primary office
        const policy = renderPage();

        // When the company address is selected
        act(() => {
            getSelectionListProps()?.onSelectRow?.({keyForList: '1'});
        });

        // Then the member is assigned to it and the member details are shown
        expect(updateEmployeeOfficeLocation).toHaveBeenCalledWith(policy, [accountID], '1', personalDetails, expect.any(Function));
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    });
});
