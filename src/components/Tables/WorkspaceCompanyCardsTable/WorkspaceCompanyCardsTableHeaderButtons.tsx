import AccountSwitcherSkeletonView from '@components/AccountSwitcherSkeletonView';
import Button from '@components/Button';
import FeedSelector from '@components/FeedSelector';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import BasePopup from '@components/Search/FilterDropdowns/BasePopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Table from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';
import type {ActiveSorting} from '@components/Table/types';

import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useCardFeeds from '@hooks/useCardFeeds';
import {useCurrencyListState} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLinkedPolicyName} from '@libs/CardFeedUtils';
import {getCompanyFeeds, getCustomOrFormattedFeedName, getPlaidCountry, getPlaidInstitutionId, isCustomFeed} from '@libs/CardUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import Navigation from '@navigation/Navigation';

import {setAddNewCompanyCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';

import getShouldShowBrokenConnectionError from './getShouldShowBrokenConnectionError';

const FEED_SELECTOR_SKELETON_WIDTH = 289;
const DEFAULT_COMPANY_CARDS_SORTING: ActiveSorting<string> = {
    columnKey: 'member',
    order: CONST.SEARCH.SORT_ORDER.ASC,
};

type WorkspaceCompanyCardsSortByPopupProps = {
    columns: Array<{key: string; label: string; sortable: boolean}>;
    pendingSorting: ActiveSorting<string>;
    setPendingSorting: React.Dispatch<React.SetStateAction<ActiveSorting<string>>>;
    onSortOrderPress: () => void;
    onBackButtonPress: () => void;
    onApply: () => void;
    onReset: () => void;
};

type WorkspaceCompanyCardsTableHeaderButtonsProps = {
    /** Current policy id */
    policyID: string;

    /** Currently selected feed */
    feedName: CompanyCardFeedWithDomainID;

    /** Whether the feed is loading */
    isLoading: boolean;

    /** Whether to show the table controls */
    showTableControls: boolean;

    /** Whether the current member can edit company cards */
    canWriteCompanyCards: boolean;

    /** Card feed icon */
    CardFeedIcon: React.ReactNode;

    /** Controls to show in place of the default table controls */
    children?: React.ReactNode;
};

type WorkspaceCompanyCardsPopupProps = {
    closeOverlay: () => void;
};

function WorkspaceCompanyCardsFilterPopup({closeOverlay}: WorkspaceCompanyCardsPopupProps) {
    const {
        filterConfig,
        activeFilters,
        tableMethods: {updateFilter},
    } = useTableContext();

    const statusFilterConfig = filterConfig?.status;
    if (!statusFilterConfig) {
        return null;
    }

    const currentFilter = activeFilters.status;
    const selectedOption =
        statusFilterConfig.options.find((option) => option.value === currentFilter) ?? statusFilterConfig.options.find((option) => option.value === statusFilterConfig.default);
    const selectedItem = selectedOption ? {text: selectedOption.label, value: selectedOption.value} : undefined;

    return (
        <SingleSelectPopup
            items={statusFilterConfig.options.map((option) => ({
                text: option.label,
                value: option.value,
            }))}
            value={selectedItem}
            defaultValue={statusFilterConfig.default}
            closeOverlay={closeOverlay}
            onChange={(item) => updateFilter({key: 'status', value: item?.value ?? statusFilterConfig.default})}
        />
    );
}

function renderWorkspaceCompanyCardsFilterPopup({closeOverlay}: WorkspaceCompanyCardsPopupProps) {
    return <WorkspaceCompanyCardsFilterPopup closeOverlay={closeOverlay} />;
}

function WorkspaceCompanyCardsFilterButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <DropdownButton
            label={translate('search.filtersHeader')}
            value={null}
            medium
            innerStyles={styles.gap2}
            labelStyle={styles.fontSizeLabel}
            caretWrapperStyle={styles.gap2}
            PopoverComponent={renderWorkspaceCompanyCardsFilterPopup}
        />
    );
}

function WorkspaceCompanyCardsSortByPopup({columns, pendingSorting, setPendingSorting, onSortOrderPress, onBackButtonPress, onApply, onReset}: WorkspaceCompanyCardsSortByPopupProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const selectedColumn = columns.find((column) => column.key === pendingSorting.columnKey) ?? columns.at(0);

    const options = columns.map((column) => ({
        text: column.label,
        keyForList: column.key,
        isSelected: column.key === selectedColumn?.key,
    }));

    const updateSelectedItem = (item: ListItem) => {
        setPendingSorting((previousSorting) => ({
            ...previousSorting,
            columnKey: item.keyForList,
        }));
    };

    return (
        <BasePopup
            label={translate('search.display.sortBy')}
            onReset={onReset}
            onApply={onApply}
            onBackButtonPress={onBackButtonPress}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_SINGLE_SELECT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_SINGLE_SELECT}
        >
            <MenuItemWithTopDescription
                shouldShowRightIcon
                description={translate('search.display.sortOrder')}
                title={translate(`search.filters.sortOrder.${pendingSorting.order}`)}
                onPress={onSortOrderPress}
            />
            <View style={styles.dividerLine} />
            <SelectionList
                data={options}
                shouldSingleExecuteRowSelect
                ListItem={SingleSelectListItem}
                onSelectRow={updateSelectedItem}
                style={{contentContainerStyle: [styles.pb0]}}
            />
        </BasePopup>
    );
}

function WorkspaceCompanyCardsDisplayPopover({closeOverlay}: WorkspaceCompanyCardsPopupProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {
        columns,
        activeSorting,
        tableMethods: {updateSorting},
    } = useTableContext();
    const [selectedDisplayFilter, setSelectedDisplayFilter] = useState<'sortBy' | 'sortOrder' | null>(null);
    const [pendingSorting, setPendingSorting] = useState<ActiveSorting<string>>(DEFAULT_COMPANY_CARDS_SORTING);

    const sortableColumns = columns
        .filter((column) => column.sortable && column.key !== 'actions')
        .map((column) => ({
            key: column.key,
            label: column.label,
            sortable: column.sortable,
        }));

    const activeColumn = sortableColumns.find((column) => column.key === activeSorting.columnKey) ?? sortableColumns.at(0);
    const activeOrder = activeSorting.order ?? DEFAULT_COMPANY_CARDS_SORTING.order;
    const sortByTitle = activeColumn ? `${activeColumn.label} ${CONST.DOT_SEPARATOR} ${translate(`search.filters.sortOrder.${activeOrder}`)}` : undefined;

    const resetSorting = (closeDisplayMenu: () => void) => {
        setPendingSorting(DEFAULT_COMPANY_CARDS_SORTING);
        updateSorting(DEFAULT_COMPANY_CARDS_SORTING);
        setSelectedDisplayFilter(null);
        closeDisplayMenu();
    };

    const applySorting = (closeDisplayMenu: () => void) => {
        updateSorting(pendingSorting);
        setSelectedDisplayFilter(null);
        closeDisplayMenu();
    };

    const openSortBy = () => {
        setPendingSorting({
            columnKey: activeSorting.columnKey ?? DEFAULT_COMPANY_CARDS_SORTING.columnKey,
            order: activeSorting.order ?? DEFAULT_COMPANY_CARDS_SORTING.order,
        });
        setSelectedDisplayFilter('sortBy');
    };

    const closeDisplayOverlay = () => {
        setSelectedDisplayFilter(null);
        closeOverlay();
    };

    if (selectedDisplayFilter === 'sortBy') {
        return (
            <WorkspaceCompanyCardsSortByPopup
                columns={sortableColumns}
                pendingSorting={pendingSorting}
                setPendingSorting={setPendingSorting}
                onSortOrderPress={() => setSelectedDisplayFilter('sortOrder')}
                onBackButtonPress={() => setSelectedDisplayFilter(null)}
                onApply={() => applySorting(closeDisplayOverlay)}
                onReset={() => resetSorting(closeDisplayOverlay)}
            />
        );
    }

    if (selectedDisplayFilter === 'sortOrder') {
        const selectedOrder = {
            text: translate(`search.filters.sortOrder.${pendingSorting.order}`),
            value: pendingSorting.order,
        };

        return (
            <SingleSelectPopup
                items={[
                    {text: translate(`search.filters.sortOrder.${CONST.SEARCH.SORT_ORDER.ASC}`), value: CONST.SEARCH.SORT_ORDER.ASC},
                    {text: translate(`search.filters.sortOrder.${CONST.SEARCH.SORT_ORDER.DESC}`), value: CONST.SEARCH.SORT_ORDER.DESC},
                ]}
                value={selectedOrder}
                label={translate('search.display.sortOrder')}
                defaultValue={CONST.SEARCH.SORT_ORDER.ASC}
                onBackButtonPress={() => setSelectedDisplayFilter('sortBy')}
                closeOverlay={closeDisplayOverlay}
                onChange={(item) => {
                    const nextSorting = {
                        ...pendingSorting,
                        order: item?.value ?? DEFAULT_COMPANY_CARDS_SORTING.order,
                    };
                    setPendingSorting(nextSorting);
                    updateSorting(nextSorting);
                }}
            />
        );
    }

    return (
        <ScrollView contentContainerStyle={[styles.pv4]}>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                description={translate('search.display.sortBy')}
                title={sortByTitle}
                onPress={openSortBy}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_SORT_BY}
            />
        </ScrollView>
    );
}

function renderWorkspaceCompanyCardsDisplayPopover({closeOverlay}: WorkspaceCompanyCardsPopupProps) {
    return <WorkspaceCompanyCardsDisplayPopover closeOverlay={closeOverlay} />;
}

function WorkspaceCompanyCardsDisplayButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <DropdownButton
            label={translate('search.display.label')}
            value={null}
            medium
            innerStyles={styles.gap2}
            labelStyle={styles.fontSizeLabel}
            caretWrapperStyle={styles.gap2}
            PopoverComponent={renderWorkspaceCompanyCardsDisplayPopover}
        />
    );
}

function WorkspaceCompanyCardsTableHeaderButtons({
    policyID,
    feedName,
    isLoading,
    showTableControls,
    canWriteCompanyCards,
    CardFeedIcon,
    children,
}: WorkspaceCompanyCardsTableHeaderButtonsProps) {
    const styles = useThemeStyles();

    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {currencyList} = useCurrencyListState();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'DotIndicator']);

    const [cardFeeds] = useCardFeeds(policyID);
    const policy = usePolicy(policyID);

    const formattedFeedName = feedName ? getCustomOrFormattedFeedName(translate, feedName, cardFeeds?.[feedName]?.customFeedName) : undefined;
    const isCommercialFeed = isCustomFeed(feedName);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const currentFeedData = feedName ? companyFeeds?.[feedName] : undefined;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${currentFeedData?.domainID}`);
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const {cardFeedErrors, shouldShowRbrForFeedNameWithDomainID} = useCardFeedErrors();
    const feedErrors = cardFeedErrors[feedName];
    const hasOtherFeedWithRBR = Object.keys(companyFeeds ?? {}).some((feed) => feed !== feedName && shouldShowRbrForFeedNameWithDomainID[feed]);
    const shouldShowFeedSelectorRBR = hasOtherFeedWithRBR || !!feedErrors?.hasWorkspaceErrors;
    const shouldShowBrokenConnectionError = getShouldShowBrokenConnectionError(feedName, feedErrors);

    const openBankConnection = () => {
        if (!feedName) {
            return;
        }

        const institutionId = getPlaidInstitutionId(feedName);
        const initialStep = institutionId ? CONST.COMPANY_CARD.STEP.PLAID_CONNECTION : CONST.COMPANY_CARD.STEP.BANK_CONNECTION;

        // For Plaid feeds, seed selectedCountry so PlaidConnectionStep can start the login flow
        if (institutionId) {
            const country = getPlaidCountry(policy?.outputCurrency, currencyList, countryByIp);
            setAddNewCompanyCardStepAndData({
                data: {
                    selectedCountry: country,
                },
            });
        }

        setAssignCardStepAndData({currentStep: initialStep});

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION.getRoute(policyID ?? String(CONST.DEFAULT_NUMBER_ID), feedName));
        });
    };

    const isCsvFeed = feedName?.includes(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV);
    const firstPart = translate(isCommercialFeed ? 'workspace.companyCards.commercialFeed' : 'workspace.companyCards.directFeed');
    const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;
    const policyName = getLinkedPolicyName(allPolicies, currentFeedData?.preferredPolicy, policyID, policy?.name);
    const secondPart = ` (${domainName ?? policyName})`;
    const supportingText = isCsvFeed ? translate('cardPage.csvCardDescription') : `${firstPart}${secondPart}`;

    const shouldShowNarrowLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'WorkspaceCompanyCardsTableHeaderButtons',
        isLoading,
    };

    return (
        <View>
            <View style={[styles.w100, styles.ph5, styles.gap5, styles.pb2, !shouldShowNarrowLayout && [styles.pv2, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]]}>
                {isLoading ? (
                    <AccountSwitcherSkeletonView
                        avatarSize={CONST.AVATAR_SIZE.DEFAULT}
                        width={FEED_SELECTOR_SKELETON_WIDTH}
                        style={[shouldShowNarrowLayout ? [styles.mb2, styles.mt2] : [styles.mb11, styles.mt2], styles.mw100]}
                        reasonAttributes={skeletonReasonAttributes}
                    />
                ) : (
                    <FeedSelector
                        onFeedSelect={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID ?? String(CONST.DEFAULT_NUMBER_ID)))}
                        CardFeedIcon={CardFeedIcon}
                        feedName={formattedFeedName}
                        supportingText={supportingText}
                        shouldShowRBR={shouldShowFeedSelectorRBR}
                    />
                )}

                {!isLoading && canWriteCompanyCards && (
                    <Button
                        success={false}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID ?? String(CONST.DEFAULT_NUMBER_ID)))}
                        text={translate('common.settings')}
                        icon={icons.Gear}
                        style={shouldShowNarrowLayout ? styles.w100 : undefined}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.SETTINGS_BUTTON}
                    />
                )}
            </View>
            {!isLoading && showTableControls && (
                <View
                    style={[
                        styles.w100,
                        styles.ph5,
                        styles.pb2,
                        styles.gap3,
                        shouldShowNarrowLayout ? [styles.flexColumn, styles.alignItemsStretch] : [styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween],
                    ]}
                >
                    {children ?? (
                        <>
                            <View style={[styles.mnw200, shouldShowNarrowLayout && styles.w100]}>
                                <Table.SearchBar
                                    style={[styles.mh0, styles.mb0]}
                                    label={translate('workspace.companyCards.findCompanyCard')}
                                />
                            </View>

                            <View style={[styles.flexRow, styles.gap3, shouldShowNarrowLayout && styles.w100]}>
                                <View style={shouldShowNarrowLayout ? styles.flex1 : undefined}>
                                    <WorkspaceCompanyCardsFilterButton />
                                </View>
                                <View style={shouldShowNarrowLayout ? styles.flex1 : undefined}>
                                    <WorkspaceCompanyCardsDisplayButton />
                                </View>
                            </View>
                        </>
                    )}
                </View>
            )}
            {!isLoading && canWriteCompanyCards && shouldShowBrokenConnectionError && (
                <View style={[styles.flexRow, styles.ph5, styles.alignItemsCenter]}>
                    <Icon
                        src={icons.DotIndicator}
                        fill={theme.danger}
                        additionalStyles={styles.mr1}
                    />
                    <View style={[styles.offlineFeedbackText, styles.pr5, styles.flexRow, styles.w100]}>
                        <RenderHTML
                            html={translate('workspace.companyCards.brokenConnectionError')}
                            onLinkPress={openBankConnection}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

export type {WorkspaceCompanyCardsTableHeaderButtonsProps};
export default WorkspaceCompanyCardsTableHeaderButtons;
