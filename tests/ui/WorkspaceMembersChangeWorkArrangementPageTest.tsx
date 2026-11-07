import {act, render} from '@testing-library/react-native';

import Button from '@components/Button';
import WorkArrangementSelector from '@components/WorkArrangementSelector';

import useOnyx from '@hooks/useOnyx';

import {setEmployeeWorkArrangement} from '@libs/actions/Policy/DistanceRate';
import {clearWorkspaceMembersSelectedForBulkEdit} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspaceMembersChangeWorkArrangementPage from '@pages/workspace/members/WorkspaceMembersChangeWorkArrangementPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';

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
jest.mock('@components/ScrollView', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@components/WorkArrangementSelector', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'admin@example.com'})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => true})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn(), navigate: jest.fn()}));
jest.mock('@libs/actions/Policy/DistanceRate', () => ({setEmployeeWorkArrangement: jest.fn()}));
jest.mock('@libs/actions/Policy/Member', () => ({clearWorkspaceMembersSelectedForBulkEdit: jest.fn()}));
jest.mock('@libs/PolicyUtils', () => ({canMemberWrite: jest.fn(() => true)}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({__esModule: true, default: jest.fn(({children}: PropsWithChildren) => children)}));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);

type MockWorkArrangementSelectorProps = {
    isOffice: boolean | undefined;
    onSelect: (isOffice: boolean) => void;
};

type MockButtonProps = {
    onPress?: () => void;
    isDisabled?: boolean;
};

type WorkspaceMembersChangeWorkArrangementPageTestProps = React.ComponentProps<typeof WorkspaceMembersChangeWorkArrangementPage> & {
    policy: Policy;
    personalDetails: PersonalDetailsList;
};

describe('WorkspaceMembersChangeWorkArrangementPage', () => {
    const policyID = 'policy123';
    const member1AccountID = 1;
    const member2AccountID = 2;
    const member1Login = 'member1@example.com';
    const member2Login = 'member2@example.com';
    const personalDetails = {[member1AccountID]: {login: member1Login}, [member2AccountID]: {login: member2Login}};
    const getSelectorProps = () => jest.mocked(WorkArrangementSelector).mock.lastCall?.[0] as MockWorkArrangementSelectorProps | undefined;
    const getConfirmButtonProps = () => jest.mocked(Button).mock.lastCall?.[0] as MockButtonProps | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useOnyx).mockReturnValue([{policyID, accountIDs: [member1AccountID, member2AccountID]}, {status: 'loaded'}]);
    });

    const renderPage = (member1IsOffice?: boolean, member2IsOffice?: boolean) => {
        const policy = {
            id: policyID,
            commuterExclusions: {method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE, isOfficeWorkArrangement: false},
            employeeList: {
                [member1Login]: {email: member1Login, hasOfficeWorkArrangement: member1IsOffice},
                [member2Login]: {email: member2Login, hasOfficeWorkArrangement: member2IsOffice},
            },
        };
        const props = createMock<WorkspaceMembersChangeWorkArrangementPageTestProps>({
            policy: createMock<Policy>(policy),
            personalDetails,
            route: {params: {policyID}},
        });
        // The HOC mock exposes the wrapped screen directly, which accepts the policy prop that the production HOC normally injects.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the test HOC mock returns the unwrapped component with its injected policy props restored
        const UnwrappedPage = WorkspaceMembersChangeWorkArrangementPage as React.ComponentType<WorkspaceMembersChangeWorkArrangementPageTestProps>;
        render(<UnwrappedPage {...props} />);
        return props.policy;
    };

    it('selects the arrangement the selected members share', () => {
        // Given a remote member and one following the remote workspace default
        renderPage(false);

        // When the page shows the arrangements
        // Then their shared arrangement is selected and can be confirmed
        expect(getSelectorProps()?.isOffice).toBe(false);
        expect(getConfirmButtonProps()?.isDisabled).toBe(false);
    });

    it('selects nothing while the selected members have different arrangements', () => {
        // Given an office-based member and a remote one
        renderPage(true, false);

        // When the page shows the arrangements
        // Then no arrangement is selected and there is nothing to confirm yet
        expect(getSelectorProps()?.isOffice).toBeUndefined();
        expect(getConfirmButtonProps()?.isDisabled).toBe(true);
    });

    it('applies the chosen arrangement to the selected members without it and hands back the selection once the page closes', () => {
        // Given an office-based member and a remote one
        const policy = renderPage(true, false);

        // When office-based is chosen and confirmed
        act(() => {
            getSelectorProps()?.onSelect(true);
        });
        act(() => {
            getConfirmButtonProps()?.onPress?.();
        });

        // Then only the remote member is made office-based, and the selection is cleared after returning to the members
        expect(setEmployeeWorkArrangement).toHaveBeenCalledWith(policy, [member2AccountID], true, personalDetails);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID), {afterTransition: clearWorkspaceMembersSelectedForBulkEdit});
    });

    it('keeps members following the workspace default without an arrangement of their own when their shared arrangement is confirmed', () => {
        // Given both members follow the remote workspace default
        renderPage();

        // When the arrangement they share is confirmed without choosing the other one
        act(() => {
            getConfirmButtonProps()?.onPress?.();
        });

        // Then neither member gets an arrangement of their own, so both keep following the workspace default, and the page still closes
        expect(setEmployeeWorkArrangement).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID), {afterTransition: clearWorkspaceMembersSelectedForBulkEdit});
    });

    it('leaves out members picked on another workspace', () => {
        // Given members picked on another workspace's member list who also belong to this workspace
        jest.mocked(useOnyx).mockReturnValue([{policyID: 'otherPolicy', accountIDs: [member1AccountID, member2AccountID]}, {status: 'loaded'}]);
        renderPage(true, false);

        // When office-based is chosen and confirmed on this workspace's page
        act(() => {
            getSelectorProps()?.onSelect(true);
        });
        act(() => {
            getConfirmButtonProps()?.onPress?.();
        });

        // Then the page returns to this workspace's members and nobody's arrangement changes
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
        expect(setEmployeeWorkArrangement).not.toHaveBeenCalled();
    });

    it('returns to the members instead of showing the not found page when the selection is gone after a refresh', () => {
        // Given the in-memory selection was lost because the page was refreshed
        jest.mocked(useOnyx).mockReturnValue([undefined, {status: 'loaded'}]);

        // When the page opens
        renderPage(true, false);

        // Then it goes back to the members list, like the Change role page, rather than blocking itself
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
        expect(jest.mocked(AccessOrNotFoundWrapper).mock.lastCall?.[0].shouldBeBlocked).toBe(false);
    });

    it('waits for the selection to load before leaving', () => {
        // Given the selection has not loaded yet
        jest.mocked(useOnyx).mockReturnValue([undefined, {status: 'loading'}]);

        // When the page opens
        renderPage(true, false);

        // Then it stays open until it knows whether any members are selected
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
