import {useIsFocused} from '@react-navigation/native';
import {useEffect} from 'react';
import {DeviceEventEmitter} from 'react-native';
import useAppFocusEvent from '@hooks/useAppFocusEvent';
import useBankAccountUnlockEffect from '@hooks/useBankAccountUnlockEffect';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import {hideEmojiPicker} from '@libs/actions/EmojiPickerAction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import clearReportNotifications from '@libs/Notification/clearReportNotifications';
import {cancelSpan, cancelSpansByPrefix} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ReportLifecycleHandlerProps = {
    reportIDFromRoute: string | undefined;
};

/**
 * Renderless component. Handles screen lifecycle side effects:
 * - Hide emoji picker when screen loses focus
 * - Clear notifications when report is opened/re-focused
 * - DeviceEventEmitter listener for switchToPreExistingReport
 * - Telemetry span cancellation on unmount
 * - Bank account unlock effect
 */
function ReportLifecycleHandler({reportIDFromRoute}: ReportLifecycleHandlerProps) {
    const reportID = getNonEmptyStringOnyxID(reportIDFromRoute);
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const isTopMostReportId = currentReportIDValue === reportIDFromRoute;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    useBankAccountUnlockEffect(report);

    // Hide emoji picker when screen loses focus
    useEffect(() => {
        if (!prevIsFocused || isFocused) {
            return;
        }
        hideEmojiPicker(true);
    }, [prevIsFocused, isFocused]);

    // DeviceEventEmitter listener + telemetry cleanup
    useEffect(() => {
        const skipOpenReportListener = DeviceEventEmitter.addListener(`switchToPreExistingReport_${reportID}`, () => {});

        return () => {
            skipOpenReportListener.remove();

            // Cancel telemetry span when user leaves the screen before full report data is loaded
            cancelSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`);

            // Cancel any pending send-message spans to prevent orphaned spans when navigating away
            cancelSpansByPrefix(CONST.TELEMETRY.SPAN_SEND_MESSAGE);
        };
    }, [reportID]);

    // Clear notifications for the current report when it's opened and re-focused
    const clearNotifications = () => {
        // Check if this is the top-most ReportScreen since the Navigator preserves multiple at a time
        if (!isTopMostReportId) {
            return;
        }

        clearReportNotifications(reportID);
    };

    useEffect(clearNotifications, [clearNotifications]);
    useAppFocusEvent(clearNotifications);

    return null;
}

ReportLifecycleHandler.displayName = 'ReportLifecycleHandler';

export default ReportLifecycleHandler;
