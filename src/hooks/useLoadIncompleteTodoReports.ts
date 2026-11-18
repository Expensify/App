import type {SearchKey} from '@libs/SearchKeyUtils';

import {loadIncompleteTodoReports} from '@userActions/Search';

import {useEffect} from 'react';

import useNetwork from './useNetwork';

/**
 * Loads the full data of to-do reports the device only holds partly, such as a report that first arrived through the
 * Pusher update of a forward. Until then their rows in the live to-do list have no date or totals.
 */
function useLoadIncompleteTodoReports(searchKey: SearchKey | undefined, incompleteReportIDs: string[] | undefined) {
    const {isOffline} = useNetwork();
    const incompleteReportIDsKey = incompleteReportIDs?.join(',') ?? '';

    useEffect(() => {
        if (!searchKey || !incompleteReportIDsKey || isOffline) {
            return;
        }
        loadIncompleteTodoReports(searchKey, incompleteReportIDsKey.split(','));
    }, [searchKey, incompleteReportIDsKey, isOffline]);
}

export default useLoadIncompleteTodoReports;
