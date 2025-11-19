import {useEffect, useRef} from 'react';
import {clearAllFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type UseSuggestedSearchDefaultNavigationParams = {
    shouldShowSkeleton: boolean;
    flattenedMenuItems: SearchTypeMenuItem[];
    similarSearchHash?: number;
    clearSelectedTransactions: () => void;
};

function useSuggestedSearchDefaultNavigation({shouldShowSkeleton, flattenedMenuItems, similarSearchHash, clearSelectedTransactions}: UseSuggestedSearchDefaultNavigationParams) {
    const hasShownSkeleton = useRef(false);

    useEffect(() => {
        if (shouldShowSkeleton) {
            hasShownSkeleton.current = true;
            return;
        }

        if (!hasShownSkeleton.current) {
            return;
        }

        hasShownSkeleton.current = false;

        const defaultMenuItem =
            flattenedMenuItems.find((item) => item.key === CONST.SEARCH.SEARCH_KEYS.APPROVE) ?? flattenedMenuItems.find((item) => item.key === CONST.SEARCH.SEARCH_KEYS.SUBMIT);

        if (!defaultMenuItem || similarSearchHash === defaultMenuItem.similarSearchHash) {
            return;
        }

        clearAllFilters();
        clearSelectedTransactions();
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: defaultMenuItem.searchQuery}));
    }, [shouldShowSkeleton, flattenedMenuItems, similarSearchHash, clearSelectedTransactions]);
}

export default useSuggestedSearchDefaultNavigation;
