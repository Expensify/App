import type {RouteProp} from '@react-navigation/native';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect} from 'react';
import {InteractionManager} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReportPusherSubscriptionManager} from './useReportPusherEventSubscription/types';

type UserTypingEventListenerOnyxProps = {
    /** Stores last visited path */
    lastVisitedPath?: string;
};

type UserTypingEventListenerProps = UserTypingEventListenerOnyxProps & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    userTypingEventSubscriptionManager?: ReportPusherSubscriptionManager;
};
function UserTypingEventListener({report, lastVisitedPath, userTypingEventSubscriptionManager}: UserTypingEventListenerProps) {
    const reportID = report.reportID;
    const isFocused = useIsFocused();
    const route = useRoute<RouteProp<CentralPaneNavigatorParamList, typeof SCREENS.REPORT>>();
    useEffect(() => {
        // Ensures any optimistic report that is being created (ex: a thread report) gets created and initialized successfully before subscribing
        if (route?.params?.reportID !== reportID) {
            return;
        }
        let interactionTask: ReturnType<typeof InteractionManager.runAfterInteractions> | null = null;
        if (isFocused) {
            // Ensures subscription event succeeds when the report/workspace room is created optimistically.
            // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
            // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
            // Existing reports created will have empty fields for `pendingFields`.
            const didCreateReportSuccessfully = !report.pendingFields || (!report.pendingFields.addWorkspaceRoom && !report.pendingFields.createChat);

            if (didCreateReportSuccessfully) {
                interactionTask = InteractionManager.runAfterInteractions(() => {
                    userTypingEventSubscriptionManager?.subscribe(reportID);
                });
            }
        } else {
            const topmostReportId = Navigation.getTopmostReportId();

            if (topmostReportId !== reportID) {
                InteractionManager.runAfterInteractions(() => {
                    userTypingEventSubscriptionManager?.unsubscribe(reportID);
                });
            }
        }
        return () => {
            if (!interactionTask) {
                return;
            }
            interactionTask.cancel();
        };
    }, [isFocused, report.pendingFields, lastVisitedPath, reportID, route, userTypingEventSubscriptionManager]);

    return null;
}

UserTypingEventListener.displayName = 'UserTypingEventListener';

export default withOnyx<UserTypingEventListenerProps, UserTypingEventListenerOnyxProps>({
    lastVisitedPath: {
        key: ONYXKEYS.LAST_VISITED_PATH,
        selector: (path) => path ?? '',
    },
})(UserTypingEventListener);
