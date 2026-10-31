import {render, waitFor} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';
import VacationDelegateMenuItem from '@components/VacationDelegateMenuItem';

import {closeUserAccount} from '@libs/actions/Domain';
import {clearDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import DomainMemberDetailsPage from '@pages/domain/Members/DomainMemberDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';

import type {PropsWithChildren} from 'react';

import React from 'react';

const DOMAIN_ACCOUNT_ID = 1;
const MEMBER_ACCOUNT_ID = 2;
const SECURITY_GROUP_KEY = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`;

let mockDomain: Record<string, BaseVacationDelegate | {shared: Record<string, string>}> | undefined;
const mockShowDecisionModal = jest.fn();
const mockShowConfirmModal = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
}));

jest.mock('@libs/actions/FormActions', () => ({
    clearDraftValues: jest.fn(),
}));

jest.mock('@libs/actions/Domain', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Domain'),
    closeUserAccount: jest.fn(),
}));

// Renders only the page's own rows, so the test can reach the vacation delegate row without the member header and its data
jest.mock('@pages/domain/BaseDomainMemberDetailsComponent', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/OfflineWithFeedback', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/VacationDelegateMenuItem', () => jest.fn(() => null));
jest.mock('@components/MenuItem/presets/MenuItemField', () => jest.fn(() => null));
jest.mock('@components/MenuItem/presets/MenuItemAction', () => jest.fn(() => null));
jest.mock('@components/MenuItem', () => ({__esModule: true, default: new Proxy({}, {get: () => () => null})}));
jest.mock('@components/Button', () => ({__esModule: true, default: new Proxy({}, {get: () => () => null})}));

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: jest.fn(() => ({}))}));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: mockShowConfirmModal})));
jest.mock('@hooks/useDecisionModal', () => jest.fn(() => ({showDecisionModal: mockShowDecisionModal})));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: false})));
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetail: jest.fn(() => [{accountID: 2, login: 'member@example.com'}])}));
// Every domain read goes through a selector, so each one is applied to the same mock domain record
jest.mock('@hooks/useOnyx', () => jest.fn((key: string, options?: {selector?: (value: unknown) => unknown}) => [options?.selector ? options.selector(mockDomain) : undefined]));

type DomainMemberDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

const route: DomainMemberDetailsPageProps['route'] = {
    key: 'domain-member-details',
    name: SCREENS.DOMAIN.MEMBER_DETAILS,
    params: {domainAccountID: DOMAIN_ACCOUNT_ID, accountID: MEMBER_ACCOUNT_ID},
};
// The screen does not read navigation; this inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as DomainMemberDetailsPageProps['navigation'];

function pressVacationDelegateRow() {
    render(
        <DomainMemberDetailsPage
            route={route}
            navigation={navigation}
        />,
    );
    jest.mocked(VacationDelegateMenuItem).mock.lastCall?.[0].onPress?.();
}

function pressCloseAccountButton() {
    render(
        <DomainMemberDetailsPage
            route={route}
            navigation={navigation}
        />,
    );
    const avatarButton = jest.mocked(BaseDomainMemberDetailsComponent).mock.lastCall?.[0].avatarButton;
    if (React.isValidElement<{onPress?: () => void}>(avatarButton)) {
        avatarButton.props.onPress?.();
    }
}

describe('DomainMemberDetailsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDomain = undefined;
    });

    it('opens the vacation delegate form when the member has no delegate', () => {
        // Given a member with no vacation delegate
        // When the admin presses the member's vacation delegate row
        pressVacationDelegateRow();

        // Then the form opens, not the member picker, so the clear after date is set in the same place as the delegate
        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.DOMAIN_VACATION_DELEGATE.getRoute(DOMAIN_ACCOUNT_ID, MEMBER_ACCOUNT_ID));
    });

    it('opens the vacation delegate form when the member already has a delegate', () => {
        // Given a member with a saved vacation delegate
        mockDomain = {[`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${MEMBER_ACCOUNT_ID}`]: {creator: 'admin@example.com', delegate: 'delegate@example.com'}};

        // When the admin presses the member's vacation delegate row
        pressVacationDelegateRow();

        // Then the same form opens with a fresh draft, so the saved delegate, date and time are shown rather than a stale pick
        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.DOMAIN_VACATION_DELEGATE.getRoute(DOMAIN_ACCOUNT_ID, MEMBER_ACCOUNT_ID));
    });

    describe('close account', () => {
        beforeEach(() => {
            mockDomain = {[SECURITY_GROUP_KEY]: {shared: {[MEMBER_ACCOUNT_ID]: 'read'}}};
        });

        it('does nothing when the close account choice is dismissed', async () => {
            // Given the admin dismisses the close account choice with the backdrop, Escape, or Back
            mockShowDecisionModal.mockResolvedValueOnce({action: ModalActions.DISMISS});

            // When the admin presses the close account button
            pressCloseAccountButton();

            // Then the choice is shown, but no confirmation follows, so the admin is not caught in a loop of modals
            await waitFor(() => expect(mockShowDecisionModal).toHaveBeenCalledTimes(1));
            expect(mockShowDecisionModal).toHaveBeenCalledWith(expect.objectContaining({shouldReportDismiss: true}));
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            expect(closeUserAccount).not.toHaveBeenCalled();
        });

        it('safely closes the account after the admin confirms a safe close', async () => {
            // Given the admin picks the safe close option and then confirms
            mockShowDecisionModal.mockResolvedValueOnce({action: ModalActions.CLOSE});
            mockShowConfirmModal.mockResolvedValueOnce({action: ModalActions.CONFIRM});

            // When the admin presses the close account button
            pressCloseAccountButton();

            // Then the account is closed without forcing it, and the member page is dismissed
            await waitFor(() => expect(closeUserAccount).toHaveBeenCalledTimes(1));
            expect(jest.mocked(closeUserAccount).mock.lastCall?.at(-1)).toBe(false);
            expect(Navigation.dismissModal).toHaveBeenCalled();
        });

        it('force closes the account after the admin confirms a force close', async () => {
            // Given the admin picks the force close option and then confirms
            mockShowDecisionModal.mockResolvedValueOnce({action: ModalActions.CONFIRM});
            mockShowConfirmModal.mockResolvedValueOnce({action: ModalActions.CONFIRM});

            // When the admin presses the close account button
            pressCloseAccountButton();

            // Then the account is force closed
            await waitFor(() => expect(closeUserAccount).toHaveBeenCalledTimes(1));
            expect(jest.mocked(closeUserAccount).mock.lastCall?.at(-1)).toBe(true);
        });

        it('returns to the close account choice when the confirmation is cancelled', async () => {
            // Given the admin picks safe close, cancels the confirmation, and then dismisses the reopened choice
            mockShowDecisionModal.mockResolvedValueOnce({action: ModalActions.CLOSE}).mockResolvedValueOnce({action: ModalActions.DISMISS});
            mockShowConfirmModal.mockResolvedValueOnce({action: ModalActions.CLOSE});

            // When the admin presses the close account button
            pressCloseAccountButton();

            // Then the close account choice is shown again and the account stays open
            await waitFor(() => expect(mockShowDecisionModal).toHaveBeenCalledTimes(2));
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(closeUserAccount).not.toHaveBeenCalled();
        });
    });
});
