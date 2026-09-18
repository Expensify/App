import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import WorkspaceCompanyCardsTableHeaderButtons from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableHeaderButtons';

import CONST from '@src/CONST';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx/CardFeeds';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

TestHelper.setupApp();

const POLICY_ID = 'policy123';
const DOMAIN_OR_WORKSPACE_ACCOUNT_ID = 11111111;
const FEED_NAME = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}` as CompanyCardFeedWithDomainID;

const mockNavigateToFeedTransactions = jest.fn();

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false, isMediumScreenWidth: false}),
}));

jest.mock('@libs/CardNavigationUtils', () => ({
    __esModule: true,
    default: jest.fn(),
    navigateToFeedTransactions: (feedKey: string) => {
        mockNavigateToFeedTransactions(feedKey);
    },
}));

function renderHeaderButtons(shouldShowViewTransactions: boolean) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspaceCompanyCardsTableHeaderButtons
                policyID={POLICY_ID}
                feedName={FEED_NAME}
                domainOrWorkspaceAccountID={DOMAIN_OR_WORKSPACE_ACCOUNT_ID}
                isLoading={false}
                canWriteCompanyCards
                shouldShowViewTransactions={shouldShowViewTransactions}
                CardFeedIcon={<View />}
            />
        </ComposeProviders>,
    );
}

describe('WorkspaceCompanyCardsTableHeaderButtons view transactions link', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('opens every expense on the feed, keyed the way the Search feed filter expects', async () => {
        renderHeaderButtons(true);

        await waitForBatchedUpdates();

        // TextLink cancels the default anchor navigation before it calls onPress.
        fireEvent.press(screen.getByText('View transactions'), {preventDefault: jest.fn()});

        expect(mockNavigateToFeedTransactions).toHaveBeenCalledWith(`${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}`);
    });

    it('hides the link while the feed is not browsable', async () => {
        renderHeaderButtons(false);

        await waitForBatchedUpdates();

        expect(screen.queryByText('View transactions')).toBeNull();
    });
});
