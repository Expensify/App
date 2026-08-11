import {getSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import type {ComponentType} from 'react';

import {useEffect, useState} from 'react';

type OptionsWarmerProps = {
    onDone: () => void;
};

// Give the post-launch work (OpenApp/Reconnect processing, derived recomputes) time to drain
// before touching anything, so the warmup never competes with startup or an early user action.
const WARMUP_DELAY_MS = 15000;

/**
 * Warms the SearchRouter open path while the app is idle:
 * - evaluates the SearchRouterPage and RightModalNavigator module graphs, moving their first-use
 *   cost (module factories, generated parsers) off the first search-open of the session;
 * - mounts SearchRouterOptionsWarmer once, so the empty-query option list is computed and cached
 *   ahead of that first open. The warmer unmounts as soon as the list is cached, so no live
 *   subscription keeps recomputing afterwards.
 */
function SearchRouterWarmup() {
    const [OptionsWarmer, setOptionsWarmer] = useState<ComponentType<OptionsWarmerProps> | null>(null);
    const [isWarmupDone, setIsWarmupDone] = useState(false);

    useEffect(() => {
        const id = setTimeout(() => {
            // The router is already opening or open — it is paying these costs right now anyway.
            if (getSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER)) {
                return;
            }
            require('@components/Search/SearchRouter/SearchRouterPage');
            require('@libs/Navigation/AppNavigator/Navigators/RightModalNavigator');
            setOptionsWarmer(() => require<{default: ComponentType<OptionsWarmerProps>}>('@components/Search/SearchRouter/SearchRouterOptionsWarmer').default);
        }, WARMUP_DELAY_MS);
        return () => clearTimeout(id);
    }, []);

    if (!OptionsWarmer || isWarmupDone) {
        return null;
    }

    return <OptionsWarmer onDone={() => setIsWarmupDone(true)} />;
}

SearchRouterWarmup.displayName = 'SearchRouterWarmup';

export default SearchRouterWarmup;
