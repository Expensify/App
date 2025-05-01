import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScrollView from '@components/ScrollView';
import DateSelectPopup from '@components/Search/FilterDropdowns/DateSelectPopup';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import type {SingleSelectItem} from '@components/Search/FilterDropdowns/SingleSelectPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import UserSelectPopup from '@components/Search/FilterDropdowns/UserSelectPopup';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchGroupBy, SearchQueryJSON, SingularSearchStatus} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildFilterFormValuesFromQuery, buildSearchQueryString} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type {SearchHeaderOptionValue} from './SearchPageHeader';

type SearchFiltersBarProps = {
    queryJSON: SearchQueryJSON;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
};

const typeOptions: Array<SingleSelectItem<SearchDataTypes>> = [
    {translation: 'common.expense', value: CONST.SEARCH.DATA_TYPES.EXPENSE},
    {translation: 'common.chat', value: CONST.SEARCH.DATA_TYPES.CHAT},
    {translation: 'common.invoice', value: CONST.SEARCH.DATA_TYPES.INVOICE},
    {translation: 'common.trip', value: CONST.SEARCH.DATA_TYPES.TRIP},
    {translation: 'common.task', value: CONST.SEARCH.DATA_TYPES.TASK},
];

const expenseStatusOptions: Array<MultiSelectItem<SingularSearchStatus>> = [
    {translation: 'common.unreported', value: CONST.SEARCH.STATUS.EXPENSE.UNREPORTED},
    {translation: 'common.drafts', value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
    {translation: 'common.outstanding', value: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING},
    {translation: 'iou.approved', value: CONST.SEARCH.STATUS.EXPENSE.APPROVED},
    {translation: 'iou.done', value: CONST.SEARCH.STATUS.EXPENSE.DONE},
    {translation: 'iou.settledExpensify', value: CONST.SEARCH.STATUS.EXPENSE.PAID},
];

const expenseReportStatusOptions: Array<MultiSelectItem<SingularSearchStatus>> = [
    {translation: 'common.drafts', value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
    {translation: 'common.outstanding', value: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING},
    {translation: 'iou.approved', value: CONST.SEARCH.STATUS.EXPENSE.APPROVED},
    {translation: 'iou.done', value: CONST.SEARCH.STATUS.EXPENSE.DONE},
    {translation: 'iou.settledExpensify', value: CONST.SEARCH.STATUS.EXPENSE.PAID},
];

const chatStatusOptions: Array<MultiSelectItem<SingularSearchStatus>> = [
    {translation: 'common.unread', value: CONST.SEARCH.STATUS.CHAT.UNREAD},
    {translation: 'common.sent', value: CONST.SEARCH.STATUS.CHAT.SENT},
    {translation: 'common.attachments', value: CONST.SEARCH.STATUS.CHAT.ATTACHMENTS},
    {translation: 'common.links', value: CONST.SEARCH.STATUS.CHAT.LINKS},
    {translation: 'search.filters.pinned', value: CONST.SEARCH.STATUS.CHAT.PINNED},
];

const invoiceStatusOptions: Array<MultiSelectItem<SingularSearchStatus>> = [
    {translation: 'common.outstanding', value: CONST.SEARCH.STATUS.INVOICE.OUTSTANDING},
    {translation: 'iou.settledExpensify', value: CONST.SEARCH.STATUS.INVOICE.PAID},
];

const tripStatusOptions: Array<MultiSelectItem<SingularSearchStatus>> = [
    {translation: 'search.filters.current', value: CONST.SEARCH.STATUS.TRIP.CURRENT},
    {translation: 'search.filters.past', value: CONST.SEARCH.STATUS.TRIP.PAST},
];

const taskStatusOptions: Array<MultiSelectItem<SingularSearchStatus>> = [
    {translation: 'common.outstanding', value: CONST.SEARCH.STATUS.TASK.OUTSTANDING},
    {translation: 'search.filters.completed', value: CONST.SEARCH.STATUS.TASK.COMPLETED},
];

function getStatusOptions(type: SearchDataTypes, groupBy: SearchGroupBy | undefined) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
            return expenseStatusOptions;
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return chatStatusOptions;
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return invoiceStatusOptions;
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return tripStatusOptions;
        case CONST.SEARCH.DATA_TYPES.TASK:
            return taskStatusOptions;
        default:
            return groupBy === CONST.SEARCH.GROUP_BY.REPORTS ? expenseReportStatusOptions : expenseStatusOptions;
    }
}

function SearchFiltersBar({queryJSON, headerButtonsOptions}: SearchFiltersBarProps) {
    const {hash, type, groupBy, status} = queryJSON;
    const scrollRef = useRef<RNScrollView>(null);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();

    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectedTransactions, setExportMode, isExportMode, shouldShowExportModeOption, shouldShowFiltersBarLoading} = useSearchContext();

    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [currencyList = {}] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE, {canBeMissing: true});
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {canBeMissing: true});

    const taxRates = getAllTaxRates();
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions ?? {}), [selectedTransactions]);

    const hasErrors = Object.keys(currentSearchResults?.errors ?? {}).length > 0 && !isOffline;
    const shouldShowSelectedDropdown = headerButtonsOptions.length > 0 && (!shouldUseNarrowLayout || (!!selectionMode && selectionMode.isEnabled));

    const openAdvancedFilters = useCallback(() => {
        const filterFormValues = buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTagsLists, currencyList, personalDetails, allCards, reports, taxRates);
        updateAdvancedFilters(filterFormValues);

        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [allCards, currencyList, personalDetails, policyCategories, policyTagsLists, queryJSON, reports, taxRates]);

    const typeComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const value = typeOptions.find((option) => option.value === type) ?? null;

            return (
                <SingleSelectPopup
                    value={value}
                    items={typeOptions}
                    closeOverlay={closeOverlay}
                    onChange={(item) => {
                        if (!item) {
                            return;
                        }
                        const query = buildSearchQueryString({...queryJSON, type: item?.value});
                        Navigation.setParams({q: query});
                    }}
                />
            );
        },
        [queryJSON, type],
    );

    const statusComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const items = getStatusOptions(type, groupBy);
            const selected = Array.isArray(status) ? items.filter((option) => status.includes(option.value)) : items.find((option) => option.value === status) ?? [];
            const value = [selected].flat();

            return (
                <MultiSelectPopup
                    items={items}
                    value={value}
                    closeOverlay={closeOverlay}
                    onChange={(selectedItems) => {
                        const newStatus = selectedItems.length ? selectedItems.map((i) => i.value) : CONST.SEARCH.STATUS.EXPENSE.ALL;
                        const query = buildSearchQueryString({...queryJSON, status: newStatus});
                        Navigation.setParams({q: query});
                    }}
                />
            );
        },
        [groupBy, queryJSON, status, type],
    );

    const datePickerComponent = useCallback(({closeOverlay}: PopoverComponentProps) => {
        return <DateSelectPopup />;
    }, []);

    const userPickerComponent = useCallback(({closeOverlay}: PopoverComponentProps) => {
        return <UserSelectPopup />;
    }, []);

    const filters = useMemo(() => {
        const typeValue = typeOptions.find((option) => option.value === type) ?? null;
        const statusValue = getStatusOptions(type, groupBy).filter((option) => status.includes(option.value));

        const filterList = [
            {
                label: translate('common.type'),
                PopoverComponent: typeComponent,
                value: typeValue?.translation ? translate(typeValue.translation) : null,
            },
            {
                label: translate('common.status'),
                PopoverComponent: statusComponent,
                value: statusValue.map((option) => translate(option.translation)),
            },
            {
                label: translate('common.date'),
                PopoverComponent: datePickerComponent,
                value: null,
            },
            {
                label: translate('common.from'),
                PopoverComponent: userPickerComponent,
                value: null,
            },
        ];

        return filterList;
    }, [type, groupBy, translate, typeComponent, statusComponent, datePickerComponent, userPickerComponent, status]);

    if (hasErrors) {
        return null;
    }

    if (shouldShowFiltersBarLoading) {
        return <SearchFiltersSkeleton shouldAnimate />;
    }

    const selectionButtonText = isExportMode ? translate('search.exportAll.allMatchingItemsSelected') : translate('workspace.common.selected', {count: selectedTransactionsKeys.length});

    return (
        <View style={[shouldShowSelectedDropdown && styles.ph5, styles.mb2, styles.searchFiltersBarContainer]}>
            {shouldShowSelectedDropdown ? (
                <View style={styles.flexRow}>
                    <ButtonWithDropdownMenu
                        onPress={() => null}
                        shouldAlwaysShowDropdownMenu
                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                        customText={selectionButtonText}
                        options={headerButtonsOptions}
                        isSplitButton={false}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                        }}
                        popoverHorizontalOffsetType={CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT}
                    />
                    {!isExportMode && shouldShowExportModeOption && (
                        <View style={[styles.button, styles.bgTransparent]}>
                            <Button
                                link
                                shouldUseDefaultHover={false}
                                innerStyles={[styles.p0, StyleUtils.getResetStyle<ViewStyle>(['height', 'minHeight'])]}
                                onPress={() => setExportMode(true)}
                                text={translate('search.exportAll.selectAllMatchingItems')}
                            />
                        </View>
                    )}
                </View>
            ) : (
                <ScrollView
                    style={[styles.flexRow, styles.overflowScroll, styles.flexGrow0]}
                    contentContainerStyle={[styles.flexRow, styles.flexGrow0, styles.gap2, styles.ph5]}
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    {filters.map((filter) => (
                        <DropdownButton
                            key={filter.label}
                            label={filter.label}
                            value={filter.value}
                            PopoverComponent={filter.PopoverComponent}
                        />
                    ))}

                    <Button
                        link
                        small
                        text={translate('search.filtersHeader')}
                        textStyles={[styles.textMicroBold]}
                        iconFill={theme.link}
                        iconHoverFill={theme.linkHover}
                        icon={Expensicons.Filter}
                        onPress={openAdvancedFilters}
                    />
                </ScrollView>
            )}
        </View>
    );
}

SearchFiltersBar.displayName = 'SearchFiltersBar';

export default SearchFiltersBar;
