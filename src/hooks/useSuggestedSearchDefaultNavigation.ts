import {useEffect, useRef} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getDefaultActionableSearchMenuItem} from '@libs/SearchUIUtils';
import ROUTES from '@src/ROUTES';

type UseSuggestedSearchDefaultNavigationParams = {
    shouldShowSkeleton: boolean;
    flattenedMenuItems: SearchTypeMenuItem[];
    similarSearchHash?: number;
    clearSelectedTransactions: () => void;
    shouldSkipNavigation?: boolean;
};

function useSuggestedSearchDefaultNavigation({
    shouldShowSkeleton,
    flattenedMenuItems,
    similarSearchHash,
    clearSelectedTransactions,
    shouldSkipNavigation = false,
}: UseSuggestedSearchDefaultNavigationParams) {
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

        if (shouldSkipNavigation) {
            return;
        }

        const defaultMenuItem = getDefaultActionableSearchMenuItem(flattenedMenuItems);

        if (!defaultMenuItem || similarSearchHash !== undefined) {
            return;
        }

        clearSelectedTransactions();
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: defaultMenuItem.searchQuery}));
    }, [shouldShowSkeleton, flattenedMenuItems, similarSearchHash, clearSelectedTransactions, shouldSkipNavigation]);
}

export default useSuggestedSearchDefaultNavigation;
