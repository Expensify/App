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

// The option list is only worth building while its inputs hold still, but a chatty account can keep
// writing forever, so stop rescheduling after this many idle windows and build with what we have.
const MAX_QUIET_WAIT_ATTEMPTS = 5;

/**
 * Counts writes to the Onyx data the option-list cache is keyed on. `connectWithoutView` rather than
 * `useOnyx` because this must not render or build anything: it only answers "are the inputs still
 * settling?", and a subscribed component would rebuild the whole option list on every write.
 * The connections live only for the duration of the warmup.
 */
function startTrackingInputChurn(): {getVersion: () => number; stop: () => void} {
    let version = 0;
    // Collection root keys hand the whole collection to the callback on any member change, so this
    // fires once per write batch rather than once per report.
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
 * Warms the SearchRouter open path once the app has settled:
 * - evaluates the SearchRouterPage and RightModalNavigator module graphs, moving their first-use
 *   cost (module factories, generated parsers) off the first search-open of the session;
 * - mounts SearchRouterOptionsWarmer once, so the empty-query option list is computed and cached
 *   ahead of that first open. The warmer unmounts as soon as the list is cached, so no live
 *   subscription keeps recomputing afterwards.
 *
 * Both steps wait for OpenApp to be applied (`isLoadingApp === false`) and then for an idle window on
 * the JS thread, so they never compete with startup or with an early user action. The option list
 * additionally waits for its Onyx inputs to hold still across a full idle window, because
 * `createFilteredOptionList` keys its cache on their identity — a list built while post-launch writes
 * are still landing is thrown away before the user can open the router.
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

                // The router is already opening or open — it is paying these costs right now anyway.
                if (getSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER)) {
                    stop();
                    return;
                }

                // Module evaluation is unaffected by Onyx writes, so it never needs to wait for quiet.
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
