import {act, render, screen} from '@testing-library/react-native';

import type * as UseRunWithPaymentCardModule from '@hooks/useRunWithPaymentCard';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainAddPrimaryContactPage from '@pages/domain/Admins/DomainAddPrimaryContactPage';

import {setPrimaryContact} from '@userActions/Domain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {PropsWithChildren, ReactNode} from 'react';
import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as ConfirmModalMock from '../utils/mockUseConfirmModal';

import {mockShowConfirmModal, resetMockConfirmModal} from '../utils/mockUseConfirmModal';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type AdminRow = {login: string; accountID: number; isSelected?: boolean};

const DOMAIN_ACCOUNT_ID = 424242;
const DOMAIN_KEY = `${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}` as const;
const DOMAIN_MEMBER_KEY = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DOMAIN_ACCOUNT_ID}` as const;
const PRIMARY_CONTACT_EMAIL = 'owner@acme.com';
const CURRENT_USER_ACCOUNT_ID = 1;
const PRIMARY_CONTACT_ACCOUNT_ID = 2;
const CURRENT_USER: AdminRow = {login: 'admin@acme.com', accountID: CURRENT_USER_ACCOUNT_ID};
const PRIMARY_CONTACT: AdminRow = {login: PRIMARY_CONTACT_EMAIL, accountID: PRIMARY_CONTACT_ACCOUNT_ID};
const CURRENT_USER_ADMIN_KEY = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${CURRENT_USER_ACCOUNT_ID}` as const;
const PRIMARY_CONTACT_ADMIN_KEY = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${PRIMARY_CONTACT_ACCOUNT_ID}` as const;
const BILLING_ON_NOTE = 'domain.admins.primaryContactConsolidatedBillingMessage';
const BILLING_FUND_ID = 1234;

const mockPersonalDetails: PersonalDetailsList = {
    [CURRENT_USER.accountID]: CURRENT_USER,
    [PRIMARY_CONTACT.accountID]: PRIMARY_CONTACT,
};

let mockSelectRow: ((option: AdminRow) => void) | undefined;
let mockListProps: {data: AdminRow[]; shouldShowTextInput?: boolean} | undefined;
let mockIsNativeApp = false;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useIsFocused: () => true,
    useFocusEffect: jest.fn(),
}));
// Jest resolves the native variant by default, so each test picks the platform whose payment card step it checks.
jest.mock('@hooks/useRunWithPaymentCard', () => {
    const {default: useRunWithPaymentCardOnWeb} = jest.requireActual<typeof UseRunWithPaymentCardModule>('@hooks/useRunWithPaymentCard/index.ts');
    const {default: useRunWithPaymentCardOnNative} = jest.requireActual<typeof UseRunWithPaymentCardModule>('@hooks/useRunWithPaymentCard/index.native.ts');
    function useRunWithPaymentCardForPlatform() {
        const paymentCardOnWeb = useRunWithPaymentCardOnWeb();
        const paymentCardOnNative = useRunWithPaymentCardOnNative();
        return mockIsNativeApp ? paymentCardOnNative : paymentCardOnWeb;
    }
    return {__esModule: true, default: useRunWithPaymentCardForPlatform};
});
jest.mock('@hooks/useConfirmModal', () => jest.requireActual<typeof ConfirmModalMock>('../utils/mockUseConfirmModal').default);
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn((suffix: string) => suffix));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1})));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (phone: string) => phone, localeCompare: (a: string, b: string) => a.localeCompare(b)}));
jest.mock('@hooks/usePersonalDetails', () => ({
    useAllPersonalDetails: (selector: (personalDetails: PersonalDetailsList) => PersonalDetailsList | undefined) => [selector(mockPersonalDetails)],
}));
jest.mock('@pages/domain/DomainNotFoundPageWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({html}: {html: string}) => ReactMock.createElement(Text, null, html);
});
jest.mock('@components/SelectionList', () =>
    jest.fn(
        ({
            onSelectRow,
            customListHeaderContent,
            ...listProps
        }: {
            onSelectRow: (option: AdminRow) => void;
            customListHeaderContent?: ReactNode;
            data: AdminRow[];
            shouldShowTextInput?: boolean;
        }) => {
            mockSelectRow = onSelectRow;
            mockListProps = listProps;
            return customListHeaderContent ?? null;
        },
    ),
);
jest.mock('@userActions/Domain', () => ({setPrimaryContact: jest.fn()}));

type DomainAddPrimaryContactPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADD_PRIMARY_CONTACT>;

const route: DomainAddPrimaryContactPageProps['route'] = {
    key: 'domain-add-primary-contact',
    name: SCREENS.DOMAIN.ADD_PRIMARY_CONTACT,
    params: {domainAccountID: DOMAIN_ACCOUNT_ID},
};
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The page never reads the navigation prop when rendered outside a navigator.
const navigation = {} as DomainAddPrimaryContactPageProps['navigation'];

async function renderPage(isBillingOn: boolean, technicalContactEmail = PRIMARY_CONTACT_EMAIL) {
    await act(async () => {
        await Onyx.merge(DOMAIN_KEY, {
            [CURRENT_USER_ADMIN_KEY]: CURRENT_USER_ACCOUNT_ID,
            [PRIMARY_CONTACT_ADMIN_KEY]: PRIMARY_CONTACT_ACCOUNT_ID,
        });
        await Onyx.merge(DOMAIN_MEMBER_KEY, {settings: {technicalContactEmail, useTechnicalContactBillingCard: isBillingOn}});
    });
    render(
        <DomainAddPrimaryContactPage
            route={route}
            navigation={navigation}
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

async function renderPageAndSelectCurrentUser(isBillingOn: boolean) {
    await renderPage(isBillingOn);
    act(() => mockSelectRow?.(CURRENT_USER));
}

describe('DomainAddPrimaryContactPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockSelectRow = undefined;
        mockListProps = undefined;
        mockIsNativeApp = false;
        resetMockConfirmModal();
    });

    it('lists only the current user, without search, and explains why while billing is on', async () => {
        // Given consolidated billing that is on and another admin as primary contact.
        // When an admin opens the primary contact picker.
        await renderPage(true);

        // Then the list offers only the admin themselves, hides the search, and shows why.
        expect(mockListProps?.data.map((option) => option.login)).toEqual([CURRENT_USER.login]);
        expect(mockListProps?.shouldShowTextInput).toBe(false);
        expect(screen.getByText(BILLING_ON_NOTE)).toBeOnTheScreen();
    });

    it('lists only the current user, checked, and still explains why while billing is on and they are the primary contact', async () => {
        // Given consolidated billing that is on and the current user as primary contact.
        // When they open the primary contact picker.
        await renderPage(true, CURRENT_USER.login);

        // Then the list offers only them, checked, and shows why.
        expect(mockListProps?.data.map((option) => ({login: option.login, isSelected: option.isSelected}))).toEqual([{login: CURRENT_USER.login, isSelected: true}]);
        expect(screen.getByText(BILLING_ON_NOTE)).toBeOnTheScreen();
    });

    it('lists every admin with search and no note while billing is off', async () => {
        // Given consolidated billing that is off.
        // When an admin opens the primary contact picker.
        await renderPage(false);

        // Then every admin can be picked and searched.
        expect(mockListProps?.data.map((option) => option.login).sort()).toEqual([CURRENT_USER.login, PRIMARY_CONTACT.login]);
        expect(mockListProps?.shouldShowTextInput).toBe(true);
        expect(screen.queryByText(BILLING_ON_NOTE)).not.toBeOnTheScreen();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('asks an admin without a payment card to add one before taking over as primary contact while billing is on', async () => {
        // Given consolidated billing that is on, viewed by an admin without a payment card.
        // When the admin picks themselves as primary contact.
        await renderPageAndSelectCurrentUser(true);

        // Then the domain payment card page opens and the primary contact stays the same until a card is added.
        expect(Navigation.navigate).toHaveBeenCalledWith(DYNAMIC_ROUTES.DOMAIN_PAYMENT_CARD.getRoute(CONST.DOMAIN.PAYMENT_CARD_FLOW.PRIMARY_CONTACT));
        expect(setPrimaryContact).not.toHaveBeenCalled();
    });

    it('tells an admin without a payment card in the mobile app to add one on the web before taking over as primary contact while billing is on', async () => {
        // Given consolidated billing that is on, viewed in the mobile app by an admin without a payment card.
        mockIsNativeApp = true;

        // When the admin picks themselves as primary contact.
        await renderPageAndSelectCurrentUser(true);

        // Then a modal explains that a card is needed, and the primary contact stays the same.
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'workspace.distanceRates.oopsNotSoFast',
                prompt: 'domain.admins.primaryContactNoCardMobileMessage',
                confirmText: 'common.buttonConfirm',
                shouldShowCancelButton: false,
            }),
        );
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(setPrimaryContact).not.toHaveBeenCalled();
    });

    it('makes an admin with a payment card in the mobile app the primary contact while billing is on', async () => {
        // Given consolidated billing that is on, viewed in the mobile app by an admin with a payment card.
        mockIsNativeApp = true;
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_BILLING_FUND_ID, BILLING_FUND_ID);
        });

        // When the admin picks themselves as primary contact.
        await renderPageAndSelectCurrentUser(true);

        // Then the admin becomes the primary contact without a modal.
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(setPrimaryContact).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, CURRENT_USER.login, PRIMARY_CONTACT_EMAIL);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(DOMAIN_ACCOUNT_ID));
    });

    it('makes an admin without a payment card the primary contact right away while billing is off', async () => {
        // Given consolidated billing that is off, viewed by an admin without a payment card.
        // When the admin picks themselves as primary contact.
        await renderPageAndSelectCurrentUser(false);

        // Then the admin becomes the primary contact without adding a card.
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(setPrimaryContact).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, CURRENT_USER.login, PRIMARY_CONTACT_EMAIL);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(DOMAIN_ACCOUNT_ID));
    });
});
