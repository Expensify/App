import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect} from 'react';
import {InteractionManager} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import {addReportSubscription} from '@libs/actions/Subscription';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {subscribeToReportTypingEvents} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type UserTypingEventListenerProps = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;
};
function UserTypingEventListener({report}: UserTypingEventListenerProps) {
    const [lastVisitedPath = ''] = useOnyx(ONYXKEYS.LAST_VISITED_PATH, {canBeMissing: true});
    const [subscribedReportIds = getEmptyArray<string>()] = useOnyx(ONYXKEYS.SUBSCRIBED_REPORT_IDS);

    const reportID = report.reportID;
    const isFocused = useIsFocused();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();

    useEffect(() => {
        // Ensures any optimistic report that is being created (ex: a thread report) gets created and initialized successfully before subscribing
        if (route?.params?.reportID !== reportID) {
            return;
        }
        // eslint-disable-next-line deprecation/deprecation
        let interactionTask: ReturnType<typeof InteractionManager.runAfterInteractions> | null = null;
        if (isFocused) {
            // Ensures subscription event succeeds when the report/workspace room is created optimistically.
            // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
            // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
            // Existing reports created will have empty fields for `pendingFields`.
            const didCreateReportSuccessfully = !report.pendingFields || (!report.pendingFields.addWorkspaceRoom && !report.pendingFields.createChat);
            const isReportSubscribedToPusher = subscribedReportIds.some((id) => reportID === id);

            if (didCreateReportSuccessfully && !isReportSubscribedToPusher) {
                // eslint-disable-next-line deprecation/deprecation
                interactionTask = InteractionManager.runAfterInteractions(() => {
                    subscribeToReportTypingEvents(reportID);
                    addReportSubscription(reportID, subscribedReportIds);
                });
            }
        }
        return () => {
            if (!interactionTask) {
                return;
            }
            interactionTask.cancel();
        };
    }, [isFocused, report.pendingFields, lastVisitedPath, reportID, route, subscribedReportIds]);

    return null;
}

UserTypingEventListener.displayName = 'UserTypingEventListener';

export default UserTypingEventListener;
