import useOnyx from '@hooks/useOnyx';

import {loadRightModalNavigator, loadSearchRouterPage} from '@libs/Navigation/AppNavigator/searchRouterLazyLoaders';
import {Scheduler} from '@libs/Scheduler';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentType} from 'react';

import {useEffect, useState} from 'react';

import {getIsSearchRouterOpenOrOpening} from './SearchRouterContext';

type OptionsWarmerProps = {
    onDone: () => void;
};

/**
 * Moves the first search-open of the session off the critical path: evaluates the SearchRouterPage and
 * RightModalNavigator module graphs, then mounts SearchRouterOptionsWarmer to build the empty-query
 * option list into `createFilteredOptionList`'s cache. Runs after OpenApp is applied and the JS thread
 * is idle.
 */
function SearchRouterWarmup() {
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [OptionsWarmer, setOptionsWarmer] = useState<ComponentType<OptionsWarmerProps> | null>(null);

    useEffect(() => {
        if (isLoadingApp !== false) {
            return;
        }

        const task = Scheduler.scheduleWhenIdle(() => {
            // Already opening or open, so these costs are being paid live.
            if (getIsSearchRouterOpenOrOpening()) {
                return;
            }

            loadSearchRouterPage();
            loadRightModalNavigator();
            setOptionsWarmer(() => require<{default: ComponentType<OptionsWarmerProps>}>('@components/Search/SearchRouter/SearchRouterOptionsWarmer').default);
        });

        return () => task.cancel();
    }, [isLoadingApp]);

    if (!OptionsWarmer) {
        return null;
    }

    return <OptionsWarmer onDone={() => setOptionsWarmer(null)} />;
}

SearchRouterWarmup.displayName = 'SearchRouterWarmup';

export default SearchRouterWarmup;
