import useFilteredOptions from '@hooks/useFilteredOptions';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useSortedActions from '@hooks/useSortedActions';

import {Scheduler} from '@libs/Scheduler';
import type {IdleTask} from '@libs/Scheduler';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef, useState} from 'react';

import {getIsSearchRouterOpenOrOpening} from './SearchRouterContext';
import SEARCH_ROUTER_OPTIONS_CONFIG from './searchRouterOptionsConfig';

type SearchRouterOptionsWarmerProps = {
    /** Called once the option list is cached (or the warm is no longer needed), so the parent can unmount this component. */
    onDone: () => void;
};

// Stop waiting for quiet after this many idle windows. A chatty account never fully stops writing.
const MAX_QUIET_WAIT_ATTEMPTS = 5;

/**
 * Builds the SearchRouter's empty-query option list so the first open of the session hits
 * `createFilteredOptionList`'s cache instead of building it on the critical path. The build waits until
 * the list's Onyx inputs hold still across idle windows, because the cache is keyed on the identity of
 * the `useOnyx` snapshots and a list built mid-write is discarded.
 */
function SearchRouterOptionsWarmer({onDone}: SearchRouterOptionsWarmerProps) {
    const [shouldBuild, setShouldBuild] = useState(false);

    // The high-churn inputs of the option-list cache, read through the same `useOnyx` layer that keys it.
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const reportAttributes = useReportAttributes();
    const sortedActions = useSortedActions();

    const churnVersionRef = useRef(0);
    useEffect(() => {
        churnVersionRef.current += 1;
    }, [reports, policies, personalDetails, reportAttributes, sortedActions]);

    useEffect(() => {
        let attempts = 0;
        let lastSeenChurn = -1;
        let task: IdleTask | undefined;

        const waitForQuiet = () => {
            task = Scheduler.scheduleWhenIdle(() => {
                // The real screen builds (and caches) the list itself, so warming would only compete with it.
                if (getIsSearchRouterOpenOrOpening()) {
                    onDone();
                    return;
                }

                if (churnVersionRef.current !== lastSeenChurn && attempts < MAX_QUIET_WAIT_ATTEMPTS) {
                    lastSeenChurn = churnVersionRef.current;
                    attempts += 1;
                    waitForQuiet();
                    return;
                }

                setShouldBuild(true);
            });
        };

        waitForQuiet();
        return () => task?.cancel();
    }, [onDone]);

    const {options} = useFilteredOptions({
        ...SEARCH_ROUTER_OPTIONS_CONFIG,
        isSearching: false,
        enabled: shouldBuild,
    });

    useEffect(() => {
        if (!options) {
            return;
        }
        onDone();
    }, [options, onDone]);

    return null;
}

export default SearchRouterOptionsWarmer;
export type {SearchRouterOptionsWarmerProps};
