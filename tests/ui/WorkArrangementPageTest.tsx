import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import {setEmployeeWorkArrangement} from '@libs/actions/Policy/DistanceRate';
import Navigation from '@libs/Navigation/Navigation';
import {canMemberWrite} from '@libs/PolicyUtils';

import WorkArrangementPage from '@pages/workspace/members/WorkArrangementPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';

import type React from 'react';
import type {PropsWithChildren} from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
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
    getMemberLoginByOptimisticAccountID: jest.fn(() => ''),
    isMemberInHomeAndOfficeWorkspace: jest.fn(() => true),
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({__esModule: true, default: ({children}: PropsWithChildren) => children}));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);

type MockWorkArrangementOption = {value: boolean};

type MockSelectionListProps = {
    data: MockWorkArrangementOption[];
    onSelectRow?: (item: MockWorkArrangementOption) => void;
};

type WorkArrangementPageTestProps = React.ComponentProps<typeof WorkArrangementPage> & {policy: Policy; personalDetails: PersonalDetailsList};

describe('WorkArrangementPage', () => {
    const policyID = 'policy123';
    const accountID = 12345;
    const memberLogin = 'member@example.com';
    const personalDetails = {[accountID]: {login: memberLogin}};
    const policy = {
        id: policyID,
        employeeList: {[memberLogin]: {email: memberLogin}},
        commuterExclusions: {method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE, isOfficeWorkArrangement: false},
    };
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows props captured from the mocked SelectionList
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(canMemberWrite).mockReturnValue(true);
    });

    const renderPage = () => {
        const props = createMock<WorkArrangementPageTestProps>({
            policy: createMock<Policy>(policy),
            personalDetails,
            route: {params: {policyID, accountID: String(accountID)}},
        });
        // The HOC mock exposes the wrapped screen directly, which accepts the policy prop that the production HOC normally injects.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the test HOC mock returns the unwrapped component with its injected policy props restored
        const UnwrappedWorkArrangementPage = WorkArrangementPage as React.ComponentType<WorkArrangementPageTestProps>;
        return render(<UnwrappedWorkArrangementPage {...props} />);
    };

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
});
