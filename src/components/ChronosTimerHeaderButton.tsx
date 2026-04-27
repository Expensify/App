import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry, OnyxKey} from 'react-native-onyx';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {isChronosTimerRunningFromVisibleActions} from '@libs/ChronosUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSortedReportActionsForDisplay} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, canWriteInReport} from '@libs/ReportUtils';
import {addComment} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';

type ChronosTimerHeaderButtonProps = {
    report: OnyxTypes.Report;
};

type ChronosAction = 'timer' | 'scheduleOOO';

function ChronosTimerHeaderButton({report}: ChronosTimerHeaderButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);

    const {accountID: currentUserAccountID, timezone: timezoneParam} = useCurrentUserPersonalDetails();
    const reportActionsOnyxKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}` as OnyxKey;
    const [isTimerRunning] = useOnyx<OnyxKey, boolean>(
        reportActionsOnyxKey,
        {
            selector: (reportActions: unknown): boolean => {
                const sorted = getSortedReportActionsForDisplay(reportActions as OnyxEntry<ReportActions>, canPerformWriteAction, false, visibleReportActionsData, report.reportID);
                return isChronosTimerRunningFromVisibleActions(sorted, currentUserAccountID);
            },
        },
        [canPerformWriteAction, visibleReportActionsData, report.reportID, currentUserAccountID],
    );

    const ancestors = useAncestors(report);
    const isInSidePanel = useIsInSidePanel();

    function sendCommentToChronos() {
        addComment({
            report,
            notifyReportID: report.reportID,
            ancestors,
            text: isTimerRunning ? CONST.CHRONOS.TIMER_COMMAND.STOP : CONST.CHRONOS.TIMER_COMMAND.START,
            timezoneParam: timezoneParam ?? CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID,
            shouldPlaySound: false,
            isInSidePanel,
        });
    }

    const options: Array<DropdownOption<ChronosAction>> = [
        {
            value: 'timer' as const,
            text: translate(isTimerRunning ? 'chronos.stopTimer' : 'chronos.startTimer'),
            onSelected: () => callFunctionIfActionIsAllowed(sendCommentToChronos)(),
        },
        {
            value: 'scheduleOOO' as const,
            text: translate('chronos.scheduleOOO'),
            onSelected: () => Navigation.navigate(ROUTES.CHRONOS_SCHEDULE_OOO.getRoute(report.reportID)),
            shouldUpdateSelectedIndex: false,
        },
    ];

    if (!canWriteInReport(report)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <ButtonWithDropdownMenu<ChronosAction>
                success={!isTimerRunning}
                onPress={() => {
                    callFunctionIfActionIsAllowed(sendCommentToChronos)();
                }}
                options={options}
                wrapperStyle={styles.flex1}
                sentryLabel={CONST.SENTRY_LABEL.HEADER_VIEW.CHRONOS_TIMER_BUTTON}
            />
        </View>
    );
}

export default ChronosTimerHeaderButton;
