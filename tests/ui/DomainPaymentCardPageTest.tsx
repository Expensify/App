import {act, render, screen} from '@testing-library/react-native';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainPaymentCardPage from '@pages/domain/Admins/DomainPaymentCardPage';

import {setPrimaryContact, toggleConsolidatedDomainBilling} from '@userActions/Domain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {PropsWithChildren, ReactNode} from 'react';
import type ReactNative from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type PaymentCardFlow = ValueOf<typeof CONST.DOMAIN.PAYMENT_CARD_FLOW>;

const DOMAIN_ACCOUNT_ID = 424242;
const DOMAIN_NAME = 'acme.com';
const DOMAIN_KEY = `${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}` as const;
const DOMAIN_MEMBER_KEY = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DOMAIN_ACCOUNT_ID}` as const;
const PRIMARY_CONTACT_EMAIL = 'owner@acme.com';
const CURRENT_USER_EMAIL = 'admin@acme.com';

let mockBackPath = '';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useIsFocused: () => true,
    useFocusEffect: jest.fn(),
}));
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn((suffix: string, basePath?: string) => `${basePath}/${suffix}`));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => mockBackPath));
jest.mock('@hooks/useNavigateToCardAuthenticationOnLink', () => jest.fn());
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: CURRENT_USER_EMAIL})));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@pages/domain/DomainNotFoundPageWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/DelegateNoAccessWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/HeaderWithBackButton', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({title}: {title: string}) => ReactMock.createElement(Text, null, title);
});
jest.mock('@components/AddPaymentCard/SubscriptionPaymentCardForm', () => ({headerText}: {headerText: string}) => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ReactMock.createElement(Text, null, headerText) as ReactNode;
});
jest.mock('@userActions/Domain', () => ({setPrimaryContact: jest.fn(), toggleConsolidatedDomainBilling: jest.fn()}));
jest.mock('@userActions/PaymentMethods', () => ({addSubscriptionPaymentCard: jest.fn(), clearPaymentCardFormErrorAndSubmit: jest.fn()}));

type DomainPaymentCardPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.DYNAMIC_PAYMENT_CARD>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The page never reads the navigation prop when rendered outside a navigator.
const navigation = {} as DomainPaymentCardPageProps['navigation'];

async function renderPage(flow: PaymentCardFlow, entryPath: string, isBillingOn: boolean) {
    mockBackPath = entryPath;
    await act(async () => {
        await Onyx.merge(DOMAIN_KEY, {accountID: DOMAIN_ACCOUNT_ID, email: `+@${DOMAIN_NAME}`});
        await Onyx.merge(DOMAIN_MEMBER_KEY, {settings: {technicalContactEmail: PRIMARY_CONTACT_EMAIL, useTechnicalContactBillingCard: isBillingOn}});
    });
    render(
        <DomainPaymentCardPage
            route={{key: 'domain-payment-card', name: SCREENS.DOMAIN.DYNAMIC_PAYMENT_CARD, params: {domainAccountID: DOMAIN_ACCOUNT_ID, flow}}}
            navigation={navigation}
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

async function setCardSetupComplete(setupComplete: boolean) {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM, {setupComplete});
    });
    await waitForBatchedUpdatesWithAct();
}

describe('DomainPaymentCardPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('makes the admin the primary contact only after their card setup finishes', async () => {
        // Given an admin who picked themselves as primary contact while billing is on
        const entryPath = ROUTES.DOMAIN_ADD_PRIMARY_CONTACT.getRoute(DOMAIN_ACCOUNT_ID);
        await renderPage(CONST.DOMAIN.PAYMENT_CARD_FLOW.PRIMARY_CONTACT, entryPath, true);

        // Then the page asks for a card to become the primary contact
        expect(screen.getByText('domain.admins.addPrimaryContact')).toBeOnTheScreen();
        expect(screen.getByText('domain.admins.primaryContactPaymentCardTitle')).toBeOnTheScreen();

        // When the card is saved but its setup has not finished
        await setCardSetupComplete(false);

        // Then the primary contact stays the same
        expect(setPrimaryContact).not.toHaveBeenCalled();

        // When the card setup finishes
        await setCardSetupComplete(true);

        // Then the admin becomes the primary contact and the success page replaces the card page
        expect(setPrimaryContact).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, CURRENT_USER_EMAIL, PRIMARY_CONTACT_EMAIL);
        expect(Navigation.navigate).toHaveBeenCalledWith(`${entryPath}/${DYNAMIC_ROUTES.DOMAIN_PAYMENT_CARD_SUCCESS.getRoute(CONST.DOMAIN.PAYMENT_CARD_FLOW.PRIMARY_CONTACT)}`, {
            forceReplace: true,
        });
        expect(toggleConsolidatedDomainBilling).not.toHaveBeenCalled();
    });

    it('turns consolidated domain billing on only after the card setup finishes', async () => {
        // Given a primary contact who turned on the billing switch while billing is off
        const entryPath = ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(DOMAIN_ACCOUNT_ID);
        await renderPage(CONST.DOMAIN.PAYMENT_CARD_FLOW.CONSOLIDATED_BILLING, entryPath, false);

        // Then the page asks for a card to turn on consolidated domain billing
        expect(screen.getByText('domain.admins.consolidatedDomainBilling')).toBeOnTheScreen();
        expect(screen.getByText('domain.admins.consolidatedBillingPaymentCardTitle')).toBeOnTheScreen();
        expect(toggleConsolidatedDomainBilling).not.toHaveBeenCalled();

        // When the card setup finishes
        await setCardSetupComplete(true);

        // Then billing turns on and the success page replaces the card page
        expect(toggleConsolidatedDomainBilling).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, DOMAIN_NAME, true);
        expect(Navigation.navigate).toHaveBeenCalledWith(`${entryPath}/${DYNAMIC_ROUTES.DOMAIN_PAYMENT_CARD_SUCCESS.getRoute(CONST.DOMAIN.PAYMENT_CARD_FLOW.CONSOLIDATED_BILLING)}`, {
            forceReplace: true,
        });
        expect(setPrimaryContact).not.toHaveBeenCalled();
    });
});
