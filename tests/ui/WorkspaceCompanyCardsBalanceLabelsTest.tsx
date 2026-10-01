import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import WorkspaceCompanyCardsBalanceLabels from '@pages/workspace/companyCards/WorkspaceCompanyCardsBalanceLabels';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CombinedCardFeed, CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useResponsiveLayout');

const DOMAIN_ACCOUNT_ID = 11111111;

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Plaid institution IDs are dynamic runtime feed names that CompanyCardFeedWithNumber cannot represent.
const PLAID_FEED = 'plaid.ins_123456' as CompanyCardFeedWithNumber;
const PLAID_FEED_NAME = `${PLAID_FEED}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${DOMAIN_ACCOUNT_ID}` as CompanyCardFeedWithDomainID;

const OAUTH_FEED_NAME = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${DOMAIN_ACCOUNT_ID}` as CompanyCardFeedWithDomainID;

function buildSelectedFeed(overrides: Partial<CombinedCardFeed> = {}): CombinedCardFeed {
    return {
        feed: PLAID_FEED,
        ...overrides,
    };
}

function renderBalanceLabels(selectedFeed: CombinedCardFeed | undefined, feedName: CompanyCardFeedWithDomainID | undefined) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <WorkspaceCompanyCardsBalanceLabels
                selectedFeed={selectedFeed}
                feedName={feedName}
            />
        </ComposeProviders>,
    );
}

describe('WorkspaceCompanyCardsBalanceLabels', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('shows Current balance and Remaining limit for a Plaid feed with balance data', async () => {
        // Given a Plaid feed that reported both balance values
        const selectedFeed = buildSelectedFeed({currentBalance: 150000, remainingLimit: 500000, balanceCurrency: CONST.CURRENCY.USD});

        // When the balance labels render
        renderBalanceLabels(selectedFeed, PLAID_FEED_NAME);
        await waitForBatchedUpdatesWithAct();

        // Then both labels show their reported amounts
        expect(screen.getByText(TestHelper.translateLocal('workspace.companyCards.balance.currentBalance'))).toBeTruthy();
        expect(screen.getByText(TestHelper.convertToDisplayString(150000, CONST.CURRENCY.USD))).toBeTruthy();
        expect(screen.getByText(TestHelper.translateLocal('workspace.companyCards.balance.remainingLimit'))).toBeTruthy();
        expect(screen.getByText(TestHelper.convertToDisplayString(500000, CONST.CURRENCY.USD))).toBeTruthy();
    });

    it('hides the block for a non-Plaid feed', async () => {
        // Given an OAuth (non-Plaid) feed that still carries balance data
        const selectedFeed = buildSelectedFeed({currentBalance: 150000, remainingLimit: 500000, balanceCurrency: CONST.CURRENCY.USD});

        // When the balance labels render for that feed
        renderBalanceLabels(selectedFeed, OAUTH_FEED_NAME);
        await waitForBatchedUpdatesWithAct();

        // Then nothing renders, since balance is only ever returned by Plaid
        expect(screen.queryByText(TestHelper.translateLocal('workspace.companyCards.balance.currentBalance'))).toBeNull();
        expect(screen.queryByText(TestHelper.translateLocal('workspace.companyCards.balance.remainingLimit'))).toBeNull();
    });

    it('hides the block for a Plaid feed with no balance data', async () => {
        // Given a Plaid feed where the bank did not report either amount
        const selectedFeed = buildSelectedFeed({currentBalance: null, remainingLimit: null});

        // When the balance labels render
        renderBalanceLabels(selectedFeed, PLAID_FEED_NAME);
        await waitForBatchedUpdatesWithAct();

        // Then the whole block is hidden rather than showing two empty labels
        expect(screen.queryByText(TestHelper.translateLocal('workspace.companyCards.balance.currentBalance'))).toBeNull();
        expect(screen.queryByText(TestHelper.translateLocal('workspace.companyCards.balance.remainingLimit'))).toBeNull();
    });

    it('shows Not available for the amount a Plaid feed did not report', async () => {
        // Given a Plaid feed that only reported the current balance
        const selectedFeed = buildSelectedFeed({currentBalance: 150000, balanceCurrency: CONST.CURRENCY.USD});

        // When the balance labels render
        renderBalanceLabels(selectedFeed, PLAID_FEED_NAME);
        await waitForBatchedUpdatesWithAct();

        // Then the reported amount shows normally and the missing one falls back to Not available
        expect(screen.getByText(TestHelper.convertToDisplayString(150000, CONST.CURRENCY.USD))).toBeTruthy();
        expect(screen.getByText(TestHelper.translateLocal('workspace.companyCards.balance.notAvailable'))).toBeTruthy();
    });
});
