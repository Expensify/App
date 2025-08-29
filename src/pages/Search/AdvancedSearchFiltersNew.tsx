import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScrollView from '@components/ScrollView';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWorkspaceList from '@hooks/useWorkspaceList';
import {clearAllFilters, saveSearch} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates, getCleanedTagName} from '@libs/PolicyUtils';
import {buildCannedSearchQuery, buildQueryStringFromFilterFormValues, buildSearchQueryJSON, isCannedSearchQuery, isSearchDatePreset, sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import {getStatusOptions} from '@libs/SearchUIUtils';
import {getFiltersGroupedBySection, type FilterConfig, type FilterDependencies} from '@libs/SearchFilters/filterConfig';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {DATE_FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';
import type {Policy} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type SectionType = {
    titleTranslationKey: TranslationPaths;
    items: Array<{
        key: string;
        title: string | undefined;
        description: string;
        onPress: () => void;
    }>;
};

// Filter display title functions from original implementation
function getFilterDisplayTitle(
    filters: Partial<SearchAdvancedFiltersForm>,
    filterKey: string,
    translate: ReturnType<typeof useLocalize>['translate'],
    localeCompare: ReturnType<typeof useLocalize>['localeCompare'],
) {
    if (DATE_FILTER_KEYS.includes(filterKey as any)) {
        const keyOn = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.ON}` as keyof SearchAdvancedFiltersForm;
        const keyAfter = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}` as keyof SearchAdvancedFiltersForm;
        const keyBefore = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}` as keyof SearchAdvancedFiltersForm;
        const dateOn = filters[keyOn];
        const dateAfter = filters[keyAfter];
        const dateBefore = filters[keyBefore];
        const dateValue = [];

        if (dateOn) {
            dateValue.push(isSearchDatePreset(dateOn) ? translate(`search.filters.date.presets.${dateOn}`) : translate('search.filters.date.on', {date: dateOn}));
        }

        if (dateAfter) {
            dateValue.push(translate('search.filters.date.after', {date: dateAfter}));
        }

        if (dateBefore) {
            dateValue.push(translate('search.filters.date.before', {date: dateBefore}));
        }

        return dateValue.join(', ');
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL) {
        const lessThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}` as keyof SearchAdvancedFiltersForm;
        const greaterThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}` as keyof SearchAdvancedFiltersForm;

        const lessThan = filters[lessThanKey];
        const greaterThan = filters[greaterThanKey];

        if (lessThan && greaterThan) {
            return translate('search.filters.amount.between', {
                lessThan: convertToDisplayStringWithoutCurrency(Number(lessThan)),
                greaterThan: convertToDisplayStringWithoutCurrency(Number(greaterThan)),
            });
        }
        if (lessThan) {
            return translate('search.filters.amount.lessThan', {amount: convertToDisplayStringWithoutCurrency(Number(lessThan))});
        }
        if (greaterThan) {
            return translate('search.filters.amount.greaterThan', {amount: convertToDisplayStringWithoutCurrency(Number(greaterThan))});
        }
        return undefined;
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY && filters[filterKey as keyof SearchAdvancedFiltersForm]) {
        const filterArray = filters[filterKey as keyof SearchAdvancedFiltersForm] as string[] ?? [];
        return filterArray.sort(localeCompare).join(', ');
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY && filters[filterKey as keyof SearchAdvancedFiltersForm]) {
        const filterArray = filters[filterKey as keyof SearchAdvancedFiltersForm] as string[] ?? [];
        return filterArray
            .sort((a, b) => sortOptionsWithEmptyValue(a, b, localeCompare))
            .map((value) => (value === CONST.SEARCH.CATEGORY_EMPTY_VALUE ? translate('search.noCategory') : value))
            .join(', ');
    }

    if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG && filters[filterKey as keyof SearchAdvancedFiltersForm]) {
        const filterArray = filters[filterKey as keyof SearchAdvancedFiltersForm] as string[] ?? [];
        return filterArray
            .sort((a, b) => sortOptionsWithEmptyValue(a, b, localeCompare))
            .map((value) => (value === CONST.SEARCH.TAG_EMPTY_VALUE ? translate('search.noTag') : getCleanedTagName(value)))
            .join(', ');
    }

    const filterValue = filters[filterKey as keyof SearchAdvancedFiltersForm];
    return Array.isArray(filterValue) ? filterValue.join(', ') : filterValue;
}

function getStatusFilterDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, type: SearchDataTypes, groupBy: any, translate: ReturnType<typeof useLocalize>['translate']) {
    const statusOptions = getStatusOptions(type, groupBy).concat({text: translate('common.all'), value: CONST.SEARCH.STATUS.EXPENSE.ALL});
    let filterValue = filters?.status;

    if (!filterValue?.length) {
        return undefined;
    }

    if (typeof filterValue === 'string') {
        filterValue = filterValue.split(',');
    }

    return filterValue
        .reduce((acc: string[], value: string) => {
            const status = statusOptions.find((statusOption) => statusOption.value === value);
            if (status) {
                return acc.concat(status.text);
            }
            return acc;
        }, [])
        .join(', ');
}

function AdvancedSearchFilters() {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const [searchAdvancedFilters = getEmptyObject<SearchAdvancedFiltersForm>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const groupBy = searchAdvancedFilters.groupBy;
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: false});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: false});
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList, true), [userCardList, workspaceCardFeeds]);
    const taxRates = getAllTaxRates();
    const personalDetails = usePersonalDetails();

    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});

    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: (session) => session?.email});

    const {sections: workspaces} = useWorkspaceList({
        policies,
        currentUserLogin,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: undefined,
        searchTerm: '',
        localeCompare,
    });

    const {currentType} = useAdvancedSearchFilters();

    const queryString = useMemo(() => buildQueryStringFromFilterFormValues(searchAdvancedFilters), [searchAdvancedFilters]);
    const queryJSON = useMemo(() => buildSearchQueryJSON(queryString || buildCannedSearchQuery()), [queryString]);

    // Get filters using the new configuration system
    const filterSections = getFiltersGroupedBySection(currentType);

    const applyFiltersAndNavigate = () => {
        clearAllFilters();
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: queryString,
            }),
            {forceReplace: true},
        );
    };

    const onSaveSearch = () => {
        const savedSearchKeys = Object.keys(savedSearches ?? {});
        if (!queryJSON || (savedSearches && savedSearchKeys.includes(String(queryJSON.hash)))) {
            applyFiltersAndNavigate();
            return;
        }

        saveSearch({
            queryJSON,
        });

        applyFiltersAndNavigate();
    };

    // Create filter dependencies
    const dependencies: FilterDependencies = {
        filters: searchAdvancedFilters,
        translate,
        localeCompare,
        formatPhoneNumber,
        personalDetails,
        policies: workspaces.flatMap(section => section.data),
        cards: allCards,
        taxRates,
        reports,
        currentType,
        groupBy,
    };

    // Build sections using configuration
    const sections: SectionType[] = [
        {
            titleTranslationKey: 'common.general',
            items: filterSections.general.map((filterConfig) => createFilterItem(filterConfig, dependencies)),
        },
        {
            titleTranslationKey: 'common.expenses',
            items: filterSections.expenses.map((filterConfig) => createFilterItem(filterConfig, dependencies)),
        },
        {
            titleTranslationKey: 'common.reports',
            items: filterSections.reports.map((filterConfig) => createFilterItem(filterConfig, dependencies)),
        },
    ].filter(section => section.items.length > 0);

    function createFilterItem(filterConfig: FilterConfig, deps: FilterDependencies) {
        const onPress = singleExecution(waitForNavigate(() => Navigation.navigate(filterConfig.route)));
        
        let filterTitle: string | undefined;

        // Use custom getTitleDisplay if provided
        if (filterConfig.getTitleDisplay) {
            filterTitle = filterConfig.getTitleDisplay(deps);
        } else {
            // Fall back to generic display logic
            if (filterConfig.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS) {
                filterTitle = getStatusFilterDisplayTitle(deps.filters, deps.currentType!, deps.groupBy, deps.translate);
            } else {
                filterTitle = getFilterDisplayTitle(deps.filters, filterConfig.key, deps.translate, deps.localeCompare);
            }
        }

        return {
            key: filterConfig.key,
            title: filterTitle,
            description: translate(filterConfig.descriptionKey),
            onPress,
        };
    }

    // Sort sections
    sections.forEach((section) => {
        section.items.sort((a, b) => {
            if (a.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE) {
                return -1;
            }
            if (b.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE) {
                return 1;
            }
            return localeCompare(a.description, b.description);
        });
    });

    const displaySearchButton = queryJSON && !isCannedSearchQuery(queryJSON);

    return (
        <>
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.justifyContentBetween]}>
                <View>
                    {sections.map((section, index) => (
                        <View key={`${section.items.at(0)?.key}-${index}`}>
                            {index !== 0 && (
                                <SpacerView
                                    shouldShow
                                    style={[styles.reportHorizontalRule]}
                                />
                            )}
                            <Text style={[styles.headerText, styles.reportHorizontalRule, index === 0 ? null : styles.mt4, styles.mb2]}>
                                {translate(section.titleTranslationKey)}
                            </Text>
                            {section.items.map((item) => (
                                <MenuItemWithTopDescription
                                    key={item.description}
                                    title={item.title}
                                    titleStyle={styles.flex1}
                                    description={item.description}
                                    shouldShowRightIcon
                                    onPress={item.onPress}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
            {!!displaySearchButton && (
                <Button
                    text={translate('search.saveSearch')}
                    onPress={onSaveSearch}
                    style={[styles.mh4, styles.mt4]}
                    large
                />
            )}
            <FormAlertWithSubmitButton
                buttonText={translate('search.viewResults')}
                containerStyles={[styles.m4, styles.mb5]}
                onSubmit={applyFiltersAndNavigate}
                enabledWhenOffline
            />
        </>
    );
}

AdvancedSearchFilters.displayName = 'AdvancedSearchFilters';

export default AdvancedSearchFilters;