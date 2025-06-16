import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScrollView from '@components/ScrollView';
import type {DateSelectPopupValue} from '@components/Search/FilterDropdowns/DateSelectPopup';
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
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {canSendInvoice, getAllTaxRates} from '@libs/PolicyUtils';
import {hasInvoiceReports} from '@libs/ReportUtils';
import {buildFilterFormValuesFromQuery, buildQueryStringFromFilterFormValues, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
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
    {translation: 'iou.settledExpensify', value: CONST.SEARCH.STATUS.EXPENSE.PAID},
    {translation: 'iou.done', value: CONST.SEARCH.STATUS.EXPENSE.DONE},
];

const expenseReportStatusOptions: Array<MultiSelectItem<SingularSearchStatus>> = [
    {translation: 'common.drafts', value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
    {translation: 'common.outstanding', value: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING},
    {translation: 'iou.approved', value: CONST.SEARCH.STATUS.EXPENSE.APPROVED},
    {translation: 'iou.settledExpensify', value: CONST.SEARCH.STATUS.EXPENSE.PAID},
    {translation: 'iou.done', value: CONST.SEARCH.STATUS.EXPENSE.DONE},
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
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return chatStatusOptions;
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return invoiceStatusOptions;
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return tripStatusOptions;
        case CONST.SEARCH.DATA_TYPES.TASK:
            return taskStatusOptions;
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
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

    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {selectedTransactions, setExportMode, isExportMode, shouldShowExportModeOption, shouldShowFiltersBarLoading} = useSearchContext();

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [currencyList = {}] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});
    const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {canBeMissing: true});
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE, {canBeMissing: true});
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {canBeMissing: true});

    const taxRates = getAllTaxRates();
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions ?? {}), [selectedTransactions]);

    const hasErrors = Object.keys(currentSearchResults?.errors ?? {}).length > 0 && !isOffline;
    const shouldShowSelectedDropdown = headerButtonsOptions.length > 0 && (!shouldUseNarrowLayout || (!!selectionMode && selectionMode.isEnabled));

    const filterFormValues = useMemo(() => {
        return buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTagsLists, currencyList, personalDetails, allCards, reports, taxRates);
    }, [allCards, currencyList, personalDetails, policyCategories, policyTagsLists, queryJSON, reports, taxRates]);

    // We need to create a stable key for filterFormValues so that we don't infinitely
    // re-render components that access all of the filterFormValues. This is due to the way
    // that react calculates diffs (it doesn't know how to compare objects).
    const filterFormValuesKey = JSON.stringify(filterFormValues);

    const openAdvancedFilters = useCallback(() => {
        updateAdvancedFilters(filterFormValues);
        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS);

        // Disable exhaustive deps because we use filterFormValuesKey as the dependency, which is a stable key based on filterFormValues
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterFormValuesKey]);

    const typeComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const value = typeOptions.find((option) => option.value === type) ?? null;

            const onChange = (item: SingleSelectItem<SearchDataTypes> | null) => {
                const hasTypeChanged = item?.value !== type;
                const newType = item?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE;
                // If the type has changed, reset the status so we dont have an invalid status selected
                const newStatus = hasTypeChanged ? CONST.SEARCH.STATUS.EXPENSE.ALL : status;
                const newGroupBy = hasTypeChanged ? undefined : groupBy;
                const query = buildSearchQueryString({...queryJSON, type: newType, status: newStatus, groupBy: newGroupBy});
                Navigation.setParams({q: query});
            };

            // Remove the invoice option if the user is not allowed to send invoices
            let visibleOptions = typeOptions;
            if (!canSendInvoice(allPolicies, session?.email) && !hasInvoiceReports()) {
                visibleOptions = visibleOptions.filter((typeOption) => typeOption.value !== CONST.SEARCH.DATA_TYPES.INVOICE);
            }

            return (
                <SingleSelectPopup
                    label={translate('common.type')}
                    value={value}
                    items={visibleOptions}
                    closeOverlay={closeOverlay}
                    onChange={onChange}
                />
            );
        },
        [allPolicies, groupBy, queryJSON, session?.email, status, translate, type],
    );

    const statusComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const items = getStatusOptions(type, groupBy);
            const selected = Array.isArray(status) ? items.filter((option) => status.includes(option.value)) : (items.find((option) => option.value === status) ?? []);
            const value = [selected].flat();

            const onChange = (selectedItems: Array<MultiSelectItem<SingularSearchStatus>>) => {
                const newStatus = selectedItems.length ? selectedItems.map((i) => i.value) : '';
                const query = buildSearchQueryString({...queryJSON, status: newStatus});
                Navigation.setParams({q: query});
            };

            return (
                <MultiSelectPopup
                    label={translate('common.status')}
                    items={items}
                    value={value}
                    closeOverlay={closeOverlay}
                    onChange={onChange}
                />
            );
        },
        [groupBy, queryJSON, status, translate, type],
    );

    const datePickerComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const value: DateSelectPopupValue = {
                [CONST.SEARCH.DATE_MODIFIERS.AFTER]: filterFormValues.dateAfter ?? null,
                [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: filterFormValues.dateBefore ?? null,
                [CONST.SEARCH.DATE_MODIFIERS.ON]: filterFormValues.dateOn ?? null,
            };

            const onChange = (selectedDates: DateSelectPopupValue) => {
                const newFilterFormValues = {
                    ...filterFormValues,
                    ...queryJSON,
                    dateAfter: selectedDates[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? undefined,
                    dateBefore: selectedDates[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? undefined,
                    dateOn: selectedDates[CONST.SEARCH.DATE_MODIFIERS.ON] ?? undefined,
                };

                const filterString = buildQueryStringFromFilterFormValues(newFilterFormValues);
                const newJSON = buildSearchQueryJSON(filterString);
                const queryString = buildSearchQueryString(newJSON);

                Navigation.setParams({q: queryString});
            };

            return (
                <DateSelectPopup
                    closeOverlay={closeOverlay}
                    value={value}
                    onChange={onChange}
                />
            );
        },
        // Disable exhaustive deps because we use filterFormValuesKey as the dependency, which is a stable key based on filterFormValues
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filterFormValuesKey, queryJSON],
    );

    const userPickerComponent = useCallback(
        ({closeOverlay}: PopoverComponentProps) => {
            const value = filterFormValues.from ?? [];

            return (
                <UserSelectPopup
                    value={value}
                    closeOverlay={closeOverlay}
                    onChange={(selectedUsers) => {
                        const newFilterFormValues = {...filterFormValues, from: selectedUsers};
                        const queryString = buildQueryStringFromFilterFormValues(newFilterFormValues);
                        Navigation.setParams({q: queryString});
                    }}
                />
            );
        },
        // Disable exhaustive deps because we use filterFormValuesKey as the dependency, which is a stable key based on filterFormValues
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filterFormValuesKey],
    );

    /**
     * Builds the list of all filter chips to be displayed in the
     * filter bar
     */
    const filters = useMemo(() => {
        const typeValue = typeOptions.find((option) => option.value === type) ?? null;
        const statusValue = getStatusOptions(type, groupBy).filter((option) => status.includes(option.value));
        const dateValue = [
            filterFormValues.dateAfter ? `${translate('common.after')} ${DateUtils.formatToReadableString(filterFormValues.dateAfter)}` : null,
            filterFormValues.dateBefore ? `${translate('common.before')} ${DateUtils.formatToReadableString(filterFormValues.dateBefore)}` : null,
            filterFormValues.dateOn ? `${translate('common.on')} ${DateUtils.formatToReadableString(filterFormValues.dateOn)}` : null,
        ].filter(Boolean) as string[];
        const fromValue = filterFormValues.from?.map((accountID) => personalDetails?.[accountID]?.displayName ?? accountID) ?? [];

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
                value: dateValue,
            },
            {
                label: translate('common.from'),
                PopoverComponent: userPickerComponent,
                value: fromValue,
            },
        ];

        return filterList;
    }, [
        type,
        groupBy,
        filterFormValues.from,
        filterFormValues.dateAfter,
        filterFormValues.dateBefore,
        filterFormValues.dateOn,
        translate,
        typeComponent,
        statusComponent,
        datePickerComponent,
        userPickerComponent,
        status,
        personalDetails,
    ]);

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
                <View style={[styles.flexRow, styles.gap3]}>
                    <ButtonWithDropdownMenu
                        onPress={() => null}
                        shouldAlwaysShowDropdownMenu
                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.SMALL}
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
                        <Button
                            link
                            small
                            shouldUseDefaultHover={false}
                            innerStyles={styles.p0}
                            onPress={() => setExportMode(true)}
                            text={translate('search.exportAll.selectAllMatchingItems')}
                        />
                    )}
                </View>
            ) : (
                <ScrollView
                    horizontal
                    keyboardShouldPersistTaps="always"
                    style={[styles.flexRow, styles.overflowScroll, styles.flexGrow0]}
                    contentContainerStyle={[styles.flexRow, styles.flexGrow0, styles.gap2, styles.ph5]}
                    ref={scrollRef}
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
                        shouldUseDefaultHover={false}
                        text={translate('search.filtersHeader')}
                        iconFill={theme.link}
                        iconHoverFill={theme.linkHover}
                        icon={Expensicons.Filter}
                        textStyles={[styles.textMicroBold]}
                        onPress={openAdvancedFilters}
                    />
                </ScrollView>
            )}
        </View>
    );
}

SearchFiltersBar.displayName = 'SearchFiltersBar';

export default SearchFiltersBar;
