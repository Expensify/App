import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type composeTableListHeaderFn from '@components/Table/composeTableListHeader';
import WorkspaceCompanyCardsTable from '@components/Tables/WorkspaceCompanyCardsTable';
import type {WorkspaceCompanyCardTableItemData} from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableRow';

import type {UseCompanyCardsResult} from '@hooks/useCompanyCards';

import {renameCompanyCardInline} from '@libs/actions/Policy/InlineEdit';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';
import type {CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

import type {View as ViewType} from 'react-native';
import type {PartialDeep} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../../utils/createMock';
import * as TestHelper from '../../../../utils/TestHelper';
import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

TestHelper.setupApp();

const POLICY_ID = 'policy123';
const DOMAIN_OR_WORKSPACE_ACCOUNT_ID = 11111111;
const FEED_NAME = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}` as CompanyCardFeedWithDomainID;
const BANK_NAME = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA as CompanyCardFeedWithNumber;
const ACCOUNT_ID = 1;

const LOADED_METADATA = {status: 'loaded'} as const;

let capturedData: WorkspaceCompanyCardTableItemData[] = [];

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
    const {View} = jest.requireActual<{View: typeof ViewType}>('react-native');
    return () => <View testID="WorkspaceCompanyCardsTableLoadingIndicator" />;
});

jest.mock('@pages/workspace/companyCards/WorkspaceCompanyCardPageEmptyState', () => {
    const {View} = jest.requireActual<{View: typeof ViewType}>('react-native');
    return () => <View testID="WorkspaceCompanyCardPageEmptyState" />;
});

type MockTableProps = {
    children?: React.ReactNode;
    data: WorkspaceCompanyCardTableItemData[];
};

jest.mock('@components/Table', () => {
    const {View} = jest.requireActual<{View: typeof ViewType}>('react-native');

    // Kept outside MockTable so the React Compiler does not treat it as a component body side-effect.
    // capturedData is a module-level variable so it is in scope when MockTable renders.
    function mockCaptureData(data: MockTableProps['data']) {
        capturedData = data;
    }

    function MockTable({children, data}: MockTableProps) {
        mockCaptureData(data);
        return <View testID="WorkspaceCompanyCardsTable">{children}</View>;
    }

    MockTable.FilterBar = () => <View testID="WorkspaceCompanyCardsTableFilterBar" />;
    MockTable.Header = () => <View testID="WorkspaceCompanyCardsTableHeader" />;
    MockTable.ListHeader = ({children}: {children?: React.ReactNode}) => children ?? null;
    MockTable.Body = () => <View testID="WorkspaceCompanyCardsTableBody" />;
    MockTable.EmptyState = () => <View testID="WorkspaceCompanyCardsTableEmptyState" />;
    MockTable.NoResultsState = () => <View testID="WorkspaceCompanyCardsTableNoResultsState" />;
    MockTable.LoadingState = () => <View testID="WorkspaceCompanyCardsTableLoadingIndicator" />;
    return {
        __esModule: true,
        default: MockTable,
        composeTableListHeader: jest.requireActual<{default: typeof composeTableListHeaderFn}>('@components/Table/composeTableListHeader').default,
    };
});

jest.mock('@components/CardFeedIcon', () => {
    const {View} = jest.requireActual<{View: typeof ViewType}>('react-native');
    return () => <View testID="CardFeedIcon" />;
});

jest.mock('@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableHeaderButtons', () => {
    const {View} = jest.requireActual<{View: typeof ViewType}>('react-native');
    return () => <View testID="WorkspaceCompanyCardsTableHeaderButtons" />;
});

jest.mock('@libs/actions/Policy/InlineEdit', () => ({
    renameCompanyCardInline: jest.fn(() => undefined),
}));

jest.mock('@libs/showInlineEditError', () => jest.fn());

const mockRenameCompanyCardInline = jest.mocked(renameCompanyCardInline);

function buildAssignedCard(overrides?: PartialDeep<Card, {recurseIntoArrays: true}>): Card {
    return createMock<Card>({
        cardID: 555,
        accountID: ACCOUNT_ID,
        bank: BANK_NAME,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        domainName: 'test.exfy',
        fraud: 'none',
        lastUpdated: '',
        nameValuePairs: {},
        ...overrides,
    });
}

function buildCompanyCards(assignedCard?: Card): UseCompanyCardsResult {
    return createMock<UseCompanyCardsResult>({
        feedName: FEED_NAME,
        bankName: BANK_NAME,
        assignedCards: assignedCard ? {[assignedCard.cardID]: assignedCard} : {},
        companyCardEntries: [
            {
                cardName: '4321',
                encryptedCardNumber: 'enc-4321',
                isAssigned: !!assignedCard,
                assignedCard,
            },
        ],
        workspaceCardFeedsStatus: {[DOMAIN_OR_WORKSPACE_ACCOUNT_ID]: {isLoading: false}},
        selectedFeed: {feed: BANK_NAME, status: {}},
        isInitiallyLoadingFeeds: false,
        isNoFeed: false,
        isFeedPending: false,
        isFeedAdded: true,
        onyxMetadata: {
            cardListMetadata: LOADED_METADATA,
            allCardFeedsMetadata: LOADED_METADATA,
            lastSelectedFeedMetadata: LOADED_METADATA,
        },
    });
}

function renderTable(companyCards: UseCompanyCardsResult) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspaceCompanyCardsTable
                policyID={POLICY_ID}
                isPolicyLoaded
                isPageFetchPending={false}
                domainOrWorkspaceAccountID={DOMAIN_OR_WORKSPACE_ACCOUNT_ID}
                companyCards={companyCards}
                onAssignCard={jest.fn()}
                isAssigningCardDisabled={false}
                canWriteCompanyCards
                isSelectionModeEnabled={false}
                onReloadPage={jest.fn()}
                onReloadFeed={jest.fn()}
            />
        </ComposeProviders>,
    );
}

describe('WorkspaceCompanyCardsTable card name mapping', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        capturedData = [];
        mockRenameCompanyCardInline.mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('uses nameValuePairs.cardTitle as customCardName when the card has been renamed', async () => {
        // Given a card whose admin has set a custom title
        const card = buildAssignedCard({nameValuePairs: {cardTitle: 'My Custom Card'}});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID]: {accountID: ACCOUNT_ID, displayName: 'Alice Smith', login: 'alice@example.com'},
        });
        await waitForBatchedUpdates();

        // When the table renders
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdates();

        // Then the row shows the stored cardTitle rather than the display-name fallback
        expect(capturedData.at(0)?.customCardName).toBe('My Custom Card');
    });

    it("falls back to the cardholder's display name when no cardTitle is stored", async () => {
        // Given a card that has never been renamed (no cardTitle in nameValuePairs)
        const card = buildAssignedCard({nameValuePairs: {}});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID]: {accountID: ACCOUNT_ID, displayName: 'Alice Smith', login: 'alice@example.com'},
        });
        await waitForBatchedUpdates();

        // When the table renders
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdates();

        // Then the row shows the default "DisplayName's card" label
        expect(capturedData.at(0)?.customCardName).toBe("Alice Smith's card");
    });

    it('passes storedCardName (not the display-name fallback) as the rollback argument to renameCompanyCardInline', async () => {
        // Given a card that has never been renamed — storedCardName is undefined, customCardName is the display-name fallback
        const card = buildAssignedCard({nameValuePairs: {}});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID]: {accountID: ACCOUNT_ID, displayName: 'Alice Smith', login: 'alice@example.com'},
        });
        await waitForBatchedUpdates();

        // When the table renders and the rename is triggered
        renderTable(buildCompanyCards(card));
        await waitForBatchedUpdates();

        const item = capturedData.at(0);
        expect(item).toBeDefined();
        item?.onRenameName?.('New name');

        // Then renameCompanyCardInline receives undefined as the last arg so a failed rename nulls cardTitle
        // rather than writing the display-name fallback back as the stored title
        expect(mockRenameCompanyCardInline).toHaveBeenCalledWith(
            expect.anything(), // translate
            DOMAIN_OR_WORKSPACE_ACCOUNT_ID,
            String(card.cardID),
            'New name',
            BANK_NAME,
            "Alice Smith's card", // customCardName shown to the user
            undefined, // storedCardName — undefined means no prior title, so rollback nulls cardTitle
        );
    });
});
