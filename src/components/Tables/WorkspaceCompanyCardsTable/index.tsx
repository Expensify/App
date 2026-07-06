import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import CardFeedIcon from '@components/CardFeedIcon';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScrollView from '@components/ScrollView';
import Table from '@components/Table';
import type {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import type {UseCompanyCardsResult} from '@hooks/useCompanyCards';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {resetFailedWorkspaceCompanyCardUnassignment, unassignWorkspaceCompanyCard} from '@libs/actions/CompanyCards';
import navigateToCardTransactions from '@libs/CardNavigationUtils';
import {formatMaskedCardName, getCompanyCardCustomName, getDefaultCardName} from '@libs/CardUtils';
import localFileDownload from '@libs/localFileDownload';
import tokenizedSearch from '@libs/tokenizedSearch';

import WorkspaceCompanyCardPageEmptyState from '@pages/workspace/companyCards/WorkspaceCompanyCardPageEmptyState';
import WorkspaceCompanyCardsFeedAddedEmptyPage from '@pages/workspace/companyCards/WorkspaceCompanyCardsFeedAddedEmptyPage';
import WorkspaceCompanyCardsFeedPendingPage from '@pages/workspace/companyCards/WorkspaceCompanyCardsFeedPendingPage';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import {companyCardCustomNamesSelector} from '@selectors/Card';
import {format, parseISO} from 'date-fns';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {WorkspaceCompanyCardTableItemData} from './WorkspaceCompanyCardsTableRow';

import WorkspaceCompanyCardsDisplayButton from './WorkspaceCompanyCardsDisplayButton';
import WorkspaceCompanyCardsTableHeaderButtons from './WorkspaceCompanyCardsTableHeaderButtons';
import WorkspaceCompanyCardTableItem from './WorkspaceCompanyCardsTableRow';

type CompanyCardsTableColumnKey = 'member' | 'card' | 'customCardName' | 'actions';
type WorkspaceCompanyCardBulkActionType = 'unassign' | 'viewTransactions' | 'exportCSV';

type WorkspaceCompanyCardsTableControlsProps = {
    /** Current policy id */
    policyID: string;

    /** Domain or workspace account ID */
    domainOrWorkspaceAccountID: number;

    /** Bank name */
    bankName: UseCompanyCardsResult['bankName'];

    /** Whether the current member can edit company cards */
    canWriteCompanyCards: boolean;

    /** Clear selected card rows */
    clearCardSelection: () => void;
};

type WorkspaceCompanyCardsSelectionSearchPrunerProps = {
    /** Clear selected card rows */
    setSelectedCardKeys: React.Dispatch<React.SetStateAction<string[]>>;
};

const CSV_FORMULA_PREFIX_REGEXP = /^(?:[\t\r\n]|\s*[=+\-@])/;

function escapeCsvField(value: string): string {
    const safeValue = CSV_FORMULA_PREFIX_REGEXP.test(value) ? `'${value}` : value;
    if (safeValue.includes('"') || safeValue.includes(',') || safeValue.includes('\n') || safeValue.includes('\r')) {
        return `"${safeValue.replaceAll('"', '""')}"`;
    }
    return safeValue;
}

function WorkspaceCompanyCardsSelectionSearchPruner({setSelectedCardKeys}: WorkspaceCompanyCardsSelectionSearchPrunerProps) {
    const {activeSearchString} = useTableContext<WorkspaceCompanyCardTableItemData, CompanyCardsTableColumnKey>();
    const previousSearchStringRef = useRef(activeSearchString);

    useEffect(() => {
        if (previousSearchStringRef.current === activeSearchString) {
            return;
        }

        previousSearchStringRef.current = activeSearchString;
        setSelectedCardKeys([]);
    }, [activeSearchString, setSelectedCardKeys]);

    return null;
}

function WorkspaceCompanyCardsTableControls({policyID, domainOrWorkspaceAccountID, bankName, canWriteCompanyCards, clearCardSelection}: WorkspaceCompanyCardsTableControlsProps) {
    const styles = useThemeStyles();
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const icons = useMemoizedLazyExpensifyIcons(['Export', 'MoneySearch', 'RemoveMembers']);
    const {processedData, shouldUseNarrowTableLayout} = useTableContext<WorkspaceCompanyCardTableItemData, CompanyCardsTableColumnKey>();

    const selectedCards = processedData.filter((card) => card.selected && !card.disabled);
    const selectedAssignedCards = selectedCards.filter((card) => card.isAssigned && !!card.assignedCard);
    const isOnlyAssignedCardsSelected = selectedCards.length > 0 && selectedAssignedCards.length === selectedCards.length;

    const exportSelectedCardsToCSV = () => {
        if (selectedCards.length === 0) {
            return;
        }

        const header = [
            translate('common.email'),
            translate('workspace.expensifyCard.name'),
            translate('workspace.moreFeatures.companyCards.cardNumber'),
            translate('workspace.moreFeatures.companyCards.transactionStartDate'),
            translate('workspace.moreFeatures.companyCards.lastUpdated'),
            translate('workspace.moreFeatures.companyCards.assignedCards'),
        ]
            .map(escapeCsvField)
            .join(',');

        const rows = selectedCards.map((card) => {
            const assignedCard = card.assignedCard;
            const transactionStartDate = assignedCard?.scrapeMinDate ? format(parseISO(assignedCard.scrapeMinDate), CONST.DATE.FNS_FORMAT_STRING) : '';
            const lastUpdated = assignedCard?.lastScrape ? format(getLocalDateFromDatetime(assignedCard.lastScrape), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING) : '';

            return [
                card.isAssigned ? (card.cardholder?.login ?? '') : 'unassigned',
                card.isAssigned ? (card.customCardName ?? '') : '',
                formatMaskedCardName(card.cardName),
                card.isAssigned ? transactionStartDate : '',
                card.isAssigned ? lastUpdated : '',
                translate(card.isAssigned ? 'common.yes' : 'common.no'),
            ]
                .map(escapeCsvField)
                .join(',');
        });

        const csvContent = [header, ...rows].join('\r\n');
        const safePolicySegment = policyID.replaceAll(/[^\dA-Za-z-_]/g, '') || 'workspace';
        localFileDownload(`CompanyCards_${safePolicySegment}.csv`, csvContent, translate);
    };

    const confirmBulkUnassign = async () => {
        if (!bankName || selectedAssignedCards.length === 0) {
            return;
        }

        const {action} = await showConfirmModal({
            shouldSetModalVisibility: false,
            title: translate('workspace.moreFeatures.companyCards.unassignCards'),
            prompt: translate('workspace.moreFeatures.companyCards.unassignCardsDescription'),
            confirmText: translate('workspace.moreFeatures.companyCards.unassign'),
            cancelText: translate('common.cancel'),
            danger: true,
        });

        if (action !== ModalActions.CONFIRM) {
            return;
        }

        for (const card of selectedAssignedCards) {
            if (!card.assignedCard) {
                continue;
            }
            unassignWorkspaceCompanyCard(domainOrWorkspaceAccountID, bankName, card.assignedCard);
        }
        clearCardSelection();
    };

    const viewSelectedCardTransactions = () => {
        const selectedCardIDs = selectedAssignedCards.map((card) => card.assignedCard?.cardID).filter((cardID): cardID is number => cardID !== undefined);
        if (selectedCardIDs.length === 0) {
            return;
        }

        navigateToCardTransactions(selectedCardIDs.join(','));
        clearCardSelection();
    };

    const getBulkActionOptions = (): Array<DropdownOption<WorkspaceCompanyCardBulkActionType>> => {
        const options: Array<DropdownOption<WorkspaceCompanyCardBulkActionType>> = [];

        if (isOnlyAssignedCardsSelected) {
            if (canWriteCompanyCards) {
                options.push({
                    icon: icons.RemoveMembers,
                    text: translate('workspace.moreFeatures.companyCards.unassignCards'),
                    value: 'unassign',
                    onSelected: confirmBulkUnassign,
                });
            }

            options.push({
                icon: icons.MoneySearch,
                text: translate('workspace.common.viewTransactions'),
                value: 'viewTransactions',
                onSelected: viewSelectedCardTransactions,
            });
        }

        options.push({
            icon: icons.Export,
            text: translate('workspace.expensifyCard.exportAsCSV'),
            value: 'exportCSV',
            onSelected: exportSelectedCardsToCSV,
        });

        return options;
    };

    if (selectedCards.length === 0) {
        return (
            <Table.FilterBar label={translate('workspace.companyCards.findCompanyCard')}>
                <WorkspaceCompanyCardsDisplayButton />
            </Table.FilterBar>
        );
    }

    return (
        <View style={[styles.w100, styles.ph5, styles.pb3, !shouldUseNarrowTableLayout && styles.flexRow]}>
            <ButtonWithDropdownMenu<WorkspaceCompanyCardBulkActionType>
                success
                onPress={() => {}}
                customText={translate('workspace.common.selected', {count: selectedCards.length})}
                options={getBulkActionOptions()}
                isSplitButton={false}
                shouldAlwaysShowDropdownMenu
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.BULK_ACTIONS_DROPDOWN}
                wrapperStyle={shouldUseNarrowTableLayout ? styles.w100 : styles.flexGrow0}
            />
        </View>
    );
}

type WorkspaceCompanyCardsTableProps = {
    /** Policy ID */
    policyID: string;

    /** Whether the policy is loaded */
    isPolicyLoaded: boolean;

    /** Domain or workspace account ID */
    domainOrWorkspaceAccountID: number;

    /** Company cards */
    companyCards: UseCompanyCardsResult;

    /** Whether to disable assign card button */
    isAssigningCardDisabled: boolean;

    /** Whether the current member can edit company cards */
    canWriteCompanyCards: boolean;

    /** On assign card callback */
    onAssignCard: (cardID: string, encryptedCardNumber: string) => void;

    /** On reload page callback */
    onReloadPage: () => void;

    /** On reload feed callback */
    onReloadFeed: () => void;
};

function WorkspaceCompanyCardsTable({
    policyID,
    isPolicyLoaded,
    domainOrWorkspaceAccountID,
    companyCards,
    onAssignCard,
    isAssigningCardDisabled,
    canWriteCompanyCards,
    onReloadPage,
    onReloadFeed,
}: WorkspaceCompanyCardsTableProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const tableRef = useRef<TableHandle<WorkspaceCompanyCardTableItemData, CompanyCardsTableColumnKey>>(null);

    const {
        feedName,
        bankName,
        assignedCards,
        companyCardEntries,
        workspaceCardFeedsStatus,
        selectedFeed,
        isInitiallyLoadingFeeds,
        isNoFeed,
        isFeedPending,
        onyxMetadata: {cardListMetadata, lastSelectedFeedMetadata},
    } = companyCards;

    const {cardFeedErrors} = useCardFeedErrors();
    const isFeedConnectionBroken = feedName ? cardFeedErrors[feedName]?.isFeedConnectionBroken : false;

    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY);
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [selectedCardKeys, setSelectedCardKeys] = useState<string[]>([]);
    const [personalDetails, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [sharedCardCustomNames] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`, {selector: companyCardCustomNamesSelector});

    const hasNoAssignedCard = Object.keys(assignedCards ?? {}).length === 0;
    const areWorkspaceCardFeedsLoading = !!workspaceCardFeedsStatus?.[domainOrWorkspaceAccountID]?.isLoading;

    // Synthesize error locally since Onyx discards writes to collection keys with member ID '0'.
    const shouldShowWorkspaceFeedsLoadError = domainOrWorkspaceAccountID === CONST.DEFAULT_NUMBER_ID && isPolicyLoaded && !isOffline;
    const workspaceCardFeedsErrors = shouldShowWorkspaceFeedsLoadError
        ? {
              [CONST.COMPANY_CARDS.WORKSPACE_FEEDS_LOAD_ERROR]: translate('workspace.companyCards.error.workspaceFeedsCouldNotBeLoadedMessage'),
          }
        : workspaceCardFeedsStatus?.[domainOrWorkspaceAccountID]?.errors;

    const selectedFeedStatus = selectedFeed?.status;
    const selectedFeedErrors = selectedFeedStatus?.errors;

    const [feedErrorKey, feedErrorMessage] = Object.entries(workspaceCardFeedsErrors ?? selectedFeedErrors ?? {}).at(0) ?? [];
    const hasFeedErrors = !!feedErrorKey;

    let feedErrorTitle: string | undefined;
    let feedErrorReloadAction: (() => void) | undefined;

    if (feedErrorKey === CONST.COMPANY_CARDS.WORKSPACE_FEEDS_LOAD_ERROR) {
        feedErrorTitle = translate('workspace.companyCards.error.workspaceFeedsCouldNotBeLoadedTitle');
        feedErrorReloadAction = onReloadPage;
    } else if (feedErrorKey === CONST.COMPANY_CARDS.FEED_LOAD_ERROR) {
        feedErrorTitle = translate('workspace.companyCards.error.feedCouldNotBeLoadedTitle');
        feedErrorReloadAction = onReloadFeed;
    }

    // If we already have fetched cards, then do not show a loading spinner (let the remaining updates refresh in the background), else show it
    const hasCards = (companyCardEntries ?? []).length > 0;
    // When the last feed is removed, card data already implies no feed (isNoFeed); lastSelectedFeed Onyx metadata can still report loading after optimistic clear.
    const isLoadingFeed =
        !hasCards && ((!feedName && isInitiallyLoadingFeeds) || !isPolicyLoaded || (!isNoFeed && isLoadingOnyxValue(lastSelectedFeedMetadata)) || !!selectedFeedStatus?.isLoading);
    const isLoadingCards = !hasCards && isLoadingOnyxValue(cardListMetadata);
    const isLoadingPage = !isOffline && !hasCards && (isLoadingFeed || isLoadingOnyxValue(personalDetailsMetadata) || areWorkspaceCardFeedsLoading);

    const isLoading = isLoadingPage || isLoadingFeed;

    // Unassign requests hide their rows while online (pending-delete filter below), so bulk unassigning every
    // visible card would flash the empty feed state; treat that in-flight window as loading instead.
    const hasPendingUnassignments = (companyCardEntries ?? []).some((entry) => entry.assignedCard?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const showCards = !isInitiallyLoadingFeeds && !isFeedPending && !isNoFeed && !isLoading && !hasFeedErrors;
    const showTableControls = showCards && !!selectedFeed && !isLoadingCards && !hasFeedErrors;
    const showTableHeaderButtons = (showTableControls || isLoadingPage || isFeedPending || feedErrorKey === CONST.COMPANY_CARDS.FEED_LOAD_ERROR) && !!feedName;

    const isGB = countryByIp === CONST.COUNTRY.GB;
    const shouldShowGBDisclaimer = isGB && (isNoFeed || hasNoAssignedCard);

    // When we reach the medium screen width or the narrow layout is active,
    // we want to hide the table header and the middle column of the card rows, so that the content is not overlapping.
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const columns: Array<TableColumn<CompanyCardsTableColumnKey>> = [
        {
            key: 'member',
            label: translate('common.member'),
            sortable: true,
        },
        {
            key: 'card',
            label: translate('workspace.companyCards.card'),
            sortable: true,
        },
        {
            key: 'customCardName',
            label: translate('workspace.companyCards.cardName'),
            sortable: true,
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            styling: {
                containerStyles: [styles.justifyContentEnd, styles.pr3],
            },
        },
    ];

    const cardsData: WorkspaceCompanyCardTableItemData[] = isLoadingCards
        ? []
        : (companyCardEntries ?? [])
              .map(({cardName, encryptedCardNumber, isAssigned, assignedCard}) => {
                  const cardholder = assignedCard?.accountID ? personalDetails?.[assignedCard.accountID] : undefined;

                  return {
                      cardName,
                      keyForList: `${cardName}_${assignedCard?.cardID ?? 'unassigned'}_${encryptedCardNumber}`,
                      encryptedCardNumber,
                      customCardName: getCompanyCardCustomName(assignedCard?.cardID, sharedCardCustomNames, customCardNames) ?? getDefaultCardName(cardholder?.displayName ?? ''),
                      isCardDeleted: assignedCard?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                      disabled: assignedCard?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                      isAssigned,
                      assignedCard,
                      cardholder,
                      errors: isFeedConnectionBroken || assignedCard?.pendingFields?.lastScrape ? undefined : assignedCard?.errors,
                      pendingAction: assignedCard?.pendingAction,
                      onDismissError: () => resetFailedWorkspaceCompanyCardUnassignment(domainOrWorkspaceAccountID, bankName, assignedCard?.cardID),
                  };
              })
              .filter((item) => isOffline || item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const [selectedCardsFeedName, setSelectedCardsFeedName] = useState(feedName);
    const isSelectedCardsFeedCurrent = selectedCardsFeedName === feedName;
    const selectableCardKeySet = new Set(cardsData.filter((card) => !card.disabled).map((card) => card.keyForList));
    const selectedCardKeysForCurrentData = isSelectedCardsFeedCurrent ? selectedCardKeys.filter((key) => selectableCardKeySet.has(key)) : [];
    const areSelectedCardKeysPruned =
        selectedCardKeys.length === selectedCardKeysForCurrentData.length && selectedCardKeys.every((key, index) => key === selectedCardKeysForCurrentData.at(index));

    if (!isSelectedCardsFeedCurrent) {
        setSelectedCardsFeedName(feedName);
        if (selectedCardKeys.length > 0) {
            setSelectedCardKeys([]);
        }
    } else if (!areSelectedCardKeysPruned) {
        setSelectedCardKeys(selectedCardKeysForCurrentData);
    }

    const validSelectedCardKeys = selectedCardKeysForCurrentData;

    const clearCardSelection = () => setSelectedCardKeys([]);

    const keyExtractor = (item: WorkspaceCompanyCardTableItemData) => item.keyForList;

    const compareItems: CompareItemsCallback<WorkspaceCompanyCardTableItemData, CompanyCardsTableColumnKey> = (a, b, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (a.isAssigned && !b.isAssigned) {
            return 1 * orderMultiplier;
        }

        if (!a.isAssigned && b.isAssigned) {
            return -1 * orderMultiplier;
        }

        const cardNameSortingResult = localeCompare(a.cardName, b.cardName) * orderMultiplier;

        if (!a.isAssigned && !b.isAssigned) {
            return cardNameSortingResult;
        }

        if (activeSorting.columnKey === 'member') {
            const aMemberString = a.cardholder?.displayName ?? a.cardholder?.login ?? '';
            const bMemberString = b.cardholder?.displayName ?? b.cardholder?.login ?? '';

            return localeCompare(aMemberString, bMemberString) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'card') {
            return cardNameSortingResult;
        }

        if (activeSorting.columnKey === 'customCardName') {
            return localeCompare(a.customCardName ?? '', b.customCardName ?? '') * orderMultiplier;
        }

        return 0;
    };

    const assignedKeyword = translate('workspace.moreFeatures.companyCards.assignedCards').toLowerCase();
    const unassignedKeyword = translate('workspace.moreFeatures.companyCards.unassignedCards').toLowerCase();

    const isItemInSearch: IsItemInSearchCallback<WorkspaceCompanyCardTableItemData> = (item, searchString) => {
        const searchLower = searchString.toLowerCase();

        // Include assigned/unassigned cards if the user is typing "Unassigned" or "Assigned" (localized)
        const isAssignedCardMatch = assignedKeyword.startsWith(searchLower) && item.isAssigned;
        const isUnassignedCardMatch = unassignedKeyword.startsWith(searchLower) && !item.isAssigned;

        const searchTokens = [item.cardName, item.customCardName ?? '', item.cardholder?.displayName ?? '', item.cardholder?.login ?? ''];

        const matchingItems = tokenizedSearch([item], searchString, () => searchTokens);
        return matchingItems.length > 0 || isAssignedCardMatch || isUnassignedCardMatch;
    };

    const isItemInFilter: IsItemInFilterCallback<WorkspaceCompanyCardTableItemData> = (item, filterValues) => {
        if (!filterValues || filterValues.length === 0) {
            return true;
        }
        if (filterValues.includes('all')) {
            return true;
        }
        if (filterValues.includes('assigned') && item.isAssigned) {
            return true;
        }
        if (filterValues.includes('unassigned') && !item.isAssigned) {
            return true;
        }
        return false;
    };

    const filterConfig: FilterConfig = {
        status: {
            filterType: CONST.TABLES.FILTER_TYPE.SINGLE_SELECT,
            label: translate('common.status'),
            options: [
                {
                    label: translate('workspace.moreFeatures.companyCards.assignedCards'),
                    value: 'assigned',
                },
                {
                    label: translate('workspace.moreFeatures.companyCards.unassignedCards'),
                    value: 'unassigned',
                },
            ],
        },
    };

    const cardFeedIcon = (
        <CardFeedIcon
            key={feedName}
            iconProps={{
                additionalStyles: styles.cardIcon,
                width: shouldUseNarrowTableLayout ? variables.cardIconWidth : variables.cardIconSmallWidth,
                height: shouldUseNarrowTableLayout ? variables.cardIconHeight : variables.cardIconSmallHeight,
            }}
            selectedFeed={feedName}
            useSkeletonLoader
        />
    );

    const renderItem = ({item, index}: ListRenderItemInfo<WorkspaceCompanyCardTableItemData>) => (
        <WorkspaceCompanyCardTableItem
            key={item.keyForList}
            item={item}
            rowIndex={index}
            feedName={feedName}
            CardFeedIcon={cardFeedIcon}
            onAssignCard={onAssignCard}
            isAssigningCardDisabled={isAssigningCardDisabled}
            canWriteCompanyCards={canWriteCompanyCards}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );

    const illustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass']);
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: true,
    });

    const headerButtonsComponent = showTableHeaderButtons ? (
        <View style={styles.mb3}>
            <WorkspaceCompanyCardsTableHeaderButtons
                isLoading={isLoading}
                policyID={policyID}
                feedName={feedName}
                canWriteCompanyCards={canWriteCompanyCards}
                CardFeedIcon={cardFeedIcon}
            />
        </View>
    ) : undefined;

    const LoadingComponent = (
        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
            <ActivityIndicator
                color={theme.spinner}
                style={[styles.pl3]}
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                reasonAttributes={{
                    context: 'WorkspaceCompanyCardsTable',
                    isLoading,
                    isLoadingCards,
                }}
            />
        </View>
    );

    return (
        <Table
            ref={tableRef}
            data={cardsData}
            columns={columns}
            filters={filterConfig}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            isItemInFilter={isItemInFilter}
            initialSortColumn="member"
            selectionEnabled={showTableControls}
            selectedKeys={validSelectedCardKeys}
            onRowSelectionChange={setSelectedCardKeys}
            title={translate('workspace.common.companyCards')}
            ListEmptyComponent={isLoadingCards || hasPendingUnassignments ? LoadingComponent : <WorkspaceCompanyCardsFeedAddedEmptyPage shouldShowGBDisclaimer={shouldShowGBDisclaimer} />}
        >
            <WorkspaceCompanyCardsSelectionSearchPruner setSelectedCardKeys={setSelectedCardKeys} />
            {headerButtonsComponent}

            {isLoading && !feedErrorKey && <View style={[styles.flex1, bottomSafeAreaPaddingStyle]}>{LoadingComponent}</View>}

            {!isLoading && isFeedPending && !feedErrorKey && (
                <ScrollView addBottomSafeAreaPadding>
                    {isFeedPending && (
                        <View style={styles.flex1}>
                            <WorkspaceCompanyCardsFeedPendingPage />
                        </View>
                    )}
                </ScrollView>
            )}

            {!isLoading && isNoFeed && !feedErrorKey && (
                <ScrollView addBottomSafeAreaPadding>
                    <View style={styles.flex1}>
                        <WorkspaceCompanyCardPageEmptyState
                            policyID={policyID}
                            shouldShowGBDisclaimer={shouldShowGBDisclaimer}
                            canWriteCompanyCards={canWriteCompanyCards}
                        />
                    </View>
                </ScrollView>
            )}

            {!!feedErrorKey && !isLoading && (
                <ScrollView contentContainerStyle={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, bottomSafeAreaPaddingStyle]}>
                    <View style={[styles.alignItemsCenter]}>
                        <BlockingView
                            icon={illustrations.BrokenMagnifyingGlass}
                            iconWidth={variables.companyCardsPageNotFoundIconWidth}
                            iconHeight={variables.companyCardsPageNotFoundIconHeight}
                            title={feedErrorTitle ?? ''}
                            subtitle={feedErrorMessage ?? undefined}
                            containerStyle={[styles.companyCardsBlockingErrorViewContainer, styles.pb4]}
                            titleStyles={[styles.mb2, styles.mt8]}
                            subtitleStyle={styles.textSupporting}
                        />
                        <Button
                            text={translate('workspace.companyCards.error.tryAgain')}
                            isDisabled={isOffline}
                            onPress={feedErrorReloadAction}
                        />
                    </View>
                </ScrollView>
            )}

            {showCards && (
                <>
                    <WorkspaceCompanyCardsTableControls
                        policyID={policyID}
                        domainOrWorkspaceAccountID={domainOrWorkspaceAccountID}
                        bankName={bankName}
                        canWriteCompanyCards={canWriteCompanyCards}
                        clearCardSelection={clearCardSelection}
                    />
                    <Table.Header />
                    <Table.Body />
                </>
            )}
        </Table>
    );
}

export default WorkspaceCompanyCardsTable;
