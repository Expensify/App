import {act, render} from '@testing-library/react-native';

import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useNetwork from '@hooks/useNetwork';

import {revokeAllDomainMemberSessions} from '@libs/actions/Domain';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@libs/Navigation/types';

import BaseDomainMembersPage from '@pages/domain/BaseDomainMembersPage';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import DomainMembersPage from '@pages/domain/Members/DomainMembersPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Domain} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';

let mockDomain: Domain;
const mockOnyxKeys = ONYXKEYS;
const mockMemberAccountID = 2;
const mockShowConfirmModal = jest.fn();
jest.mock('@libs/actions/Domain', () => ({revokeAllDomainMemberSessions: jest.fn(() => Promise.resolve())}));
jest.mock('@libs/Navigation/Navigation', () => ({dismissModal: jest.fn(), goBack: jest.fn()}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 3}));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (value: string) => value}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({}), useMemoizedLazyIllustrations: () => ({})}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));
jest.mock('@hooks/useDomainDocumentTitle', () => () => {});
jest.mock('@hooks/useSearchBackPress', () => () => {});
jest.mock('@hooks/useCleanupSelectedOptions', () => () => {});
jest.mock('@hooks/useClearSelectedDomainMembersOnMoveComplete', () => () => {});
jest.mock('@hooks/useMobileSelectionMode', () => () => false);
jest.mock('@hooks/useShouldDisplayButtonsInSeparateLine', () => () => false);
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: mockShowConfirmModal})));
jest.mock('@hooks/useDomainGroupFilter', () => () => ({isItemInFilter: () => false, groups: []}));
jest.mock('@hooks/usePersonalDetails', () => ({useAllPersonalDetails: () => [{[mockMemberAccountID]: {accountID: mockMemberAccountID, login: 'member@example.com'}}]}));
jest.mock('@hooks/useOnyx', () =>
    jest.fn((key: string, options?: {selector?: (value: unknown) => unknown}) => {
        const values: Record<string, unknown> = {[`${mockOnyxKeys.COLLECTION.DOMAIN}1`]: mockDomain, [mockOnyxKeys.SESSION]: {accountID: 3}};
        const value = values[key];
        return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
    }),
);
jest.mock('@pages/domain/BaseDomainMembersPage', () => jest.fn(({headerContent}: {headerContent: ReactNode}) => headerContent));
jest.mock('@pages/ErrorPage/NotFoundPage', () => () => null);
jest.mock('@components/ButtonWithDropdownMenu', () => jest.fn(() => null));
jest.mock('@components/DecisionModal', () => () => null);
jest.mock('@components/Button', () => ({__esModule: true, default: Object.assign(() => null, {Text: () => null, Icon: () => null})}));
jest.mock('@components/ScreenWrapper', () => () => null);

type Props = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS>;
const route: Props['route'] = {key: 'members', name: SCREENS.DOMAIN.MEMBERS, params: {domainAccountID: 1}};
// The screen does not use the navigator prop in these interactions.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as Props['navigation'];

function renderPage() {
    return render(
        <DomainNotFoundPageWrapper domainAccountID={1}>
            <DomainMembersPage
                route={route}
                navigation={navigation}
            />
        </DomainNotFoundPageWrapper>,
    );
}

function getRevokeOption() {
    return jest
        .mocked(ButtonWithDropdownMenu)
        .mock.calls.findLast(([props]) => props.customText === 'common.more')?.[0]
        .options.find((option) => option.value === CONST.DOMAIN.MEMBERS.SECONDARY_ACTIONS.REVOKE_SESSIONS);
}

describe('Domain members revocation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useNetwork).mockReturnValue({isOffline: false, lastOfflineAt: undefined});
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
        mockDomain = {
            accountID: 1,
            email: 'expensify@example.com',
            validated: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention -- This is the server-owned Onyx field name.
            domain_defaultSecurityGroupID: '1',
            [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}3`]: 3,
            [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {name: 'Members', shared: {[mockMemberAccountID]: 'read'}},
        };
    });

    it('keeps the whole-domain action in More when filters and selection are active', async () => {
        // Given a filtered members table with a selected member
        renderPage();
        act(() => jest.mocked(BaseDomainMembersPage).mock.lastCall?.[0].setSelectedMembers?.(['2']));

        // When the domain-wide More action is confirmed
        await act(async () => getRevokeOption()?.onSelected?.());

        // Then its only scope parameter is the domain, never the selected or visible members
        expect(revokeAllDomainMemberSessions).toHaveBeenCalledWith(1);
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({prompt: 'domain.members.sessionRevocation.allPrompt', shouldDisableConfirmButtonWhenOffline: true}));
        const subsetOptions = jest.mocked(ButtonWithDropdownMenu).mock.calls.find(([props]) => props.customText === 'workspace.common.selected')?.[0].options;
        expect(subsetOptions?.some((option) => option.value === CONST.DOMAIN.MEMBERS.SECONDARY_ACTIONS.REVOKE_SESSIONS)).toBe(false);
    });

    it('does not submit after cancellation', async () => {
        // Given a verified-domain administrator who cancels confirmation
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
        renderPage();

        // When the domain-wide action is canceled
        await act(async () => getRevokeOption()?.onSelected?.());

        // Then no job is started
        expect(revokeAllDomainMemberSessions).not.toHaveBeenCalled();
        expect(useConfirmModal).toHaveBeenCalled();
    });

    it.each(['non-admin', 'unverified', 'offline'] as const)('blocks domain revocation when %s', async (scenario) => {
        // Given an unavailable or unauthorized domain-wide action
        if (scenario === 'non-admin') {
            delete mockDomain[`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}3`];
        } else if (scenario === 'unverified') {
            mockDomain.validated = false;
        } else {
            jest.mocked(useNetwork).mockReturnValue({isOffline: true, lastOfflineAt: undefined});
        }

        // When the real admin wrapper renders the members page
        renderPage();
        await act(async () => getRevokeOption()?.onSelected?.());

        // Then neither confirmation nor submission is allowed
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(revokeAllDomainMemberSessions).not.toHaveBeenCalled();
        if (scenario === 'offline') {
            expect(getRevokeOption()?.disabled).toBe(true);
        }
    });
});
