import {act, cleanup, fireEvent, render, renderHook, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import WorkspaceInvoiceBalanceSection from '@pages/workspace/invoices/WorkspaceInvoiceBalanceSection';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'invoiceBalancePolicy';
const BALANCE_IN_MINOR_UNITS = 123456789;
const GBP_BALANCE = '£1,234,567.89';
const PRESS_EVENT = {nativeEvent: {}};
const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

async function seedPolicy(policy: Partial<Policy> | null) {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
    });
    await waitForBatchedUpdatesWithAct();
}

function renderSection(sibling?: React.ReactNode) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider, ThemeStylesProvider]}>
            <WorkspaceInvoiceBalanceSection policyID={POLICY_ID} />
            {sibling}
        </ComposeProviders>,
    );
}

describe('WorkspaceInvoiceBalanceSection', () => {
    beforeEach(async () => {
        navigateSpy.mockClear();
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.EN,
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
                [ONYXKEYS.SESSION]: {accountID: 1, email: 'invoice-owner@example.com', authToken: 'test-invoice-token'},
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        cleanup();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterAll(() => {
        navigateSpy.mockRestore();
    });

    it.each([
        {name: 'zero in USD', balance: 0, currency: CONST.CURRENCY.USD, display: '$0.00'},
        {name: 'a nonzero amount in USD', balance: BALANCE_IN_MINOR_UNITS, currency: CONST.CURRENCY.USD, display: '$1,234,567.89'},
        {name: 'a nonzero amount in GBP', balance: BALANCE_IN_MINOR_UNITS, currency: CONST.CURRENCY.GBP, display: GBP_BALANCE},
    ])('formats $name using the workspace currency', async ({balance, currency, display}) => {
        // Given a stored balance in minor units, so its currency and decimal places must come from the normal formatter.
        await seedPolicy({id: POLICY_ID, outputCurrency: currency, invoice: {bankAccount: {stripeConnectAccountBalance: balance}}});

        // When the real section reads the policy with its locale and currency providers.
        renderSection();
        await waitForBatchedUpdatesWithAct();

        // Then the value is formatted for display and announced after its label, rather than exposing minor units.
        const row = screen.getByLabelText(`${translateLocal('walletPage.balance')}, ${display}`);
        expect(within(row).getByText(display)).toBeOnTheScreen();
        expect(within(row).getByText(translateLocal('walletPage.balance'))).toBeOnTheScreen();
    });

    it.each<{name: string; policy: Partial<Policy> | null}>([
        {name: 'the balance', policy: {id: POLICY_ID, outputCurrency: CONST.CURRENCY.USD, invoice: {bankAccount: {}}}},
        {name: 'the invoice bank account', policy: {id: POLICY_ID, outputCurrency: CONST.CURRENCY.USD, invoice: {}}},
        {name: 'invoice data', policy: {id: POLICY_ID, outputCurrency: CONST.CURRENCY.USD}},
        {name: 'the policy', policy: null},
    ])('shows zero when $name is missing', async ({policy}) => {
        // Given incomplete policy data, which is valid before invoice setup or policy hydration finishes.
        await seedPolicy(policy);

        // When the real section renders without a stored balance.
        renderSection();
        await waitForBatchedUpdatesWithAct();

        // Then the same labelled zero remains readable without requiring any bank setup.
        expect(screen.getByLabelText(`${translateLocal('walletPage.balance')}, $0.00`)).toBeOnTheScreen();
        expect(screen.getByText('$0.00')).toBeOnTheScreen();
    });

    it('keeps the supporting label above a single-line headline value and retains the section copy', async () => {
        // Given a long formatted amount, so a typography or line-limit change would affect the total's layout.
        await seedPolicy({id: POLICY_ID, outputCurrency: CONST.CURRENCY.GBP, invoice: {bankAccount: {stripeConnectAccountBalance: BALANCE_IN_MINOR_UNITS}}});
        const {result} = renderHook(useThemeStyles, {wrapper: ThemeStylesProvider});

        // When the real section renders with the same theme styles as its surrounding section.
        renderSection();
        await waitForBatchedUpdatesWithAct();

        // Then the label and headline keep their order, typography, line limits, and section spacing.
        const row = screen.getByLabelText(`${translateLocal('walletPage.balance')}, ${GBP_BALANCE}`);
        const label = within(row).getByText(translateLocal('walletPage.balance'));
        const value = within(row).getByText(GBP_BALANCE);
        expect(within(row).getAllByText(/^(Balance|£1,234,567\.89)$/)).toEqual([label, value]);
        expect(label).toHaveProp('numberOfLines', 2);
        expect(label).toHaveStyle({color: result.current.textLabelSupporting.color, fontSize: result.current.textLabelSupporting.fontSize});
        expect(value).toHaveProp('numberOfLines', 1);
        expect(value).toHaveStyle(result.current.textHeadlineH2);
        expect(row).toHaveStyle(result.current.sectionMenuItemTopDescription);
        expect(screen.getByRole(CONST.ROLE.HEADER, {name: translateLocal('workspace.invoices.invoiceBalance')})).toHaveStyle(result.current.accountSettingsSectionTitle);
        const subtitle = screen.getByText(translateLocal('workspace.invoices.invoiceBalanceSubtitle'));
        expect(subtitle).toHaveStyle(result.current.colorMuted);
        expect(within(row).queryByText(translateLocal('workspace.invoices.invoiceBalanceSubtitle'))).toBeNull();
    });

    it('does not make the balance actionable or interfere with a neighboring control', async () => {
        // Given a total beside a real control, so a successful sibling press proves that the event can activate controls.
        await seedPolicy({id: POLICY_ID, outputCurrency: CONST.CURRENCY.GBP, invoice: {bankAccount: {stripeConnectAccountBalance: BALANCE_IN_MINOR_UNITS}}});
        const pressSibling = jest.fn();
        renderSection(
            <PressableWithoutFeedback
                role={CONST.ROLE.BUTTON}
                accessibilityLabel="Next action"
                onPress={pressSibling}
            >
                <Text>Next action</Text>
            </PressableWithoutFeedback>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the total and its text receive ordinary, non-null press events.
        const row = screen.getByLabelText(`${translateLocal('walletPage.balance')}, ${GBP_BALANCE}`);
        fireEvent.press(row, PRESS_EVENT);
        fireEvent.press(within(row).getByText(GBP_BALANCE), PRESS_EVENT);

        // Then the total stays a readable fact, without navigation, button semantics, or a sibling action.
        expect(screen.queryByRole(CONST.ROLE.BUTTON, {name: `${translateLocal('walletPage.balance')}, ${GBP_BALANCE}`})).toBeNull();
        expect(within(row).queryByRole(CONST.ROLE.BUTTON)).toBeNull();
        expect(navigateSpy).not.toHaveBeenCalled();
        expect(pressSibling).not.toHaveBeenCalled();
        expect(within(row).getByText(GBP_BALANCE)).toBeOnTheScreen();

        // When the neighboring control receives the same event.
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Next action'}), PRESS_EVENT);

        // Then its own action still runs once, independently of the total.
        expect(pressSibling).toHaveBeenCalledTimes(1);
    });
});
