import React, {useEffect, useMemo, useRef} from 'react';
import type {SearchQueryJSON} from '@components/Search/types';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import {openSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type SearchReadinessGateRenderProps = {
    suggestedSearchesReady: boolean;
};

type SearchReadinessGateProps = {
    queryJSON: SearchQueryJSON | undefined;
    children: (props: SearchReadinessGateRenderProps) => React.ReactNode;
};

function SearchReadinessGate({queryJSON, children}: SearchReadinessGateProps) {
    const {suggestedSearchesReady, suggestedSearches, suggestedSearchesVisibility} = useSearchTypeMenuSections();
    const hasHandledInitialNavigation = useRef(false);
    const initialSimilarSearchHash = useRef<number | null>(queryJSON?.similarSearchHash ?? null);

    useEffect(() => {
        openSearch();
    }, []);

    const defaultSuggestedSearch = useMemo(() => {
        if (!suggestedSearchesReady) {
            return undefined;
        }

        const approveKey = CONST.SEARCH.SEARCH_KEYS.APPROVE;
        if (suggestedSearchesVisibility?.[approveKey]) {
            return suggestedSearches?.[approveKey];
        }

        const submitKey = CONST.SEARCH.SEARCH_KEYS.SUBMIT;
        if (suggestedSearchesVisibility?.[submitKey]) {
            return suggestedSearches?.[submitKey];
        }

        return undefined;
    }, [suggestedSearches, suggestedSearchesReady, suggestedSearchesVisibility]);

    useEffect(() => {
        if (hasHandledInitialNavigation.current || !suggestedSearchesReady) {
            return;
        }

        if (!defaultSuggestedSearch) {
            hasHandledInitialNavigation.current = true;
            return;
        }

        const targetSimilarSearchHash = defaultSuggestedSearch.similarSearchHash;
        if (targetSimilarSearchHash == null) {
            hasHandledInitialNavigation.current = true;
            return;
        }

        if (queryJSON?.similarSearchHash === targetSimilarSearchHash) {
            hasHandledInitialNavigation.current = true;
            return;
        }

        if (queryJSON?.similarSearchHash !== undefined && queryJSON?.similarSearchHash !== initialSimilarSearchHash.current) {
            hasHandledInitialNavigation.current = true;
            return;
        }

        hasHandledInitialNavigation.current = true;
        setTimeout(() => {
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: defaultSuggestedSearch.searchQuery}));
        }, 0);
    }, [defaultSuggestedSearch, queryJSON?.similarSearchHash, suggestedSearchesReady]);

    return <>{children({suggestedSearchesReady})}</>;
}

SearchReadinessGate.displayName = 'SearchReadinessGate';

export default SearchReadinessGate;
