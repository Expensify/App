/** Covers account verification before changing an existing copilot's access. */
import {act, render} from '@testing-library/react-native';

import {updateDelegateRole} from '@libs/actions/Delegate';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import UpdateDelegateRolePage from '@pages/settings/Security/AddDelegate/UpdateDelegateRole/UpdateDelegateRolePage';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Account} from '@src/types/onyx';
import type {DelegateRole} from '@src/types/onyx/Account';

import React from 'react';

type RoleOption = {value: DelegateRole; isSelected: boolean};
type ListProps = {
    data: RoleOption[];
    onSelectRow: (option: RoleOption) => void;
};
type PageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE>;

const LOGIN = 'agent@example.com';
const ROLE_ROUTE = ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE.getRoute(LOGIN, CONST.DELEGATE_ROLE.ALL);
const mockVerifyRoute = `${ROLE_ROUTE}/${DYNAMIC_ROUTES.VERIFY_ACCOUNT.path}`;
const mockSelectionList = jest.fn<null, [ListProps]>(() => null);
let mockAccount: Account;
let mockResumeAfterTransition: (() => void) | undefined;
let mockNavigationStateListener: (() => void) | undefined;

jest.mock('@components/SelectionList', () => (props: ListProps) => mockSelectionList(props));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/DelegateNoAccessWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useOnyx', () => (_key: string, options?: {selector?: (account: Account) => unknown}) => [options?.selector ? options.selector(mockAccount) : mockAccount]);
jest.mock('@libs/actions/Delegate', () => ({updateDelegateRole: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => () => mockVerifyRoute);
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    runAfterTransition: jest.fn(),
    runAfterUpcomingTransition: jest.fn(),
}));
jest.mock('@libs/Navigation/navigationRef', () => ({addListener: jest.fn()}));

// Navigation is provided by the navigator in the app; this page only uses the Navigation singleton.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as PageProps['navigation'];

function renderPage(currentRole: DelegateRole = CONST.DELEGATE_ROLE.ALL) {
    const page = (
        <UpdateDelegateRolePage
            navigation={navigation}
            route={{
                key: 'update-delegate-role',
                name: SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE,
                params: {login: LOGIN, currentRole},
            }}
        />
    );
    const result = render(page);
    return {
        validateAccount: () => {
            mockAccount = {...mockAccount, validated: true};
            result.rerender(React.cloneElement(page));
        },
    };
}

function selectRole(role: DelegateRole) {
    const props = mockSelectionList.mock.lastCall?.[0];
    const option = props?.data.find((item) => item.value === role);
    if (!props || !option) {
        throw new Error('Role option not found');
    }
    act(() => props.onSelectRow(option));
}

describe('UpdateDelegateRolePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAccount = {
            validated: false,
            delegatedAccess: {
                delegates: [{email: LOGIN, role: CONST.DELEGATE_ROLE.ALL}],
            },
        };
        mockResumeAfterTransition = undefined;
        mockNavigationStateListener = undefined;
        jest.mocked(Navigation.getActiveRouteWithoutParams).mockReturnValue(mockVerifyRoute);
        const queueResume = (callback: () => void) => {
            mockResumeAfterTransition = callback;
            return {cancel: jest.fn()};
        };
        jest.mocked(Navigation.runAfterTransition).mockImplementation(queueResume);
        jest.mocked(Navigation.runAfterUpcomingTransition).mockImplementation(queueResume);
        jest.mocked(navigationRef).addListener.mockImplementation((_event, listener) => {
            // The hook registers a state listener that does not inspect the event argument.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            mockNavigationStateListener = listener as () => void;
            return jest.fn();
        });
    });

    it('verifies the owner before downgrading an agent copilot, then resumes without an action code', () => {
        // Given an unvalidated owner whose agent already has full copilot access
        const {validateAccount} = renderPage();

        // When they select submit-only access, no role update may be sent before verification
        selectRole(CONST.DELEGATE_ROLE.SUBMITTER);
        expect(Navigation.navigate).toHaveBeenCalledWith(mockVerifyRoute);
        expect(updateDelegateRole).not.toHaveBeenCalled();

        // Then successful account validation resumes the selected downgrade after the verification screen closes
        validateAccount();
        act(() => mockResumeAfterTransition?.());
        expect(updateDelegateRole).toHaveBeenCalledTimes(1);
        expect(updateDelegateRole).toHaveBeenCalledWith({
            email: LOGIN,
            role: CONST.DELEGATE_ROLE.SUBMITTER,
            delegatedAccess: mockAccount.delegatedAccess,
            validateCode: undefined,
        });
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_COPILOT);
    });

    it('verifies the owner before opening the separate confirmation for increased access', () => {
        // Given an unvalidated owner increasing an existing copilot's privileges
        mockAccount.delegatedAccess = {
            delegates: [{email: LOGIN, role: CONST.DELEGATE_ROLE.SUBMITTER}],
        };
        const {validateAccount} = renderPage(CONST.DELEGATE_ROLE.SUBMITTER);

        // When full access is selected, account verification must happen first
        selectRole(CONST.DELEGATE_ROLE.ALL);
        expect(Navigation.navigate).toHaveBeenCalledWith(mockVerifyRoute);
        expect(updateDelegateRole).not.toHaveBeenCalled();

        // Then account validation continues to action confirmation without granting access yet
        validateAccount();
        act(() => mockResumeAfterTransition?.());
        expect(Navigation.navigate).toHaveBeenLastCalledWith(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE_CONFIRM_VALIDATE_CODE.getRoute(LOGIN, CONST.DELEGATE_ROLE.ALL));
        expect(updateDelegateRole).not.toHaveBeenCalled();
    });

    it('abandons the change when account verification is cancelled', () => {
        // Given a pending downgrade waiting for account verification
        const {validateAccount} = renderPage();
        selectRole(CONST.DELEGATE_ROLE.SUBMITTER);

        // When the owner leaves verification and validates elsewhere later
        jest.mocked(Navigation.getActiveRouteWithoutParams).mockReturnValue(ROLE_ROUTE);
        act(() => mockNavigationStateListener?.());
        validateAccount();

        // Then the abandoned change must not run or schedule a resume
        expect(mockResumeAfterTransition).toBeUndefined();
        expect(updateDelegateRole).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('downgrades a validated account directly using the current stored role', () => {
        // Given a validated owner and a route whose role is older than the current Onyx role
        mockAccount.validated = true;
        renderPage(CONST.DELEGATE_ROLE.SUBMITTER);

        // When the owner reduces the current full access
        selectRole(CONST.DELEGATE_ROLE.SUBMITTER);

        // Then no verification or action code is needed
        expect(updateDelegateRole).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_COPILOT);
    });

    it('keeps action confirmation for a validated owner increasing access', () => {
        // Given a validated owner with a submit-only copilot
        mockAccount = {
            validated: true,
            delegatedAccess: {
                delegates: [{email: LOGIN, role: CONST.DELEGATE_ROLE.SUBMITTER}],
            },
        };
        renderPage(CONST.DELEGATE_ROLE.SUBMITTER);

        // When they choose full access
        selectRole(CONST.DELEGATE_ROLE.ALL);

        // Then only the existing role-change confirmation is opened
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE_CONFIRM_VALIDATE_CODE.getRoute(LOGIN, CONST.DELEGATE_ROLE.ALL));
        expect(updateDelegateRole).not.toHaveBeenCalled();
    });

    it('does not verify or update when the selected role is unchanged', () => {
        // Given an unvalidated owner viewing the existing access level
        renderPage();

        // When they select the already selected role
        selectRole(CONST.DELEGATE_ROLE.ALL);

        // Then the modal closes without any verification or update
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(updateDelegateRole).not.toHaveBeenCalled();
    });
});
