import {act, render} from '@testing-library/react-native';

import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import VacationDelegateMenuItem from '@components/VacationDelegateMenuItem';

import useConfirmModal from '@hooks/useConfirmModal';
import useNetwork from '@hooks/useNetwork';

import {revokeDomainMemberSessions} from '@libs/actions/Domain';
import {clearDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import DomainMemberDetailsPage from '@pages/domain/Members/DomainMemberDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Domain} from '@src/types/onyx';

import type {PropsWithChildren} from 'react';

import React from 'react';

const DOMAIN_ACCOUNT_ID = 1;
const MEMBER_ACCOUNT_ID = 2;
const mockOnyxKeys = ONYXKEYS;

let mockDomain: Domain;

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
}));

jest.mock('@libs/actions/FormActions', () => ({
    clearDraftValues: jest.fn(),
}));
jest.mock('@libs/actions/Domain', () => ({revokeDomainMemberSessions: jest.fn(() => Promise.resolve(true))}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 3}));
jest.mock('@pages/ErrorPage/NotFoundPage', () => () => null);
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

// Renders only the page's own rows, so the test can reach the vacation delegate row without the member header and its data
jest.mock('@pages/domain/BaseDomainMemberDetailsComponent', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/OfflineWithFeedback', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/VacationDelegateMenuItem', () => jest.fn(() => null));
jest.mock('@components/MenuItem/presets/MenuItemField', () => jest.fn(() => null));
jest.mock('@components/MenuItem/presets/MenuItemAction', () => jest.fn(() => null));
jest.mock('@components/DecisionModal', () => jest.fn(() => null));
jest.mock('@components/MenuItem', () => ({__esModule: true, default: new Proxy({}, {get: () => () => null})}));
jest.mock('@components/Button', () => ({__esModule: true, default: new Proxy({}, {get: () => () => null})}));

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: jest.fn(() => ({}))}));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn()})));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: false})));
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetail: jest.fn(() => [{accountID: 2, login: 'member@example.com'}])}));
// Apply real domain selectors to one fixture for the page and its admin wrapper.
jest.mock('@hooks/useOnyx', () =>
    jest.fn((key: string, options?: {selector?: (value: unknown) => unknown}) => {
        const values: Record<string, unknown> = {
            [`${mockOnyxKeys.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`]: mockDomain,
            [mockOnyxKeys.SESSION]: {accountID: 3},
        };
        const value = values[key];
        return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
    }),
);

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

describe('DomainMemberDetailsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDomain = {
            accountID: DOMAIN_ACCOUNT_ID,
            email: 'expensify@example.com',
            validated: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention -- This is the server-owned Onyx field name.
            domain_defaultSecurityGroupID: '1',
            [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}3`]: 3,
            [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {name: 'Members', shared: {[MEMBER_ACCOUNT_ID]: 'read'}},
        };
        jest.mocked(revokeDomainMemberSessions).mockResolvedValue(true);
        jest.mocked(useNetwork).mockReturnValue({isOffline: false, lastOfflineAt: undefined});
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
        mockDomain[`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${MEMBER_ACCOUNT_ID}`] = {creator: 'admin@example.com', delegate: 'delegate@example.com'};

        // When the admin presses the member's vacation delegate row
        pressVacationDelegateRow();

        // Then the same form opens with a fresh draft, so the saved delegate, date and time are shown rather than a stale pick
        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.DOMAIN_VACATION_DELEGATE.getRoute(DOMAIN_ACCOUNT_ID, MEMBER_ACCOUNT_ID));
    });

    function renderWithAdminGate() {
        return render(
            <DomainNotFoundPageWrapper domainAccountID={DOMAIN_ACCOUNT_ID}>
                <DomainMemberDetailsPage
                    route={route}
                    navigation={navigation}
                />
            </DomainNotFoundPageWrapper>,
        );
    }

    function getRevokeRow() {
        return jest
            .mocked(MenuItemAction)
            .mock.calls.map(([props]) => props)
            .findLast((props) => props.title === 'domain.members.sessionRevocation.revoke');
    }

    it.each(['unverified', 'non-admin', 'foreign target'] as const)('does not expose revocation on a %s deep link', (scenario) => {
        // Given a direct member route without the required domain authorization or membership
        if (scenario === 'unverified') {
            mockDomain.validated = false;
        } else if (scenario === 'non-admin') {
            delete mockDomain[`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}3`];
        } else {
            delete mockDomain[`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`];
        }

        // When the real admin wrapper and member page render
        renderWithAdminGate();

        // Then no revocation control is exposed and no write is made
        expect(getRevokeRow()).toBeUndefined();
        expect(revokeDomainMemberSessions).not.toHaveBeenCalled();
    });

    it.each([ModalActions.CONFIRM, ModalActions.CLOSE])('requires explicit confirmation before targeting the account (%s)', async (action) => {
        // Given a verified-domain admin viewing a real member
        const showConfirmModal = jest.fn().mockResolvedValue({action});
        jest.mocked(useConfirmModal).mockReturnValue({...useConfirmModal(), showConfirmModal});
        renderWithAdminGate();

        // When the admin uses the security control and confirms or cancels
        await act(async () => getRevokeRow()?.onPress(new KeyboardEvent('click')));

        // Then only confirmation targets the account ID, with offline submission disabled
        expect(showConfirmModal).toHaveBeenCalledWith(expect.objectContaining({shouldDisableConfirmButtonWhenOffline: true}));
        if (action === ModalActions.CONFIRM) {
            expect(revokeDomainMemberSessions).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, MEMBER_ACCOUNT_ID);
        } else {
            expect(revokeDomainMemberSessions).not.toHaveBeenCalled();
        }
    });

    it('disables revocation while offline', () => {
        // Given an offline device
        jest.mocked(useNetwork).mockReturnValue({isOffline: true, lastOfflineAt: undefined});

        // When the member security controls render
        renderWithAdminGate();

        // Then a second submission is disabled
        expect(getRevokeRow()?.isDisabled).toBe(true);
    });

    it('disables revocation only while the member request is pending', async () => {
        // Given a member request that has not completed
        const pending = Promise.withResolvers<boolean>();
        jest.mocked(revokeDomainMemberSessions).mockReturnValue(pending.promise);
        jest.mocked(useConfirmModal).mockReturnValue({...useConfirmModal(), showConfirmModal: jest.fn().mockResolvedValue({action: ModalActions.CONFIRM})});
        renderWithAdminGate();

        // When the admin confirms, then the request finishes
        await act(async () => {
            getRevokeRow()?.onPress(new KeyboardEvent('click'));
        });
        expect(getRevokeRow()?.isDisabled).toBe(true);
        await act(async () => pending.resolve(true));

        // Then the action is enabled again without leaving persisted pending state behind
        expect(getRevokeRow()?.isDisabled).toBe(false);
    });
});
