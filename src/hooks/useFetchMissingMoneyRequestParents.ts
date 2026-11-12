import {openReport} from '@libs/actions/Report';
import {getReportAction} from '@libs/ReportActionsUtils';
import {isMoneyRequestAction} from '@libs/ReportActionTypeGuards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {useEffect, useRef} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/** Loads expense reports that Focus mode OpenApp leaves out when their transaction thread has an unread comment. */

type MissingParent = {
    parentReportID: string;
    parentReportActionID: string;
};

/** Unread threads whose parent report isn't in Onyx, keyed by the parent so each parent is listed once. */
function missingParentsSelector(reports: OnyxCollection<Report>): MissingParent[] {
    const missingParents = new Map<string, MissingParent>();
    for (const report of Object.values(reports ?? {})) {
        const parentReportID = report?.parentReportID;
        const parentReportActionID = report?.parentReportActionID;
        if (!parentReportID || !parentReportActionID || missingParents.has(parentReportID) || reports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`]) {
            continue;
        }
        if ((report.lastVisibleActionCreated ?? '') <= (report.lastReadTime ?? '')) {
            continue;
        }
        missingParents.set(parentReportID, {parentReportID, parentReportActionID});
    }
    return [...missingParents.values()];
}

/** Opens each missing parent once without marking it as read, so the LHN can show it as unread. */
function useFetchMissingMoneyRequestParents() {
    const {isOffline} = useNetwork();
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [missingParents] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: missingParentsSelector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const requestedParentIDs = useRef(new Set<string>());

    useEffect(() => {
        const missingParentIDs = new Set((missingParents ?? []).map(({parentReportID}) => parentReportID));

        // Forget parents that loaded (or whose thread was read), so a later cache clear can fetch them again
        for (const parentReportID of requestedParentIDs.current) {
            if (!missingParentIDs.has(parentReportID)) {
                requestedParentIDs.current.delete(parentReportID);
            }
        }

        if (priorityMode !== CONST.PRIORITY_MODE.GSD || isLoadingApp || isOffline) {
            return;
        }

        for (const {parentReportID, parentReportActionID} of missingParents ?? []) {
            // Only transaction threads, a regular comment thread's parent isn't dropped this way
            if (requestedParentIDs.current.has(parentReportID) || !isMoneyRequestAction(getReportAction(parentReportID, parentReportActionID))) {
                continue;
            }
            requestedParentIDs.current.add(parentReportID);
            openReport({
                reportID: parentReportID,
                introSelected,
                conciergeChat,
                hasReportActions: true,
                shouldMarkAsRead: false,
                shouldKeepManualUnreadMarker: true,
                currentUserAccountID,
                isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
                hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
            });
        }
    }, [
        missingParents,
        priorityMode,
        isLoadingApp,
        isOffline,
        introSelected,
        conciergeChat,
        currentUserAccountID,
        guidedSetupAndTourStatus?.isSelfTourViewed,
        guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
    ]);
}

export default useFetchMissingMoneyRequestParents;
export {missingParentsSelector};
