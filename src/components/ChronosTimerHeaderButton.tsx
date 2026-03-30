import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry, OnyxKey} from 'react-native-onyx';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSortedReportActionsForDisplay, isChronosTimerRunningFromVisibleActions} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, canWriteInReport} from '@libs/ReportUtils';
import {addComment} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import Button from './Button';

type ChronosTimerHeaderButtonProps = {
    report: OnyxTypes.Report;
};

function ChronosTimerHeaderButton({report}: ChronosTimerHeaderButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const canPerformWriteAction = useMemo(() => canUserPerformWriteAction(report, isReportArchived), [report, isReportArchived]);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);

    const getSortedVisibleReportActions = useCallback(
        (reportActions: unknown): OnyxTypes.ReportAction[] =>
            getSortedReportActionsForDisplay(reportActions as OnyxEntry<ReportActions>, canPerformWriteAction, false, visibleReportActionsData, report.reportID),
        [canPerformWriteAction, visibleReportActionsData, report.reportID],
    );

    const reportActionsOnyxKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}` as OnyxKey;
    const [sortedVisibleReportActions = getEmptyArray<OnyxTypes.ReportAction>()] = useOnyx<OnyxKey, OnyxTypes.ReportAction[]>(
        reportActionsOnyxKey,
        {selector: getSortedVisibleReportActions},
        [getSortedVisibleReportActions],
    );

    const {accountID: currentUserAccountID, timezone: timezoneParam} = useCurrentUserPersonalDetails();
    const ancestors = useAncestors(report);
    const isInSidePanel = useIsInSidePanel();

    const isTimerRunning = useMemo(() => {
        if (typeof currentUserAccountID !== 'number') {
            return false;
        }
        return isChronosTimerRunningFromVisibleActions(sortedVisibleReportActions, currentUserAccountID);
    }, [sortedVisibleReportActions, currentUserAccountID]);

    if (!canWriteInReport(report) || typeof currentUserAccountID !== 'number') {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <Button
                success
                text={translate(isTimerRunning ? 'chronos.stopTimer' : 'chronos.startTimer')}
                onPress={callFunctionIfActionIsAllowed(() => {
                    addComment({
                        report,
                        notifyReportID: report.reportID,
                        ancestors,
                        text: isTimerRunning ? 'stop' : 'start',
                        timezoneParam: timezoneParam ?? CONST.DEFAULT_TIME_ZONE,
                        currentUserAccountID,
                        shouldPlaySound: false,
                        isInSidePanel,
                    });
                })}
                style={styles.flex1}
                sentryLabel={CONST.SENTRY_LABEL.HEADER_VIEW.CHRONOS_TIMER_BUTTON}
            />
        </View>
    );
}

export default ChronosTimerHeaderButton;
