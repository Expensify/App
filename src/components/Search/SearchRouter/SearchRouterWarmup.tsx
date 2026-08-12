import useOnyx from '@hooks/useOnyx';

import {loadRightModalNavigator, loadSearchRouterPage} from '@libs/Navigation/AppNavigator/searchRouterLazyLoaders';
import {Scheduler} from '@libs/Scheduler';
import type {IdleTask} from '@libs/Scheduler';
import {getSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentType} from 'react';

import {useEffect, useState} from 'react';
import Onyx from 'react-native-onyx';

type OptionsWarmerProps = {
    onDone: () => void;
};

// Stop waiting for quiet after this many idle windows; a chatty account never fully stops writing.
const MAX_QUIET_WAIT_ATTEMPTS = 5;

/**
 * Counts writes to the Onyx data the option-list cache is keyed on. `connectWithoutView` because a
 * subscribed component would rebuild the whole option list on every write; this only counts.
 */
function startTrackingInputChurn(): {getVersion: () => number; stop: () => void} {
    let version = 0;
    const bump = () => {
        version += 1;
    };
    const connections = [
        Onyx.connectWithoutView({key: ONYXKEYS.COLLECTION.REPORT, callback: bump}),
        Onyx.connectWithoutView({key: ONYXKEYS.COLLECTION.POLICY, callback: bump}),
        Onyx.connectWithoutView({key: ONYXKEYS.PERSONAL_DETAILS_LIST, callback: bump}),
        Onyx.connectWithoutView({key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, callback: bump}),
        Onyx.connectWithoutView({key: ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, callback: bump}),
    ];

    return {
        getVersion: () => version,
        stop: () => {
            for (const connection of connections) {
                Onyx.disconnect(connection);
            }
        },
    };
}

/**
 * Moves the first search-open of the session off the critical path: evaluates the SearchRouterPage and
 * RightModalNavigator module graphs, then mounts SearchRouterOptionsWarmer to build the empty-query
 * option list into `createFilteredOptionList`'s cache. Runs after OpenApp is applied and the JS thread
 * is idle. The option list also waits for its Onyx inputs to hold still, because the cache is keyed on
 * their identity and a list built mid-write is discarded.
 */
function SearchRouterWarmup() {
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [OptionsWarmer, setOptionsWarmer] = useState<ComponentType<OptionsWarmerProps> | null>(null);
    const [isWarmupDone, setIsWarmupDone] = useState(false);

    useEffect(() => {
        if (isLoadingApp !== false) {
            return;
        }

        let isCancelled = false;
        let task: IdleTask | undefined;
        let attempts = 0;
        let lastSeenChurn = -1;
        let areModulesLoaded = false;
        const churn = startTrackingInputChurn();

        const stop = () => {
            isCancelled = true;
            task?.cancel();
            churn.stop();
        };

        const warmWhenIdle = () => {
            task = Scheduler.scheduleWhenIdle(() => {
                if (isCancelled) {
                    return;
                }

                // Already opening or open, so these costs are being paid live.
                if (getSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER)) {
                    stop();
                    return;
                }

                // Unaffected by Onyx writes, so no need to wait for quiet.
                if (!areModulesLoaded) {
                    areModulesLoaded = true;
                    loadSearchRouterPage();
                    loadRightModalNavigator();
                }

                const currentChurn = churn.getVersion();
                if (currentChurn !== lastSeenChurn && attempts < MAX_QUIET_WAIT_ATTEMPTS) {
                    lastSeenChurn = currentChurn;
                    attempts += 1;
                    warmWhenIdle();
                    return;
                }

                setOptionsWarmer(() => require<{default: ComponentType<OptionsWarmerProps>}>('@components/Search/SearchRouter/SearchRouterOptionsWarmer').default);
                stop();
            });
        };

        warmWhenIdle();
        return stop;
    }, [isLoadingApp]);

    if (!OptionsWarmer || isWarmupDone) {
        return null;
    }

    return <OptionsWarmer onDone={() => setIsWarmupDone(true)} />;
}

SearchRouterWarmup.displayName = 'SearchRouterWarmup';

export default SearchRouterWarmup;
