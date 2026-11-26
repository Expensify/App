import {act, fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainPaymentCardSuccessPage from '@pages/domain/Admins/DomainPaymentCardSuccessPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {PropsWithChildren} from 'react';
import type ReactNative from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type PaymentCardFlow = ValueOf<typeof CONST.DOMAIN.PAYMENT_CARD_FLOW>;

const DOMAIN_ACCOUNT_ID = 424242;
const DOMAIN_NAME = 'acme.com';
const DOMAIN_KEY = `${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}` as const;

jest.mock('@navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string, ...params: string[]) => [key, ...params].join(':')}));
jest.mock('@pages/domain/DomainNotFoundPageWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/ConfirmationPage/primitives/ConfirmationPageIllustration', () => () => null);
jest.mock('@components/HeaderWithBackButton', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({title}: {title: string}) => ReactMock.createElement(Text, null, title);
});
jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({html}: {html: string}) => ReactMock.createElement(Text, null, html);
});

type DomainPaymentCardSuccessPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.DYNAMIC_PAYMENT_CARD_SUCCESS>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The page never reads the navigation prop when rendered outside a navigator.
const navigation = {} as DomainPaymentCardSuccessPageProps['navigation'];

async function renderPage(flow: PaymentCardFlow) {
    await act(async () => {
        await Onyx.merge(DOMAIN_KEY, {accountID: DOMAIN_ACCOUNT_ID, email: `+@${DOMAIN_NAME}`});
    });
    render(
        <DomainPaymentCardSuccessPage
            route={{key: 'domain-payment-card-success', name: SCREENS.DOMAIN.DYNAMIC_PAYMENT_CARD_SUCCESS, params: {domainAccountID: DOMAIN_ACCOUNT_ID, flow}}}
            navigation={navigation}
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('DomainPaymentCardSuccessPage', () => {
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

    it('confirms the admin is the primary contact and returns to the settings', async () => {
        // Given an admin who added a card to become the primary contact
        await renderPage(CONST.DOMAIN.PAYMENT_CARD_FLOW.PRIMARY_CONTACT);

        // Then the page confirms they are now the primary contact for the domain
        expect(screen.getByText('domain.admins.addPrimaryContact')).toBeOnTheScreen();
        expect(screen.getByText('domain.admins.paymentCardSuccessTitle')).toBeOnTheScreen();
        expect(screen.getByText(`domain.admins.primaryContactSuccessMessage:${DOMAIN_NAME}`)).toBeOnTheScreen();

        // When the admin presses the button
        fireEvent.press(screen.getByText('common.buttonConfirm'));

        // Then the admin goes back to the domain admin settings
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(DOMAIN_ACCOUNT_ID));
    });

    it('confirms consolidated domain billing is on and returns to the settings', async () => {
        // Given a primary contact who added a card to turn on consolidated domain billing
        await renderPage(CONST.DOMAIN.PAYMENT_CARD_FLOW.CONSOLIDATED_BILLING);

        // Then the page confirms billing is on for the domain
        expect(screen.getByText('domain.admins.consolidatedDomainBilling')).toBeOnTheScreen();
        expect(screen.getByText('domain.admins.paymentCardSuccessTitle')).toBeOnTheScreen();
        expect(screen.getByText(`domain.admins.consolidatedBillingSuccessMessage:${DOMAIN_NAME}`)).toBeOnTheScreen();

        // When the primary contact presses the button
        fireEvent.press(screen.getByText('common.buttonConfirm'));

        // Then they go back to the domain admin settings
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(DOMAIN_ACCOUNT_ID));
    });
});
