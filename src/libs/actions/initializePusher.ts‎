import Pusher from '@libs/Pusher';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import {subscribeToUserEvents} from './User';

/**
 * Shared Pusher bootstrap used by both the normal auth startup flow and delegate transitions.
 */
function initializePusher(currentUserAccountID?: number, currentUserEmail?: string, getReportAttributes?: () => ReportAttributesDerivedValue['reports'] | undefined): Promise<void> {
    return Pusher.init({
        appKey: CONFIG.PUSHER.APP_KEY,
        cluster: CONFIG.PUSHER.CLUSTER,
        authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
    }).then(() => {
        subscribeToUserEvents(currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID, currentUserEmail ?? '', getReportAttributes);
    });
}

export default initializePusher;
