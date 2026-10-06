import {getStoredSearchTabRoute} from '@components/Navigation/NavigationTabBar/getSearchTabRoute';

import useOnyx from '@hooks/useOnyx';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import ONYXKEYS from '@src/ONYXKEYS';
import {lastExpensesSearchQuerySelector} from '@src/selectors/SearchFilters';

import {useEffect} from 'react';

import type {NativeTabNavigation} from './NativeTabLayout';

type SpendTabPressListenerProps = {
    /** The Spend tab's own navigation. */
    navigation: NativeTabNavigation;

    /** Whether the native bar leaves the switch to Spend to this listener, until Spend is first selected. */
    isSwitchedByJS: boolean;
};

/**
 * Runs the Spend tab button's navigation for a tap on the native Spend tab. The first visit opens the latest search kept
 * in Onyx, as the JS tab button does, because the tab mounted at startup shows the default one; later visits are switched
 * natively and only start the spans. It is its own component, so the search data it reads re-renders only this listener.
 */
function SpendTabPressListener({navigation, isSwitchedByJS}: SpendTabPressListenerProps) {
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});

    useEffect(
        () =>
            navigation.addListener('tabPress', () => {
                if (navigation.isFocused()) {
                    return;
                }
                interceptAnonymousUser(() => {
                    startNavigateToReportsTabSpans();
                    if (!isSwitchedByJS) {
                        return;
                    }
                    Navigation.navigate(getStoredSearchTabRoute(lastSearchParams, lastExpensesSearchQuery));
                });
            }),
        [navigation, isSwitchedByJS, lastSearchParams, lastExpensesSearchQuery],
    );

    return null;
}

export default SpendTabPressListener;
