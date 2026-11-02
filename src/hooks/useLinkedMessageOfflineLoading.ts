import {useEffect} from 'react';
import {updateLoadingInitialReportAction} from '@libs/actions/Report';
import useNetwork from './useNetwork';

type UseLinkedMessageOfflineLoadingParams = {
    /** The ID of the report whose initial-actions loading flag should be cleared */
    reportID: string;

    /** The report action ID linked from the route, if any */
    reportActionIDFromRoute: string | undefined;
};

/**
 * When deep-linking to a message while offline, the linked actions are already cached, so clear the
 * initial-actions loading flag instead of waiting for OpenReport. In the content, not the guard, because it
 * only runs offline, where no skeleton shows.
 */
function useLinkedMessageOfflineLoading({reportID, reportActionIDFromRoute}: UseLinkedMessageOfflineLoadingParams) {
    const {isOffline} = useNetwork();

    useEffect(() => {
        // When we linked to message - we do not need to wait for initial actions - they already exists
        if (!reportActionIDFromRoute || !isOffline) {
            return;
        }
        updateLoadingInitialReportAction(reportID);
    }, [isOffline, reportID, reportActionIDFromRoute]);
}

export default useLinkedMessageOfflineLoading;
