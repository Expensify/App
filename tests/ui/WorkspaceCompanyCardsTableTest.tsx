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
    MockTable.Body = () => <View testID="WorkspaceCompanyCardsTableBody" />;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    MockTable.EmptyState = () => <View testID="WorkspaceCompanyCardsTableEmptyState" />;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    MockTable.NoResultsState = () => <View testID="WorkspaceCompanyCardsTableNoResultsState" />;
    return {
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        default: MockTable,
        // The wrapper composes its scrolling header with this helper, so the real implementation is kept.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        composeTableHeaderComponent: jest.requireActual('@components/Table/composeTableHeaderComponent').default,
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

function renderTable(companyCards: UseCompanyCardsResult) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspaceCompanyCardsTable
                policyID={POLICY_ID}
                isPolicyLoaded
                domainOrWorkspaceAccountID={DOMAIN_OR_WORKSPACE_ACCOUNT_ID}
                companyCards={companyCards}
                onAssignCard={jest.fn()}
                isAssigningCardDisabled={false}
                canWriteCompanyCards
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
