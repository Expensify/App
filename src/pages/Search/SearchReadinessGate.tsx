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
    const hasNavigatedToDefault = useRef(false);

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

    const activeSuggestedSearchHash = useMemo(() => {
        if (!suggestedSearchesReady || !queryJSON?.similarSearchHash) {
            return undefined;
        }

        return queryJSON.similarSearchHash;
    }, [queryJSON?.similarSearchHash, suggestedSearchesReady]);

    const isActiveRouteSuggestedSearch = useMemo(() => {
        if (!suggestedSearchesReady || activeSuggestedSearchHash === undefined) {
            return false;
        }

        return Object.values(suggestedSearches).some((search) => search?.similarSearchHash === activeSuggestedSearchHash);
    }, [activeSuggestedSearchHash, suggestedSearches, suggestedSearchesReady]);

    useEffect(() => {
        if (!suggestedSearchesReady || hasNavigatedToDefault.current) {
            return;
        }

        if (!defaultSuggestedSearch) {
            hasNavigatedToDefault.current = true;
            return;
        }

        if (isActiveRouteSuggestedSearch && activeSuggestedSearchHash === defaultSuggestedSearch.similarSearchHash) {
            hasNavigatedToDefault.current = true;
            return;
        }

        if (isActiveRouteSuggestedSearch) {
            hasNavigatedToDefault.current = true;
            return;
        }

        hasNavigatedToDefault.current = true;
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: defaultSuggestedSearch.searchQuery}));
    }, [activeSuggestedSearchHash, defaultSuggestedSearch, isActiveRouteSuggestedSearch, suggestedSearchesReady]);

    return <>{children({suggestedSearchesReady})}</>;
}

SearchReadinessGate.displayName = 'SearchReadinessGate';

export default SearchReadinessGate;
