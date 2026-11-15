// Covers target-admin invalidation independently of the shared member-details presentation.
import {act, fireEvent, render} from '@testing-library/react-native';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainAdminDetailsPage from '@pages/domain/Admins/DomainAdminDetailsPage';

import {revokeDomainAdminAccess} from '@userActions/Domain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {PressableProps, TextProps} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as ConfirmModalMock from '../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, mockCloseModalByID, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useConfirmModal', () => jest.requireActual<typeof ConfirmModalMock>('../utils/mockUseConfirmModal').default);
jest.mock('@components/Modal/Global/ModalContext', () => jest.requireActual<typeof ConfirmModalMock>('../utils/mockUseConfirmModal').createMockModalContextModule());
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key, formatPhoneNumber: (phone: string) => phone})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetail: () => [{login: 'target@example.com', displayName: 'Target'}]}));
jest.mock('@libs/PersonalDetailsUtils', () => ({temporaryGetDisplayNameOrDefault: () => 'Target'}));
jest.mock('@userActions/Domain', () => ({revokeDomainAdminAccess: jest.fn()}));
jest.mock('@userActions/Session', () => ({callIfAuthenticated: (handler: () => Promise<void>) => handler}));
jest.mock('@navigation/Navigation', () => ({__esModule: true, default: {dismissModal: jest.fn(), navigate: jest.fn(), goBack: jest.fn()}}));
jest.mock('@pages/domain/BaseDomainMemberDetailsComponent', () => {
    const {Text, Pressable} = jest.requireActual<{Text: React.ComponentType<TextProps>; Pressable: React.ComponentType<PressableProps>}>('react-native');
    return {
        __esModule: true,
        default: ({
            shouldBeBlocked,
            children,
            fullPageNotFoundViewProps,
        }: {
            shouldBeBlocked?: boolean;
            children: React.ReactNode;
            fullPageNotFoundViewProps?: {onBackButtonPress?: () => void};
        }) =>
            shouldBeBlocked ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={fullPageNotFoundViewProps?.onBackButtonPress}
                >
                    <Text>Not Found</Text>
                </Pressable>
            ) : (
                children
            ),
    };
});
jest.mock('@components/MenuItem', () => {
    const {Pressable, Text: MockText} = jest.requireActual<{Pressable: React.ComponentType<PressableProps>; Text: React.ComponentType<TextProps>}>('react-native');
    const Container = ({children}: {children: React.ReactNode}) => children;
    return {
        __esModule: true,
        default: {
            Root: ({onPress, children}: {onPress: () => void; children: React.ReactNode}) => (
                <Pressable
                    accessibilityRole="button"
                    onPress={onPress}
                >
                    {children}
                </Pressable>
            ),
            Row: Container,
            Leading: Container,
            Icon: () => null,
            Content: Container,
            Title: MockText,
        },
    };
});
jest.mock('@components/MenuItem/presets/MenuItemAction', () => {
    const {Text} = jest.requireActual<{Text: React.ComponentType<TextProps>}>('react-native');
    return {__esModule: true, default: () => <Text>Reset domain</Text>};
});

const DOMAIN_ACCOUNT_ID = 100;
const TARGET_ACCOUNT_ID = 300;
const DOMAIN_KEY = `${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}` as const;
const TARGET_PERMISSION_KEY = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}2` as const;
const VIEWER_PERMISSION_KEY = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0` as const;
const OTHER_PERMISSION_KEY = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}1` as const;
const pageProps = {
    route: {key: 'admin-details', name: SCREENS.DOMAIN.ADMIN_DETAILS, params: {domainAccountID: DOMAIN_ACCOUNT_ID, accountID: TARGET_ACCOUNT_ID}},
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- This page never reads the navigator prop when rendered outside a navigator.
    navigation: {} as PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMIN_DETAILS>['navigation'],
};

describe('DomainAdminDetailsPage target membership', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        resetMockConfirmModal();
        await Onyx.clear();
        await Onyx.set(DOMAIN_KEY, {
            [VIEWER_PERMISSION_KEY]: 100,
            [OTHER_PERMISSION_KEY]: 200,
            [TARGET_PERMISSION_KEY]: TARGET_ACCOUNT_ID,
        });
        await waitForBatchedUpdates();
    });

    it('blocks an open details page when the target loses admin access', async () => {
        // Given the target is currently an admin and their page is open
        const screen = render(<DomainAdminDetailsPage {...pageProps} />);
        await screen.findByText('domain.admins.revokeAdminAccess');

        // When another session removes the target's permission
        await act(async () => {
            await Onyx.merge(DOMAIN_KEY, {[TARGET_PERMISSION_KEY]: null});
            await waitForBatchedUpdates();
        });

        // Then the page requests Not Found and no stale action remains available
        expect(screen.getByText('Not Found')).toBeTruthy();
        expect(screen.queryByText('domain.admins.revokeAdminAccess')).toBeNull();
        expect(revokeDomainAdminAccess).not.toHaveBeenCalled();
        fireEvent.press(screen.getByText('Not Found'));
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.DOMAIN_ADMINS.getRoute(DOMAIN_ACCOUNT_ID));
    });

    it('blocks a direct link to an account that is no longer an admin', async () => {
        // Given membership was already removed before opening the route
        await Onyx.merge(DOMAIN_KEY, {[TARGET_PERMISSION_KEY]: null});
        await waitForBatchedUpdates();

        // When the old admin-details route is opened
        const screen = render(<DomainAdminDetailsPage {...pageProps} />);

        // Then retained personal details do not grant access to admin actions
        expect(await screen.findByText('Not Found')).toBeTruthy();
        expect(screen.queryByText('Reset domain')).toBeNull();
        fireEvent.press(screen.getByText('Not Found'));
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.DOMAIN_ADMINS.getRoute(DOMAIN_ACCOUNT_ID));
    });

    it('closes only its own confirmation when target membership disappears', async () => {
        // Given the revoke confirmation is open
        const screen = render(<DomainAdminDetailsPage {...pageProps} />);
        await screen.findByText('domain.admins.revokeAdminAccess');
        fireEvent.press(screen.getByText('domain.admins.revokeAdminAccess'));
        const modalID = getShowConfirmModalOption('id');
        expect(modalID).toBeDefined();

        // When the target is removed while the confirmation is still pending
        await act(async () => {
            await Onyx.merge(DOMAIN_KEY, {[TARGET_PERMISSION_KEY]: null});
            await waitForBatchedUpdates();
        });

        // Then the named confirmation is closed without submitting or navigating
        expect(mockCloseModalByID).toHaveBeenCalledWith(modalID);
        await act(async () => {
            resolveShowConfirmModal();
            await waitForBatchedUpdates();
        });
        expect(revokeDomainAdminAccess).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('preserves normal confirmed revocation', async () => {
        // Given a target who still has admin access
        const screen = render(<DomainAdminDetailsPage {...pageProps} />);
        await screen.findByText('domain.admins.revokeAdminAccess');
        fireEvent.press(screen.getByText('domain.admins.revokeAdminAccess'));

        // When the user confirms removal
        await act(async () => {
            resolveShowConfirmModal();
            await waitForBatchedUpdates();
        });

        // Then exactly one revoke is submitted and the details modal dismisses
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(revokeDomainAdminAccess).toHaveBeenCalledTimes(1);
        expect(revokeDomainAdminAccess).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, TARGET_ACCOUNT_ID);
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
    });
});
