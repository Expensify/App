import {emailSelector} from '@selectors/Session';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import type {OnyxCollection} from 'react-native-onyx';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScrollView from '@components/ScrollView';
import type {SearchAmountFilterKeys, SearchDateFilterKeys, SearchDatePreset, SearchFilterKey} from '@components/Search/types';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import type {WorkspaceListItem} from '@hooks/useWorkspaceList';
import useWorkspaceList from '@hooks/useWorkspaceList';
import {saveSearch} from '@libs/actions/Search';
import {createCardFeedKey, getCardFeedKey, getCardFeedNamesWithType, getWorkspaceCardFeedKey} from '@libs/CardFeedUtils';
import {filterPersonalCards, getCardDescription, mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {createDisplayName} from '@libs/PersonalDetailsUtils';
import {getAllTaxRates, getCleanedTagName} from '@libs/PolicyUtils';
import {computeReportName} from '@libs/ReportNameUtils';
import {
    buildCannedSearchQuery,
    buildQueryStringFromFilterFormValues,
    buildSearchQueryJSON,
    getCurrentSearchQueryJSON,
    isCannedSearchQuery,
    isSearchDatePreset,
    sortOptionsWithEmptyValue,
} from '@libs/SearchQueryUtils';
import {getStatusOptions} from '@libs/SearchUIUtils';
import {getExpenseTypeTranslationKey} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {AMOUNT_FILTER_KEYS, DATE_FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';
import type {CardList, PersonalDetailsList, Policy, Report, WorkspaceCardsList} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type SectionType = {
    titleTranslationKey: TranslationPaths;
    items: Array<{
        key: SearchFilterKey;
        title: string | undefined;
        description: string;
        onPress: () => void;
    }>;
};

const baseFilterConfig = {
    type: {
        getTitle: getFilterDisplayTitle,
        description: 'common.type' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE),
    },
    groupBy: {
        getTitle: getFilterDisplayTitle,
        description: 'search.groupBy' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.GROUP_BY),
    },
    status: {
        getTitle: getStatusFilterDisplayTitle,
        description: 'common.status' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS),
    },
    date: {
        getTitle: getFilterDisplayTitle,
        description: 'common.date' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE),
    },
    submitted: {
        getTitle: getFilterDisplayTitle,
        description: 'search.filters.submitted' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED),
    },
    approved: {
        getTitle: getFilterDisplayTitle,
        description: 'search.filters.approved' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED),
    },
    paid: {
        getTitle: getFilterDisplayTitle,
        description: 'search.filters.paid' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID),
    },
    exported: {
        getTitle: getFilterDisplayTitle,
        description: 'search.filters.exported' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED),
    },
    posted: {
        getTitle: getFilterDisplayTitle,
        description: 'search.filters.posted' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED),
    },
    withdrawn: {
        getTitle: getFilterDisplayTitle,
        description: 'search.filters.withdrawn' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN),
    },
    currency: {
        getTitle: getFilterDisplayTitle,
        description: 'common.currency' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY),
    },
    groupCurrency: {
        getTitle: getFilterDisplayTitle,
        description: 'common.groupCurrency' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.GROUP_CURRENCY),
    },
    merchant: {
        getTitle: getFilterDisplayTitle,
        description: 'common.merchant' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT),
    },
    description: {
        getTitle: getFilterDisplayTitle,
        description: 'common.description' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION),
    },
    reportID: {
        getTitle: getFilterDisplayTitle,
        description: 'common.reportID' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.REPORT_ID),
    },
    amount: {
        getTitle: getFilterDisplayTitle,
        description: 'iou.amount' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT),
    },
    total: {
        getTitle: getFilterDisplayTitle,
        description: 'common.total' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL),
    },
    category: {
        getTitle: getFilterDisplayTitle,
        description: 'common.category' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY),
    },
    keyword: {
        getTitle: getFilterDisplayTitle,
        description: 'search.filters.keywords' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD),
    },
    cardID: {
        getTitle: getFilterCardDisplayTitle,
        description: 'common.card' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CARD_ID),
    },
    taxRate: {
        getTitle: getFilterTaxRateDisplayTitle,
        description: 'workspace.taxes.taxRate' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TAX_RATE),
    },
    expenseType: {
        getTitle: getFilterExpenseDisplayTitle,
        description: 'search.expenseType' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.EXPENSE_TYPE),
    },
    withdrawalType: {
        getTitle: getFilterDisplayTitle,
        description: 'search.withdrawalType' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.WITHDRAWAL_TYPE),
    },
    withdrawalID: {
        getTitle: getFilterDisplayTitle,
        description: 'common.withdrawalID' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.WITHDRAWAL_ID),
    },
    tag: {
        getTitle: getFilterDisplayTitle,
        description: 'common.tag' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG),
    },
    has: {
        getTitle: getFilterDisplayTitle,
        description: 'search.has' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS),
    },
    is: {
        getTitle: getFilterDisplayTitle,
        description: 'search.filters.is' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.IS),
    },
    from: {
        getTitle: getFilterParticipantDisplayTitle,
        description: 'common.from' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM),
    },
    to: {
        getTitle: getFilterParticipantDisplayTitle,
        description: 'common.to' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.TO),
    },
    attendee: {
        getTitle: getFilterParticipantDisplayTitle,
        description: 'iou.attendees' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.ATTENDEE),
    },
    in: {
        getTitle: getFilterInDisplayTitle,
        description: 'common.in' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.IN),
    },
    title: {
        getTitle: getFilterDisplayTitle,
        description: 'common.title' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE),
    },
    assignee: {
        getTitle: getFilterParticipantDisplayTitle,
        description: 'common.assignee' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE),
    },
    reimbursable: {
        getTitle: getFilterDisplayTitle,
        description: 'common.reimbursable' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE),
    },
    billable: {
        getTitle: getFilterDisplayTitle,
        description: 'common.billable' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE),
    },
    policyID: {
        getTitle: getFilterWorkspaceDisplayTitle,
        description: 'workspace.common.workspace' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.POLICY_ID),
    },
    purchaseAmount: {
        getTitle: getFilterDisplayTitle,
        description: 'common.purchaseAmount' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.PURCHASE_AMOUNT),
    },
    purchaseCurrency: {
        getTitle: getFilterDisplayTitle,
        description: 'search.filters.purchaseCurrency' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.PURCHASE_CURRENCY),
    },
    reportField: {
        getTitle: getFilterDisplayTitle,
        description: 'workspace.common.reportField' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.REPORT_FIELD),
    },
};

function getFilterWorkspaceDisplayTitle(filters: SearchAdvancedFiltersForm, policies: WorkspaceListItem[]) {
    return policies
        .filter((value) => value.policyID && filters.policyID?.includes(value.policyID))
        .map((value) => value.text)
        .join(', ');
}

function getFilterCardDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, cards: CardList, translate: LocaleContextProps['translate']) {
    const cardIdsFilter = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID] ?? [];
    const feedFilter = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED] ?? [];
    const workspaceCardFeeds = Object.entries(cards).reduce<Record<string, WorkspaceCardsList>>((workspaceCardsFeed, [cardID, card]) => {
        const feedKey = `${createCardFeedKey(card.fundID, card.bank)}`;
        const workspaceFeedKey = getWorkspaceCardFeedKey(feedKey);
        /* eslint-disable no-param-reassign */
        workspaceCardsFeed[workspaceFeedKey] ??= {};
        workspaceCardsFeed[workspaceFeedKey][cardID] = card;
        /* eslint-enable no-param-reassign */
        return workspaceCardsFeed;
    }, {});

    const cardFeedNamesWithType = getCardFeedNamesWithType({
        workspaceCardFeeds,
        translate,
    });

    const cardNames = Object.values(cards)
        .filter((card) => cardIdsFilter.includes(card.cardID.toString()) && !feedFilter.includes(createCardFeedKey(card.fundID, card.bank)))
        .map((card) => getCardDescription(card, translate));

    const feedNames = Object.keys(cardFeedNamesWithType)
        .filter((workspaceCardFeedKey) => {
            const feedKey = getCardFeedKey(workspaceCardFeeds, workspaceCardFeedKey);
            return !!feedKey && feedFilter.includes(feedKey);
        })
        .map((cardFeedKey) => cardFeedNamesWithType[cardFeedKey].name);

    return [...feedNames, ...cardNames].join(', ');
}

function getFilterParticipantDisplayTitle(accountIDs: string[], personalDetails: PersonalDetailsList | undefined, formatPhoneNumber: LocaleContextProps['formatPhoneNumber']) {
    const selectedPersonalDetails = accountIDs.map((id) => personalDetails?.[id]);

    return selectedPersonalDetails
        .map((personalDetail) => {
            if (!personalDetail) {
                return '';
            }

            return createDisplayName(personalDetail.login ?? '', personalDetail, formatPhoneNumber);
        })
        .filter(Boolean)
        .join(', ');
}

function getFilterDisplayTitle(
    filters: Partial<SearchAdvancedFiltersForm>,
    filterKey: SearchFilterKey,
    translate: LocaleContextProps['translate'],
    localeCompare: LocaleContextProps['localeCompare'],
) {
    let key: SearchFilterKey = filterKey;

    if (DATE_FILTER_KEYS.includes(filterKey as SearchDateFilterKeys)) {
        const keyOn = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.ON}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.DATE_MODIFIERS.ON}`;
        const keyAfter = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.DATE_MODIFIERS.AFTER}`;
        const keyBefore = `${filterKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}` as `${SearchDateFilterKeys}${typeof CONST.SEARCH.DATE_MODIFIERS.BEFORE}`;
        const dateOn = filters[keyOn];
        const dateAfter = filters[keyAfter];
        const dateBefore = filters[keyBefore];
        const dateValue = [];

        if (dateOn) {
            dateValue.push(isSearchDatePreset(dateOn) ? translate(`search.filters.date.presets.${dateOn}`) : translate('search.filters.date.on', dateOn));
        }

        if (dateAfter) {
            dateValue.push(translate('search.filters.date.after', dateAfter));
        }

        if (dateBefore) {
            dateValue.push(translate('search.filters.date.before', dateBefore));
        }

        return dateValue.join(', ');
    }

    key = filterKey as Exclude<SearchFilterKey, SearchDateFilterKeys>;

    if (AMOUNT_FILTER_KEYS.includes(key as SearchAmountFilterKeys)) {
        const lessThanKey = `${key}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}` as keyof SearchAdvancedFiltersForm;
        const greaterThanKey = `${key}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}` as keyof SearchAdvancedFiltersForm;
        const equalToKey = `${key}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}` as keyof SearchAdvancedFiltersForm;

        const lessThan = filters[lessThanKey];
        const greaterThan = filters[greaterThanKey];
        const equalTo = filters[equalToKey];

        if (equalTo) {
            return translate('search.filters.amount.equalTo', {amount: convertToDisplayStringWithoutCurrency(Number(equalTo))});
        }
        if (lessThan && greaterThan) {
            return translate('search.filters.amount.between', convertToDisplayStringWithoutCurrency(Number(greaterThan)), convertToDisplayStringWithoutCurrency(Number(lessThan)));
        }
        if (lessThan) {
            return translate('search.filters.amount.lessThan', {amount: convertToDisplayStringWithoutCurrency(Number(lessThan))});
        }
        if (greaterThan) {
            return translate('search.filters.amount.greaterThan', {amount: convertToDisplayStringWithoutCurrency(Number(greaterThan))});
        }
        // Will never happen
        return;
    }

    key = filterKey as Exclude<SearchFilterKey, SearchDateFilterKeys | SearchAmountFilterKeys>;

    if (key.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
        const values: string[] = [];

        for (const [fieldKey, fieldValue] of Object.entries(filters)) {
            if (fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.NOT_PREFIX) || !fieldValue || !fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
                continue;
            }

            const fieldName = fieldKey
                .replace(CONST.SEARCH.REPORT_FIELD.ON_PREFIX, '')
                .replace(CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX, '')
                .replace(CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX, '')
                .replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, '')
                .split('-')
                .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
                .join(' ');

            if (fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.ON_PREFIX)) {
                const dateString = isSearchDatePreset(fieldValue as string)
                    ? translate(`search.filters.date.presets.${fieldValue as SearchDatePreset}`)
                    : translate('search.filters.date.on', fieldValue as string);

                values.push(translate('search.filters.reportField', {name: fieldName, value: dateString.toLowerCase()}));
            }

            if (fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX)) {
                const dateString = translate('search.filters.date.after', fieldValue as string).toLowerCase();
                values.push(translate('search.filters.reportField', {name: fieldName, value: dateString.toLowerCase()}));
            }

            if (fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX)) {
                const dateString = translate('search.filters.date.before', fieldValue as string).toLowerCase();
                values.push(translate('search.filters.reportField', {name: fieldName, value: dateString.toLowerCase()}));
            }

            if (fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX)) {
                const valueString = translate('search.filters.reportField', {name: fieldName, value: fieldValue as string});
                values.push(valueString);
            }
        }

        return values.length ? values.join(', ') : undefined;
    }

    if ((key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY || key === CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY) && filters[key]) {
        const filterArray = filters[key] ?? [];
        return filterArray.sort(localeCompare).join(', ');
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY && filters[key]) {
        const filterArray = filters[key] ?? [];
        return filterArray
            .sort((a, b) => sortOptionsWithEmptyValue(a, b, localeCompare))
            .map((value) => (value === CONST.SEARCH.CATEGORY_EMPTY_VALUE ? translate('search.noCategory') : value))
            .join(', ');
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG && filters[key]) {
        const filterArray = filters[key] ?? [];
        return filterArray
            .sort((a, b) => sortOptionsWithEmptyValue(a, b, localeCompare))
            .map((value) => (value === CONST.SEARCH.TAG_EMPTY_VALUE ? translate('search.noTag') : getCleanedTagName(value)))
            .join(', ');
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION || key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE) {
        return filters[key];
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE || key === CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE) {
        const filterValue = filters[key];
        return filterValue ? translate(`common.${filterValue as ValueOf<typeof CONST.SEARCH.BOOLEAN>}`) : undefined;
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE) {
        const filterValue = filters[key];
        if (filterValue === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
            return translate('common.expenseReport');
        }
        return filterValue ? translate(`common.${filterValue}`) : undefined;
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION) {
        const filterValue = filters[key];
        return filterValue ? translate(`search.filters.action.${filterValue as ValueOf<typeof CONST.SEARCH.ACTION_FILTERS>}`) : undefined;
    }

    if (key === CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY) {
        const filterValue = filters[key];
        return filterValue ? translate(`search.filters.groupBy.${filterValue}`) : undefined;
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE) {
        const filterValue = filters[key];
        return filterValue ? translate(`search.filters.withdrawalType.${filterValue}`) : undefined;
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS) {
        const filterValue = filters[key];
        return filterValue ? filterValue.map((value) => translate(`common.${value as ValueOf<typeof CONST.SEARCH.HAS_VALUES>}`)).join(', ') : undefined;
    }

    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.IS) {
        const filterValue = filters[key];
        return filterValue ? filterValue.map((value) => translate(`common.${value as ValueOf<typeof CONST.SEARCH.IS_VALUES>}`)).join(', ') : undefined;
    }

    const filterValue = filters[key];
    return Array.isArray(filterValue) ? filterValue.join(', ') : filterValue;
}

function getStatusFilterDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, type: SearchDataTypes, translate: LocaleContextProps['translate']) {
    const statusOptions = getStatusOptions(translate, type).concat({text: translate('common.all'), value: CONST.SEARCH.STATUS.EXPENSE.ALL});
    let filterValue = filters?.status;

    if (!filterValue?.length) {
        return undefined;
    }

    if (typeof filterValue === 'string') {
        filterValue = filterValue.split(',');
    }

    return filterValue
        .reduce((acc, value) => {
            const status = statusOptions.find((statusOption) => statusOption.value === value);
            if (status) {
                return acc.concat(status.text);
            }
            return acc;
        }, [] as string[])
        .join(', ');
}

function getFilterTaxRateDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, taxRates: Record<string, string[]>) {
    const selectedTaxRateKeys = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE];
    if (!selectedTaxRateKeys) {
        return undefined;
    }

    const result: string[] = [];
    for (const [taxRateName, taxRateKeys] of Object.entries(taxRates)) {
        if (!taxRateKeys.some((taxRateKey) => selectedTaxRateKeys.includes(taxRateKey)) || result.includes(taxRateName)) {
            continue;
        }
        result.push(taxRateName);
    }

    return result.join(', ');
}

function getFilterExpenseDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, translate: LocaleContextProps['translate']) {
    const filterValue = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE];
    return filterValue
        ? Object.values(CONST.SEARCH.TRANSACTION_TYPE)
              .filter((expenseType) => filterValue.includes(expenseType))
              .map((expenseType) => translate(getExpenseTypeTranslationKey(expenseType)))
              .join(', ')
        : undefined;
}

function getFilterInDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, _: LocaleContextProps['translate'], reports: OnyxCollection<Report> | undefined, currentUserAccountID: number) {
    return filters.in
        ?.map((id) => computeReportName(reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`], reports, undefined, undefined, undefined, undefined, undefined, currentUserAccountID))
        ?.filter(Boolean)
        ?.join(', ');
}

function AdvancedSearchFilters() {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const [searchAdvancedFilters = getEmptyObject<SearchAdvancedFiltersForm>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: false});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: false});
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList, true), [userCardList, workspaceCardFeeds]);
    const personalDetails = usePersonalDetails();

    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: emailSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const taxRates = getAllTaxRates(policies);

    const {sections: workspaces} = useWorkspaceList({
        policies,
        currentUserLogin,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: undefined,
        searchTerm: '',
        localeCompare,
    });

    const {currentType, typeFiltersKeys} = useAdvancedSearchFilters();

    const queryString = useMemo(() => {
        const currentQueryJSON = getCurrentSearchQueryJSON();
        return buildQueryStringFromFilterFormValues(searchAdvancedFilters, {
            sortBy: currentQueryJSON?.sortBy,
            sortOrder: currentQueryJSON?.sortOrder,
            limit: currentQueryJSON?.limit,
        });
    }, [searchAdvancedFilters]);
    const queryJSON = useMemo(() => buildSearchQueryJSON(queryString || buildCannedSearchQuery()), [queryString]);

    const applyFiltersAndNavigate = () => {
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
            // If the search is already saved, we only display the results as we don't need to save it.
            applyFiltersAndNavigate();
            return;
        }

        saveSearch({
            queryJSON,
        });

        Navigation.setNavigationActionToMicrotaskQueue(() => applyFiltersAndNavigate());
    };

    const filters = typeFiltersKeys.map((section) => {
        return section.map((key) => {
            const onPress = singleExecution(waitForNavigate(() => Navigation.navigate(baseFilterConfig[key].route)));
            let filterTitle;
            if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
                filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, allCards, translate);
            } else if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
                filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, taxRates);
            } else if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE) {
                filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, translate);
            } else if (
                key === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM ||
                key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO ||
                key === CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE ||
                key === CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE
            ) {
                filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters[key] ?? [], personalDetails, formatPhoneNumber);
            } else if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN) {
                filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, translate, reports, currentUserAccountID);
            } else if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID) {
                const workspacesData = workspaces.flatMap((value) => value.data);
                filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, workspacesData);
            } else if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS) {
                filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, currentType, translate);
            } else {
                filterTitle = baseFilterConfig[key].getTitle(searchAdvancedFilters, key, translate, localeCompare);
            }

            return {
                key,
                title: filterTitle,
                description: translate(baseFilterConfig[key].description),
                onPress,
            };
        });
    });

    const displaySearchButton = queryJSON && !isCannedSearchQuery(queryJSON);

    const sections: SectionType[] = [
        {
            titleTranslationKey: 'common.general',
            items: filters.at(0) ?? [],
        },
        {
            titleTranslationKey: queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT ? 'common.reports' : 'common.expenses',
            items: filters.at(1) ?? [],
        },
        {
            titleTranslationKey: 'common.reports',
            items: filters.at(2) ?? [],
        },
    ];

    for (const section of sections) {
        section.items.sort((a, b) => {
            if (a.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE) {
                return -1;
            }
            if (b.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE) {
                return 1;
            }
            return localeCompare(a.description, b.description);
        });
    }

    return (
        <>
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.justifyContentBetween]}>
                <View>
                    {sections.map((section, index) => {
                        if (section.items.length === 0) {
                            return;
                        }

                        return (
                            // eslint-disable-next-line react/no-array-index-key
                            <View key={`${section.items.at(0)?.key}-${index}`}>
                                {index !== 0 && (
                                    <SpacerView
                                        shouldShow
                                        style={[styles.reportHorizontalRule]}
                                    />
                                )}
                                <Text style={[styles.headerText, styles.reportHorizontalRule, index === 0 ? null : styles.mt4, styles.mb2]}>{translate(section.titleTranslationKey)}</Text>
                                {section.items.map((item) => {
                                    return (
                                        <MenuItemWithTopDescription
                                            key={item.description}
                                            title={item.title}
                                            titleStyle={styles.flex1}
                                            description={item.description}
                                            shouldShowRightIcon
                                            onPress={item.onPress}
                                        />
                                    );
                                })}
                            </View>
                        );
                    })}
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

export default AdvancedSearchFilters;
