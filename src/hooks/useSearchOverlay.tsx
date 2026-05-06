import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useSession} from '@components/OnyxListItemProvider';
import SearchStaticList from '@components/Search/SearchStaticList';
import type {SearchQueryJSON} from '@components/Search/types';
import {hasDeferredWrite} from '@libs/deferredLayoutWrite';
import Navigation from '@libs/Navigation/Navigation';
import {isDefaultExpensesQuery} from '@libs/SearchQueryUtils';
import {getColumnsToShow, getValidGroupBy, isTransactionSearchType} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {SearchResults} from '@src/types/onyx';
import useOnyx from './useOnyx';

const OVERLAY_SAFETY_TIMEOUT_MS = 5000;

type UseSearchOverlayParams = {
    searchResults: SearchResults | undefined;
    queryJSON: SearchQueryJSON | undefined;
    shouldUseNarrowLayout: boolean;
    isMobileSelectionModeEnabled: boolean;
    currentSearchKey: string | undefined;
    /** FlatList content padding for narrow layout (accounts for filter bars). */
    contentContainerStyle?: StyleProp<ViewStyle>;
};

type UseSearchOverlayResult = {
    searchOverlayContent: React.ReactNode;
    onSearchContentReady: () => void;
    /** Whether the overlay lifecycle is active (armed but not yet ready). */
    isOverlayActive: boolean;
};

/**
 * Manages the SearchStaticList overlay shown above the Search content area
 * during expense-creation flows. The overlay is displayed when a deferred
 * write is pending or a fullscreen route has been pre-inserted under the RHP,
 * and dismissed once the real Search component signals readiness via
 * onContentReady, or after a safety timeout.
 */
function useSearchOverlay({
    searchResults,
    queryJSON,
    shouldUseNarrowLayout,
    isMobileSelectionModeEnabled,
    currentSearchKey,
    contentContainerStyle,
}: UseSearchOverlayParams): UseSearchOverlayResult {
    const session = useSession();
    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});

    const [isSearchReady, setIsSearchReady] = useState(() => !hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH) && !Navigation.getIsFullscreenPreInsertedUnderRHP());

    const onSearchContentReady = () => {
        setIsSearchReady(true);
    };

    // Re-arm the overlay on focus when a new deferred write was registered
    // (e.g. a subsequent submit flow while Search stays mounted).
    useFocusEffect(
        useCallback(() => {
            if (!hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH) && !Navigation.getIsFullscreenPreInsertedUnderRHP()) {
                return;
            }
            setIsSearchReady(false);
        }, []),
    );

    useEffect(() => {
        if (isSearchReady) {
            return;
        }
        const id = setTimeout(() => setIsSearchReady(true), OVERLAY_SAFETY_TIMEOUT_MS);
        return () => clearTimeout(id);
    }, [isSearchReady]);

    // When the overlay is dismissed, skip column computation and JSX creation.
    // The hook subscriptions (useSession, useOnyx) must remain unconditional per
    // rules-of-hooks, but the derived work below is the expensive part.
    if (isSearchReady) {
        return {searchOverlayContent: null, onSearchContentReady, isOverlayActive: false};
    }

    const isTransaction = isTransactionSearchType(queryJSON?.type);
    const canSelectMultiple = isTransaction && (!shouldUseNarrowLayout || isMobileSelectionModeEnabled);

    const validGroupBy = queryJSON ? getValidGroupBy(queryJSON.groupBy) : undefined;
    const shouldUseStrictDefaultExpenseColumns = currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPENSES && !!queryJSON && isDefaultExpensesQuery(queryJSON);

    const searchData = searchResults?.data;
    const overlayColumns = (() => {
        if (!searchData || !queryJSON) {
            return [];
        }
        return getColumnsToShow({
            currentAccountID: accountID,
            data: searchData,
            visibleColumns: visibleColumns ?? [],
            type: queryJSON.type,
            groupBy: validGroupBy,
            shouldUseStrictDefaultExpenseColumns,
        });
    })();

    // Narrow layout gets the custom contentContainerStyle (accounts for filter bars);
    // wide layout uses SearchStaticList's own internal padding (styles.pb3).
    const searchOverlayContent =
        isTransaction && searchData && queryJSON ? (
            <SearchStaticList
                searchResults={searchResults}
                queryJSON={queryJSON}
                shouldUseNarrowLayout={shouldUseNarrowLayout}
                canSelectMultiple={canSelectMultiple}
                columns={overlayColumns}
                contentContainerStyle={shouldUseNarrowLayout ? contentContainerStyle : undefined}
            />
        ) : null;

    return {searchOverlayContent, onSearchContentReady, isOverlayActive: true};
}

export default useSearchOverlay;
