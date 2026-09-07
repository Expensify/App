import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import WorkspaceCompanyCardsTable from '@components/Tables/WorkspaceCompanyCardsTable';

import type {UseCompanyCardsResult} from '@hooks/useCompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeedsStatusByDomainID, CombinedCardFeed, CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

TestHelper.setupApp();

const POLICY_ID = 'policy123';
const DOMAIN_OR_WORKSPACE_ACCOUNT_ID = 11111111;
const FEED_NAME = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}` as CompanyCardFeedWithDomainID;
const BANK_NAME = CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE as CompanyCardFeedWithNumber;

const LOADED_METADATA = {status: 'loaded'} as const;

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({}),
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/useCardFeedErrors', () => ({
    __esModule: true,
    default: () => ({cardFeedErrors: {}}),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false, isMediumScreenWidth: false}),
}));

jest.mock('@components/ActivityIndicator', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="WorkspaceCompanyCardsTableLoadingIndicator" />;
});

jest.mock('@pages/workspace/companyCards/WorkspaceCompanyCardPageEmptyState', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="WorkspaceCompanyCardPageEmptyState" />;
});

jest.mock('@components/Table', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ReactMock = require('react');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars
    const MockTable = ReactMock.forwardRef(({children}: {children?: React.ReactNode}, _ref: unknown) => <View testID="WorkspaceCompanyCardsTable">{children}</View>);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    MockTable.FilterBar = () => <View testID="WorkspaceCompanyCardsTableFilterBar" />;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    MockTable.Header = () => <View testID="WorkspaceCompanyCardsTableHeader" />;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    MockTable.ListHeader = ({children}: {children?: React.ReactNode}) => children ?? null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    MockTable.Body = () => <View testID="WorkspaceCompanyCardsTableBody" />;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    MockTable.EmptyState = () => <View testID="WorkspaceCompanyCardsTableEmptyState" />;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    MockTable.NoResultsState = () => <View testID="WorkspaceCompanyCardsTableNoResultsState" />;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    MockTable.LoadingState = () => <View testID="WorkspaceCompanyCardsTableLoadingIndicator" />;
    return {
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        default: MockTable,
        // The wrapper composes its scrolling header with this helper, so the real implementation is kept.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        composeTableListHeader: jest.requireActual('@components/Table/composeTableListHeader').default,
    };
});

jest.mock('@components/CardFeedIcon', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="CardFeedIcon" />;
});

jest.mock('@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableHeaderButtons', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="WorkspaceCompanyCardsTableHeaderButtons" />;
});

type BuildCompanyCardsParams = {
    workspaceCardFeedsStatus?: CardFeedsStatusByDomainID;
    selectedFeed?: CombinedCardFeed;
    feedName?: CompanyCardFeedWithDomainID;
    bankName?: CompanyCardFeedWithNumber;
    isNoFeed?: boolean;
};

function buildCompanyCards({
    workspaceCardFeedsStatus = {
        [DOMAIN_OR_WORKSPACE_ACCOUNT_ID]: {isLoading: true},
    },
    selectedFeed,
    feedName,
    bankName,
    isNoFeed = true,
}: BuildCompanyCardsParams = {}): UseCompanyCardsResult {
    return {
        feedName,
        bankName,
        assignedCards: {},
        companyCardEntries: [],
        workspaceCardFeedsStatus,
        selectedFeed,
        isInitiallyLoadingFeeds: false,
        isNoFeed,
        isFeedPending: false,
        isFeedAdded: !isNoFeed,
        onyxMetadata: {
            cardListMetadata: LOADED_METADATA,
            allCardFeedsMetadata: LOADED_METADATA,
            lastSelectedFeedMetadata: LOADED_METADATA,
        },
    };
}

type RenderTableOverrides = {
    isPolicyLoaded?: boolean;
    isPageFetchPending?: boolean;
    domainOrWorkspaceAccountID?: number;
};

function renderTable(
    companyCards: UseCompanyCardsResult,
    isSelectionModeEnabled = false,
    {isPolicyLoaded = true, isPageFetchPending = false, domainOrWorkspaceAccountID = DOMAIN_OR_WORKSPACE_ACCOUNT_ID}: RenderTableOverrides = {},
) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspaceCompanyCardsTable
                policyID={POLICY_ID}
                isPolicyLoaded={isPolicyLoaded}
                isPageFetchPending={isPageFetchPending}
                domainOrWorkspaceAccountID={domainOrWorkspaceAccountID}
                companyCards={companyCards}
                onAssignCard={jest.fn()}
                isAssigningCardDisabled={false}
                canWriteCompanyCards
                isSelectionModeEnabled={isSelectionModeEnabled}
                onReloadPage={jest.fn()}
                onReloadFeed={jest.fn()}
            />
        </ComposeProviders>,
    );
}

describe('WorkspaceCompanyCardsTable loading suppression', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {});
        await waitForBatchedUpdates();
    });

    it('shows the page loading indicator when workspace feeds are loading and the page has not loaded once', async () => {
        renderTable(buildCompanyCards());

        await waitForBatchedUpdates();

        expect(screen.getByTestId('WorkspaceCompanyCardsTableLoadingIndicator')).toBeTruthy();
        expect(screen.queryByTestId('WorkspaceCompanyCardPageEmptyState')).toBeNull();
    });

    it('does not show the page loading indicator when workspace feeds are loading but RAM-only hasOnceLoadedPage is true', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARDS_LOADING_STATE}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}`, {
            hasOnceLoadedPage: true,
        });

        renderTable(buildCompanyCards());

        await waitForBatchedUpdates();

        expect(screen.queryByTestId('WorkspaceCompanyCardsTableLoadingIndicator')).toBeNull();
        expect(screen.getByTestId('WorkspaceCompanyCardPageEmptyState')).toBeTruthy();
    });

    it('does not show the feed loading indicator when the selected feed is loading but RAM-only hasOnceLoaded is true', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARDS_LOADING_STATE}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}`, {
            feeds: {
                [BANK_NAME]: {
                    hasOnceLoaded: true,
                },
            },
        });

        renderTable(
            buildCompanyCards({
                workspaceCardFeedsStatus: {
                    [DOMAIN_OR_WORKSPACE_ACCOUNT_ID]: {isLoading: false},
                },
                isNoFeed: false,
                feedName: FEED_NAME,
                bankName: BANK_NAME,
                selectedFeed: {
                    feed: BANK_NAME,
                    status: {
                        isLoading: true,
                    },
                },
            }),
        );

        await waitForBatchedUpdates();

        expect(screen.queryByTestId('WorkspaceCompanyCardsTableLoadingIndicator')).toBeNull();
        expect(screen.getByTestId('WorkspaceCompanyCardsTable')).toBeTruthy();
    });
});

describe('WorkspaceCompanyCardsTable pending page fetch', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {});
        await waitForBatchedUpdates();
    });

    it('shows the loading indicator while the page fetch is still awaited, so the empty feed state cannot flash', async () => {
        renderTable(buildCompanyCards({workspaceCardFeedsStatus: {}}), false, {isPageFetchPending: true});

        await waitForBatchedUpdates();

        expect(screen.getByTestId('WorkspaceCompanyCardsTableLoadingIndicator')).toBeTruthy();
        expect(screen.queryByTestId('WorkspaceCompanyCardPageEmptyState')).toBeNull();
    });

    it('shows the empty feed state once the page fetch has succeeded', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARDS_LOADING_STATE}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}`, {
            hasOnceLoadedPage: true,
        });

        renderTable(buildCompanyCards({workspaceCardFeedsStatus: {}}), false, {isPageFetchPending: true});

        await waitForBatchedUpdates();

        expect(screen.queryByTestId('WorkspaceCompanyCardsTableLoadingIndicator')).toBeNull();
        expect(screen.getByTestId('WorkspaceCompanyCardPageEmptyState')).toBeTruthy();
    });

    it('shows the feeds load error instead of the loading indicator when the page fetch failed', async () => {
        renderTable(
            buildCompanyCards({
                workspaceCardFeedsStatus: {
                    [DOMAIN_OR_WORKSPACE_ACCOUNT_ID]: {
                        errors: {
                            [CONST.COMPANY_CARDS.WORKSPACE_FEEDS_LOAD_ERROR]: TestHelper.translateLocal('workspace.companyCards.error.workspaceFeedsCouldNotBeLoadedMessage'),
                        },
                    },
                },
            }),
            false,
            {isPageFetchPending: true},
        );

        await waitForBatchedUpdates();

        expect(screen.queryByTestId('WorkspaceCompanyCardsTableLoadingIndicator')).toBeNull();
        expect(screen.getByText(TestHelper.translateLocal('workspace.companyCards.error.workspaceFeedsCouldNotBeLoadedTitle'))).toBeTruthy();
    });
});

describe('WorkspaceCompanyCardsTable unresolved workspace account ID', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {});
        await waitForBatchedUpdates();
    });

    it('keeps the loading indicator up instead of flashing the feeds load error while the policy account ID is unresolved', async () => {
        renderTable(buildCompanyCards({workspaceCardFeedsStatus: {}}), false, {isPolicyLoaded: false, domainOrWorkspaceAccountID: CONST.DEFAULT_NUMBER_ID});

        await waitForBatchedUpdates();

        expect(screen.getByTestId('WorkspaceCompanyCardsTableLoadingIndicator')).toBeTruthy();
        expect(screen.queryByText(TestHelper.translateLocal('workspace.companyCards.error.workspaceFeedsCouldNotBeLoadedTitle'))).toBeNull();
    });

    it('still shows the feeds load error once the policy is loaded and the account ID is genuinely 0', async () => {
        renderTable(buildCompanyCards({workspaceCardFeedsStatus: {}}), false, {domainOrWorkspaceAccountID: CONST.DEFAULT_NUMBER_ID});

        await waitForBatchedUpdates();

        expect(screen.queryByTestId('WorkspaceCompanyCardsTableLoadingIndicator')).toBeNull();
        expect(screen.getByText(TestHelper.translateLocal('workspace.companyCards.error.workspaceFeedsCouldNotBeLoadedTitle'))).toBeTruthy();
    });
});

describe('WorkspaceCompanyCardsTable selection mode', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {});
        await waitForBatchedUpdates();
    });

    it('shows the feed header controls outside selection mode', async () => {
        renderTable(buildCompanyCards({feedName: FEED_NAME}));

        await waitForBatchedUpdates();

        expect(screen.getByTestId('WorkspaceCompanyCardsTableHeaderButtons')).toBeTruthy();
    });

    it('hides the feed header controls during narrow-layout selection mode', async () => {
        renderTable(buildCompanyCards({feedName: FEED_NAME}), true);

        await waitForBatchedUpdates();

        expect(screen.queryByTestId('WorkspaceCompanyCardsTableHeaderButtons')).toBeNull();
    });
});
