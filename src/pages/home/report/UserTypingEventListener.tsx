import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import {InteractionManager} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {subscribeToReportTypingEvents, unsubscribeFromReportChannel} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type UserTypingEventListenerProps = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;
};
function UserTypingEventListener({report}: UserTypingEventListenerProps) {
    const [lastVisitedPath = ''] = useOnyx(ONYXKEYS.LAST_VISITED_PATH, {canBeMissing: true});
    const didSubscribeToReportTypingEvents = useRef(false);
    const reportID = report.reportID;
    const isFocused = useIsFocused();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();

    useEffect(
        () => () => {
            if (!didSubscribeToReportTypingEvents.current) {
                return;
            }

            // unsubscribe from report typing events when the component unmounts
            didSubscribeToReportTypingEvents.current = false;
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                unsubscribeFromReportChannel(reportID);
            });
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => {
        // Ensures any optimistic report that is being created (ex: a thread report) gets created and initialized successfully before subscribing
        if (route?.params?.reportID !== reportID) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        let interactionTask: ReturnType<typeof InteractionManager.runAfterInteractions> | null = null;
        if (isFocused) {
            // Ensures subscription event succeeds when the report/workspace room is created optimistically.
            // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
            // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
            // Existing reports created will have empty fields for `pendingFields`.
            const didCreateReportSuccessfully = !report.pendingFields || (!report.pendingFields.addWorkspaceRoom && !report.pendingFields.createChat);

            if (!didSubscribeToReportTypingEvents.current && didCreateReportSuccessfully) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                interactionTask = InteractionManager.runAfterInteractions(() => {
                    subscribeToReportTypingEvents(reportID);
                    didSubscribeToReportTypingEvents.current = true;
                });
            }
        } else {
            const topmostReportId = Navigation.getTopmostReportId();

            if (topmostReportId !== reportID && didSubscribeToReportTypingEvents.current) {
                didSubscribeToReportTypingEvents.current = false;
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    unsubscribeFromReportChannel(reportID);
                });
            }
        }
        return () => {
            if (!interactionTask) {
                return;
            }
            interactionTask.cancel();
        };
    }, [isFocused, report.pendingFields, didSubscribeToReportTypingEvents, lastVisitedPath, reportID, route?.params?.reportID]);

    return null;
}

UserTypingEventListener.displayName = 'UserTypingEventListener';

export default UserTypingEventListener;
