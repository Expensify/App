import {useEffect, useRef} from 'react';
import {clearAllFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getDefaultActionableSearchMenuItem} from '@libs/SearchUIUtils';
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

        const defaultMenuItem = getDefaultActionableSearchMenuItem(flattenedMenuItems);

        if (!defaultMenuItem || similarSearchHash === defaultMenuItem.similarSearchHash) {
            return;
        }

        clearAllFilters();
        clearSelectedTransactions();
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: defaultMenuItem.searchQuery}));
    }, [shouldShowSkeleton, flattenedMenuItems, similarSearchHash, clearSelectedTransactions]);
}

export default useSuggestedSearchDefaultNavigation;
