import {act, render} from '@testing-library/react-native';

import type * as UseRunWithPaymentCardModule from '@hooks/useRunWithPaymentCard';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainAddPrimaryContactPage from '@pages/domain/Admins/DomainAddPrimaryContactPage';

import {setPrimaryContact} from '@userActions/Domain';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type AdminRow = {login: string; accountID: number};

const DOMAIN_ACCOUNT_ID = 424242;
const DOMAIN_MEMBER_KEY = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DOMAIN_ACCOUNT_ID}` as const;
const PRIMARY_CONTACT_EMAIL = 'owner@acme.com';
const CURRENT_USER: AdminRow = {login: 'admin@acme.com', accountID: 1};

let mockSelectRow: ((option: AdminRow) => void) | undefined;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useIsFocused: () => true,
    useFocusEffect: jest.fn(),
}));
// The add payment card flow is web-only, and Jest resolves the native variant by default.
jest.mock('@hooks/useRunWithPaymentCard', () => jest.requireActual<typeof UseRunWithPaymentCardModule>('@hooks/useRunWithPaymentCard/index.ts'));
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn((suffix: string) => suffix));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1})));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (phone: string) => phone, localeCompare: (a: string, b: string) => a.localeCompare(b)}));
jest.mock('@hooks/usePersonalDetails', () => ({useAllPersonalDetails: () => [undefined]}));
jest.mock('@pages/domain/DomainNotFoundPageWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/SelectionList', () =>
    jest.fn(({onSelectRow}: {onSelectRow: (option: AdminRow) => void}) => {
        mockSelectRow = onSelectRow;
        return null;
    }),
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

async function renderPageAndSelectCurrentUser(isBillingOn: boolean) {
    await act(async () => {
        await Onyx.merge(DOMAIN_MEMBER_KEY, {settings: {technicalContactEmail: PRIMARY_CONTACT_EMAIL, useTechnicalContactBillingCard: isBillingOn}});
    });
    render(
        <DomainAddPrimaryContactPage
            route={route}
            navigation={navigation}
        />,
    );
    await waitForBatchedUpdatesWithAct();
    act(() => mockSelectRow?.(CURRENT_USER));
}

describe('DomainAddPrimaryContactPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockSelectRow = undefined;
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('asks an admin without a payment card to add one before taking over as primary contact while billing is on', async () => {
        // Given consolidated billing that is on, viewed by an admin without a payment card
        // When the admin picks themselves as primary contact
        await renderPageAndSelectCurrentUser(true);

        // Then the add payment card flow opens and the primary contact stays the same until a card is added
        expect(Navigation.navigate).toHaveBeenCalledWith(DYNAMIC_ROUTES.ADD_PAYMENT_CARD.path);
        expect(setPrimaryContact).not.toHaveBeenCalled();
    });

    it('makes an admin without a payment card the primary contact right away while billing is off', async () => {
        // Given consolidated billing that is off, viewed by an admin without a payment card
        // When the admin picks themselves as primary contact
        await renderPageAndSelectCurrentUser(false);

        // Then the admin becomes the primary contact without adding a card
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(setPrimaryContact).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, CURRENT_USER.login, PRIMARY_CONTACT_EMAIL);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(DOMAIN_ACCOUNT_ID));
    });
});
