import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const DOMAIN_NAME = 'expensify.com';
const WORKSPACE_POLICY_ID = 'ABC123';
const WORKSPACE_DOMAIN_NAME = `expensify-policy${WORKSPACE_POLICY_ID.toLowerCase()}.exfy`;
const WORKSPACE_NAME = 'Combo Workspace';

function createExpensifyCard(cardID: number, domainName: string, nameValuePairs: Partial<Card['nameValuePairs']> = {}): Card {
    return createMock<Card>({
        cardID,
        bank: CONST.EXPENSIFY_CARD.BANK,
        cardName: '',
        domainName,
        fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        lastFourPAN: String(cardID).padStart(4, '0'),
        availableSpend: 10000,
        nameValuePairs: createMock<Card['nameValuePairs']>({
            isVirtual: false,
            limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            unapprovedExpenseLimit: 10000,
            ...nameValuePairs,
        }),
    });
}

function createCardList(...cards: Card[]): CardList {
    return Object.fromEntries(cards.map((card) => [String(card.cardID), card]));
}

// Renders the assigned cards list the same way the Wallet page does, with connection statuses on
const renderAssignedCardsList = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <PaymentMethodList
                    shouldShowAssignedCards
                    shouldShowConnectionStatus
                    shouldShowAddBankAccount={false}
                    onPress={() => {}}
                />
            </PortalProvider>
        </ComposeProviders>,
    );

describe('PaymentMethodList', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('shows the physical and virtual halves of a legacy combo card as one row', async () => {
        // Given a legacy combo card: a physical and a virtual Expensify Card on the same domain, with no custom title
        await act(async () => {
            await Onyx.set(ONYXKEYS.CARD_LIST, createCardList(createExpensifyCard(1, DOMAIN_NAME), createExpensifyCard(2, DOMAIN_NAME, {isVirtual: true})));
        });

        // When the Wallet's assigned cards list renders with connection statuses on
        renderAssignedCardsList();
        await waitForBatchedUpdatesWithAct();

        // Then both halves collapse into a single row, because they are the same card to the user
        expect(screen.getAllByText(CONST.EXPENSIFY_CARD.BANK)).toHaveLength(1);
        expect(screen.getAllByText(DOMAIN_NAME)).toHaveLength(1);
    });

    it('shows a legacy combo card on a workspace feed domain as one row', async () => {
        // Given a combo card on a workspace feed domain, whose row shows the workspace name instead of the domain
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE_POLICY_ID}`, {...createRandomPolicy(1), id: WORKSPACE_POLICY_ID, name: WORKSPACE_NAME});
            await Onyx.set(ONYXKEYS.CARD_LIST, createCardList(createExpensifyCard(1, WORKSPACE_DOMAIN_NAME), createExpensifyCard(2, WORKSPACE_DOMAIN_NAME, {isVirtual: true})));
        });

        // When the Wallet's assigned cards list renders
        renderAssignedCardsList();
        await waitForBatchedUpdatesWithAct();

        // Then the halves are still matched by domain and collapse into a single row
        expect(screen.getAllByText(CONST.EXPENSIFY_CARD.BANK)).toHaveLength(1);
        expect(screen.getAllByText(WORKSPACE_NAME)).toHaveLength(1);
    });

    it('keeps an admin-issued virtual card on its own row', async () => {
        // Given a physical card and a separate virtual card an admin issued on the same domain
        await act(async () => {
            await Onyx.set(
                ONYXKEYS.CARD_LIST,
                createCardList(createExpensifyCard(1, DOMAIN_NAME), createExpensifyCard(2, DOMAIN_NAME, {isVirtual: true, issuedBy: 123, cardTitle: 'Admin virtual card'})),
            );
        });

        // When the Wallet's assigned cards list renders
        renderAssignedCardsList();
        await waitForBatchedUpdatesWithAct();

        // Then each card gets its own row, because an admin-issued virtual card is a distinct card
        expect(screen.getByText(CONST.EXPENSIFY_CARD.BANK)).toBeOnTheScreen();
        expect(screen.getByText('Admin virtual card')).toBeOnTheScreen();
    });
});
