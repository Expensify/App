/** Covers account verification at both copilot access page entry points. */
import {act, render} from '@testing-library/react-native';

import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import {updateDelegateRole} from '@libs/actions/Delegate';
import {requestValidateCodeAction, validateSecondaryLogin} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import UpdateDelegateRolePage from '@pages/settings/Security/AddDelegate/UpdateDelegateRole/UpdateDelegateRolePage';
import UpdateDelegateValidateCodePage from '@pages/settings/Security/AddDelegate/UpdateDelegateRole/UpdateDelegateValidateCodePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Account} from '@src/types/onyx';
import type {DelegateRole} from '@src/types/onyx/Account';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';

const LOGIN = 'agent@example.com';
const OWNER_LOGIN = 'owner@example.com';
const VALIDATE_CODE = '123456';
type RoleOption = {value: DelegateRole; isSelected: boolean};
type ListProps = {data: RoleOption[]; onSelectRow: (option: RoleOption) => void};
type RolePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE>;
type ConfirmPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE_CONFIRM_VALIDATE_CODE>;
const mockSelectionList = jest.fn<null, [ListProps]>(() => null);
const mockUseOnyx = jest.fn<[unknown], [string]>();
let mockAccount: Account;

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
jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@components/ValidateCodeActionModal/ValidateCodeActionContent', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (login: string) => login}));
jest.mock('@hooks/useOnyx', () => (key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const [value] = mockUseOnyx(key);
    return [options?.selector ? options.selector(value) : value];
});
jest.mock('@libs/actions/Delegate', () => ({updateDelegateRole: jest.fn(), clearDelegateErrorsByField: jest.fn()}));
jest.mock('@libs/actions/User', () => ({
    requestValidateCodeAction: jest.fn(),
    validateSecondaryLogin: jest.fn(),
    clearContactMethodErrors: jest.fn(),
    clearUnvalidatedNewContactMethodAction: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn(), dismissModal: jest.fn()}));

// The pages route through the Navigation singleton instead of the navigator prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const roleNavigation = {} as RolePageProps['navigation'];
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const confirmNavigation = {} as ConfirmPageProps['navigation'];

function renderPage(page: React.ReactElement) {
    const result = render(page);
    return {
        ...result,
        refreshAccount: () => result.rerender(React.cloneElement(page)),
        validateAccount: () => {
            mockAccount = {...mockAccount, validated: true};
            result.rerender(React.cloneElement(page));
        },
    };
}

function renderRolePage(currentRole: DelegateRole = CONST.DELEGATE_ROLE.ALL) {
    return renderPage(
        <UpdateDelegateRolePage
            navigation={roleNavigation}
            route={{key: 'role', name: SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE, params: {login: LOGIN, currentRole}}}
        />,
    );
}

function renderConfirmPage(newRole: DelegateRole = CONST.DELEGATE_ROLE.ALL) {
    return renderPage(
        <UpdateDelegateValidateCodePage
            navigation={confirmNavigation}
            route={{key: 'confirm', name: SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE_CONFIRM_VALIDATE_CODE, params: {login: LOGIN, currentRole: CONST.DELEGATE_ROLE.SUBMITTER, newRole}}}
        />,
    );
}

function getCodeForm() {
    const props = jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0];
    if (!props) {
        throw new Error('Code form not mounted');
    }
    return props;
}

function selectRole(role: DelegateRole) {
    const props = mockSelectionList.mock.lastCall?.[0];
    const option = props?.data.find((item) => item.value === role);
    if (!props || !option) {
        throw new Error('Role option not found');
    }
    act(() => props.onSelectRow(option));
}

describe('Copilot access account verification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAccount = {validated: false, primaryLogin: OWNER_LOGIN, delegatedAccess: {delegates: [{email: LOGIN, role: CONST.DELEGATE_ROLE.ALL}]}};
        mockUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.ACCOUNT) {
                return [mockAccount];
            }
            return [undefined];
        });
    });

    it.each([CONST.DELEGATE_ROLE.ALL, CONST.DELEGATE_ROLE.SUBMITTER])('requires account verification on entry with current role %s', (currentRole) => {
        // Given an unvalidated owner opening Change access level, or its equivalent deep link
        mockAccount.delegatedAccess = {delegates: [{email: LOGIN, role: currentRole}]};

        // When the role-selection page opens, before any role is selected
        renderRolePage(currentRole);
        act(() => getCodeForm().sendValidateCode());

        // Then only account verification is available, regardless of the direction of the eventual change
        expect(mockSelectionList).not.toHaveBeenCalled();
        expect(getCodeForm().validateCodeReasonCode).toBe(COMMON_CONST.VALIDATE_CODE_REASONS.VALIDATE_ACCOUNT);
        expect(requestValidateCodeAction).toHaveBeenCalledWith({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.VALIDATE_ACCOUNT});
        expect(updateDelegateRole).not.toHaveBeenCalled();
    });

    it('waits for successful account validation before allowing a downgrade', () => {
        // Given an unvalidated owner entering the access flow
        const {refreshAccount, validateAccount} = renderRolePage();

        // When a code is submitted but the server has not yet marked the account validated
        act(() => getCodeForm().handleSubmitForm(VALIDATE_CODE));
        refreshAccount();
        expect(validateSecondaryLogin).toHaveBeenCalledWith(OWNER_LOGIN, VALIDATE_CODE);
        expect(mockSelectionList).not.toHaveBeenCalled();
        expect(updateDelegateRole).not.toHaveBeenCalled();

        // Then successful validation reveals role selection; only selecting a new role applies the downgrade
        validateAccount();
        expect(mockSelectionList).toHaveBeenCalled();
        expect(updateDelegateRole).not.toHaveBeenCalled();
        selectRole(CONST.DELEGATE_ROLE.SUBMITTER);
        expect(updateDelegateRole).toHaveBeenCalledWith({email: LOGIN, role: CONST.DELEGATE_ROLE.SUBMITTER, delegatedAccess: mockAccount.delegatedAccess, validateCode: undefined});
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_COPILOT);
    });

    it('still requires action confirmation for an upgrade after account validation', () => {
        // Given an unvalidated owner with a submit-only copilot
        mockAccount.delegatedAccess = {delegates: [{email: LOGIN, role: CONST.DELEGATE_ROLE.SUBMITTER}]};
        const {validateAccount} = renderRolePage(CONST.DELEGATE_ROLE.SUBMITTER);

        // When account validation completes and full access is selected
        validateAccount();
        selectRole(CONST.DELEGATE_ROLE.ALL);

        // Then the selected copilot and new role continue to the separate action confirmation
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE_CONFIRM_VALIDATE_CODE.getRoute(LOGIN, CONST.DELEGATE_ROLE.ALL));
        expect(updateDelegateRole).not.toHaveBeenCalled();
    });

    it.each([CONST.DELEGATE_ROLE.ALL, CONST.DELEGATE_ROLE.SUBMITTER])('guards a direct confirmation link for role %s', (newRole) => {
        // Given an unvalidated owner who bypasses the menu and role-selection page
        // When they open the confirmation URL directly
        renderConfirmPage(newRole);
        act(() => {
            getCodeForm().sendValidateCode();
            getCodeForm().handleSubmitForm(VALIDATE_CODE);
        });

        // Then account verification handles the code, and the protected page cannot send a role request or navigate away
        expect(requestValidateCodeAction).toHaveBeenCalledTimes(1);
        expect(requestValidateCodeAction).toHaveBeenCalledWith({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.VALIDATE_ACCOUNT});
        expect(validateSecondaryLogin).toHaveBeenCalledWith(OWNER_LOGIN, VALIDATE_CODE);
        expect(updateDelegateRole).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('continues the intended confirmation after validating from a deep link', () => {
        // Given a direct link to increase a submit-only copilot to full access
        mockAccount.delegatedAccess = {delegates: [{email: LOGIN, role: CONST.DELEGATE_ROLE.SUBMITTER}]};
        const {validateAccount} = renderConfirmPage();

        // When the owner successfully validates their account
        validateAccount();
        act(() => getCodeForm().sendValidateCode());

        // Then the role-change code is requested for the original copilot, and submitting it updates the intended role
        expect(getCodeForm().validateCodeReasonCode).toBe(COMMON_CONST.VALIDATE_CODE_REASONS.UPDATE_DELEGATE);
        expect(requestValidateCodeAction).toHaveBeenCalledWith({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.UPDATE_DELEGATE, reasonTargetEmail: LOGIN});
        act(() => getCodeForm().handleSubmitForm(VALIDATE_CODE));
        expect(updateDelegateRole).toHaveBeenCalledWith({email: LOGIN, role: CONST.DELEGATE_ROLE.ALL, validateCode: VALIDATE_CODE, delegatedAccess: mockAccount.delegatedAccess});
    });

    it.each([renderRolePage, renderConfirmPage])('waits for account hydration before mounting either flow (%#)', (openPage) => {
        // Given account validation status has not loaded yet
        mockAccount.validated = undefined;

        // When either protected page is opened directly
        const {refreshAccount} = openPage();

        // Then neither verification nor role-change content mounts prematurely
        expect(FullscreenLoadingIndicator).toHaveBeenCalled();
        expect(ValidateCodeActionContent).not.toHaveBeenCalled();
        expect(mockSelectionList).not.toHaveBeenCalled();
        mockAccount.validated = false;
        refreshAccount();
        expect(getCodeForm().validateCodeReasonCode).toBe(COMMON_CONST.VALIDATE_CODE_REASONS.VALIDATE_ACCOUNT);
    });

    it.each([renderRolePage, renderConfirmPage])('returns to Copilots when account verification is cancelled (%#)', (openPage) => {
        // Given verification is the first step of either access page
        const {unmount} = openPage();

        // When the owner backs out instead of verifying
        act(() => getCodeForm().onClose?.());
        unmount();

        // Then cancellation returns to Copilots without applying an access change
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_COPILOT);
        expect(updateDelegateRole).not.toHaveBeenCalled();
    });

    it('downgrades a validated owner directly using the current stored role', () => {
        // Given a validated owner and a stale role in the URL
        mockAccount.validated = true;
        renderRolePage(CONST.DELEGATE_ROLE.SUBMITTER);

        // When the owner reduces their copilot's current full access
        selectRole(CONST.DELEGATE_ROLE.SUBMITTER);

        // Then the existing direct downgrade behavior is preserved
        expect(ValidateCodeActionContent).not.toHaveBeenCalled();
        expect(updateDelegateRole).toHaveBeenCalledTimes(1);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_COPILOT);
    });

    it('closes without updating when a validated owner selects the current role', () => {
        // Given a validated owner viewing the existing access level
        mockAccount.validated = true;
        renderRolePage();

        // When they select the already selected role
        selectRole(CONST.DELEGATE_ROLE.ALL);

        // Then the modal closes without any request
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        expect(updateDelegateRole).not.toHaveBeenCalled();
    });
});
