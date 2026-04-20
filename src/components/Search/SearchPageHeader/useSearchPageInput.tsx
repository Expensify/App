import {deepEqual} from 'fast-equals';
import isEmpty from 'lodash/isEmpty';
import {useEffect, useRef, useState} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import {isSearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import {buildSubstitutionsMap} from '@components/Search/SearchRouter/buildSubstitutionsMap';
import {getQueryWithSubstitutions} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import type {SubstitutionMap} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import {getUpdatedSubstitutionsMap} from '@components/Search/SearchRouter/getUpdatedSubstitutionsMap';
import type {SearchQueryJSON, SearchQueryString} from '@components/Search/types';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToAndOpenReport} from '@libs/actions/Report';
import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getAutocompleteQueryWithComma, getTrimmedUserSearchQueryPreservingComma} from '@libs/SearchAutocompleteUtils';
import {buildUserReadableQueryString, getQueryWithUpdatedValues, sanitizeSearchValue} from '@libs/SearchQueryUtils';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';
import {accountIDSelector} from '@src/selectors/Session';

type UseSearchPageInputProps = {
    queryJSON: SearchQueryJSON;
    onSearch: (value: string) => void;
    onSubmit: () => void;
};

function useSearchPageInput({queryJSON, onSearch, onSubmit}: UseSearchPageInputProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const personalDetails = usePersonalDetails();
    const reportAttributes = useReportAttributes();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [searchContext] = useOnyx(ONYXKEYS.SEARCH_CONTEXT);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const [autocompleteSubstitutions, setAutocompleteSubstitutions] = useState<SubstitutionMap>({});
    const [textInputValue, setTextInputValue] = useState('');
    // The input text that was last used for autocomplete; needed for the SearchAutocompleteList when browsing list via arrow keys
    const [autocompleteQueryValue, setAutocompleteQueryValue] = useState('');
    const [selection, setSelection] = useState({start: textInputValue.length, end: textInputValue.length});

    const textInputRef = useRef<AnimatedTextInputRef>(null);
    const hasMountedRef = useRef(false);

    const {inputQuery: originalInputQuery} = queryJSON;
    const taxRates = getAllTaxRates(policies);
    const shouldShowQuery = searchContext?.shouldShowSearchQuery ?? false;
    const queryText = buildUserReadableQueryString({
        queryJSON,
        PersonalDetails: personalDetails,
        reports,
        taxRates,
        cardList: personalAndWorkspaceCards,
        cardFeeds: allFeeds,
        policies,
        currentUserAccountID,
        autoCompleteWithSpace: true,
        translate,
        feedKeysWithCards,
        reportAttributes,
    });

    useEffect(() => {
        hasMountedRef.current = true;
    }, []);

    useEffect(() => {
        const substitutionsMap = buildSubstitutionsMap(
            originalInputQuery,
            personalDetails,
            reports,
            taxRates,
            personalAndWorkspaceCards,
            allFeeds,
            policies,
            currentUserAccountID,
            translate,
            reportAttributes,
        );
        setAutocompleteSubstitutions(substitutionsMap);
    }, [allFeeds, personalAndWorkspaceCards, originalInputQuery, personalDetails, reports, taxRates, policies, currentUserAccountID, translate, reportAttributes]);

    useEffect(() => {
        const newValue = shouldShowQuery ? queryText : '';

        setTextInputValue(newValue);
        setAutocompleteQueryValue(newValue);
    }, [queryText, shouldShowQuery]);

    function handleSearchAction(value: string) {
        // Skip calling handleSearch on the initial mount
        if (!hasMountedRef.current) {
            return;
        }
        onSearch(value);
    }

    function submitSearch(queryString: SearchQueryString, shouldSkipAmountConversion = false) {
        const queryWithSubstitutions = getQueryWithSubstitutions(queryString, autocompleteSubstitutions);
        const updatedQuery = getQueryWithUpdatedValues(queryWithSubstitutions, shouldSkipAmountConversion);

        if (!updatedQuery) {
            return;
        }

        setSearchContext(true);
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: updatedQuery,
                rawQuery: queryWithSubstitutions,
            }),
        );
        onSubmit();
        if (updatedQuery !== originalInputQuery) {
            setTextInputValue('');
            setAutocompleteQueryValue('');
        }
    }

    function handleKeyPress(e: TextInputKeyPressEvent) {
        const keyEvent = e as unknown as KeyboardEvent;

        if (keyEvent.key === CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey && textInputRef.current?.isFocused()) {
            keyEvent.preventDefault();
            textInputRef.current.blur();
        }
    }

    function onSearchQueryChange(userQuery: string) {
        const singleLineUserQuery = StringUtils.lineBreaksToSpaces(userQuery, true);
        const updatedUserQuery = getAutocompleteQueryWithComma(textInputValue, singleLineUserQuery);
        setTextInputValue(updatedUserQuery);
        setAutocompleteQueryValue(updatedUserQuery);

        const updatedSubstitutionsMap = getUpdatedSubstitutionsMap(singleLineUserQuery, autocompleteSubstitutions);
        if (!deepEqual(autocompleteSubstitutions, updatedSubstitutionsMap) && !isEmpty(updatedSubstitutionsMap)) {
            setAutocompleteSubstitutions(updatedSubstitutionsMap);
        }
    }

    function onListItemPress(item: OptionData | SearchQueryItem) {
        if (isSearchQueryItem(item)) {
            if (!item.searchQuery) {
                return;
            }

            if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.AUTOCOMPLETE_SUGGESTION && textInputValue) {
                const fieldKey = item.mapKey?.includes(':') ? item.mapKey.split(':').at(0) : item.mapKey;
                const trimmedUserSearchQuery = getTrimmedUserSearchQueryPreservingComma(textInputValue, fieldKey);
                const newSearchQuery = `${trimmedUserSearchQuery}${sanitizeSearchValue(item.searchQuery)}\u00A0`;

                onSearchQueryChange(newSearchQuery);
                setSelection({start: newSearchQuery.length, end: newSearchQuery.length});

                if (item.mapKey && item.autocompleteID) {
                    const substitutions = {...autocompleteSubstitutions, [item.mapKey]: item.autocompleteID};
                    setAutocompleteSubstitutions(substitutions);
                }
            } else if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH) {
                submitSearch(item.searchQuery, item.keyForList !== CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.FIND_ITEM);
            }
        } else if (item?.reportID) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item?.reportID));
        } else if ('login' in item) {
            navigateToAndOpenReport(item.login ? [item.login] : [], currentUserAccountID, introSelected, isSelfTourViewed, betas, false);
        }
    }

    const searchQueryItem = textInputValue
        ? {
              text: textInputValue,
              singleIcon: expensifyIcons.MagnifyingGlass,
              searchQuery: textInputValue,
              itemStyle: styles.activeComponentBG,
              keyForList: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.FIND_ITEM,
              searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
          }
        : undefined;

    return {
        allFeeds,
        autocompleteSubstitutions,
        autocompleteQueryValue,
        personalAndWorkspaceCards,
        personalDetails,
        reports,
        searchQueryItem,
        selection,
        textInputRef,
        textInputValue,
        handleKeyPress,
        handleSearchAction,
        onListItemPress,
        onSearchQueryChange,
        submitSearch,
    };
}

export default useSearchPageInput;
