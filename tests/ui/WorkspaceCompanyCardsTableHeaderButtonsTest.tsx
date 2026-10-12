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

let mockShouldUseNarrowLayout = false;

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout, isMediumScreenWidth: false}),
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
        mockShouldUseNarrowLayout = false;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('opens every expense on the feed, keyed the way the Search feed filter expects', async () => {
        // Given a browsable feed identified on this page as `<feed>#<domainID>`, which is a different key format
        // than the `<fundID>_<feed>` the Search feed filter uses — converting between the two is the whole point of this link
        renderHeaderButtons(true);

        await waitForBatchedUpdates();

        // When the admin taps the link. TextLink cancels the default anchor navigation before it calls onPress,
        // so the event needs a preventDefault stub or the press never reaches our handler
        fireEvent.press(screen.getByText('View transactions'), {preventDefault: jest.fn()});

        // Then navigation must receive the Search-shaped key, because a raw `<feed>#<domainID>` would leave Spend
        // showing an unresolved filter pill and no results
        expect(mockNavigateToFeedTransactions).toHaveBeenCalledWith(`${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}`);
    });

    it('hides the link while the feed is not browsable', async () => {
        // Given a feed that is still loading, pending, missing, or errored, so there are no transactions to navigate to yet
        renderHeaderButtons(false);

        // When the header renders in that state
        await waitForBatchedUpdates();

        // Then the link must be absent rather than disabled, because offering navigation into an empty
        // or not-yet-loaded Search view reads as a broken page
        expect(screen.queryByText('View transactions')).toBeNull();
    });
});

describe('WorkspaceCompanyCardsTableHeaderButtons settings button', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        mockShouldUseNarrowLayout = false;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('keeps the Settings label on wide screens', async () => {
        // Given a wide layout, where there is room for the feed selector and a labelled button on the same row
        renderHeaderButtons(true);

        await waitForBatchedUpdates();

        // Then the button shows the cog and its label
        expect(screen.getByText('Settings')).toBeOnTheScreen();
    });

    it('keeps the Settings label on narrow screens too', async () => {
        // Given a narrow layout, which at one point collapsed this button to a cog-only circle
        mockShouldUseNarrowLayout = true;
        renderHeaderButtons(true);

        await waitForBatchedUpdates();

        // Then the label stays, because design chose one consistent icon + label button at every width
        // rather than swapping treatments between desktop and mobile
        expect(screen.getByText('Settings')).toBeOnTheScreen();
        expect(screen.getByLabelText('Settings')).toBeOnTheScreen();
    });
});
