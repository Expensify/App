import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry, OnyxKey} from 'react-native-onyx';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTimeOfChronosTimerRunningFromVisibleActions} from '@libs/ChronosUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSortedReportActionsForDisplay} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, canWriteInReport} from '@libs/ReportUtils';
import {addComment} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isLoadingInitialReportActionsSelector} from '@src/selectors/ReportMetaData';
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
    const [timerStartTime] = useOnyx<OnyxKey, string | null>(
        reportActionsOnyxKey,
        {
            selector: (reportActions: unknown): string | null => {
                const sorted = getSortedReportActionsForDisplay(reportActions as OnyxEntry<ReportActions>, canPerformWriteAction, false, visibleReportActionsData, report.reportID);
                return getTimeOfChronosTimerRunningFromVisibleActions(sorted, currentUserAccountID);
            },
        },
        [canPerformWriteAction, visibleReportActionsData, report.reportID, currentUserAccountID],
    );

    const [isLoadingInitialReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${report.reportID}`, {
        selector: isLoadingInitialReportActionsSelector,
    });
    const {isOffline} = useNetwork();

    // Keep the button usable while offline so queued start/stop comments are sent on reconnect.
    // The button should be disabled if the OpenReport request is in progress, so that the state of the button (whether it says "start" or "stop") will reflect the most recent data coming from the server.
    // There is still a possible bug where if you are offline, the button could reflect the wrong state. However, there is really no way to fix this without breaking the offline experience.
    const shouldDisableButton = !!isLoadingInitialReportActions && !isOffline;

    const ancestors = useAncestors(report);
    const isInSidePanel = useIsInSidePanel();
    const delegateAccountID = useDelegateAccountID();

    function formatElapsedTime(startTime: string): string {
        // eslint-disable-next-line react-hooks/purity
        const elapsedMs = Date.now() - new Date(`${startTime}Z`).getTime();
        const totalMinutes = Math.floor(elapsedMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}:${String(minutes).padStart(2, '0')}`;
    }

    function sendCommentToChronos() {
        addComment({
            report,
            notifyReportID: report.reportID,
            ancestors,
            text: timerStartTime ? CONST.CHRONOS.TIMER_COMMAND.STOP : CONST.CHRONOS.TIMER_COMMAND.START,
            timezoneParam: timezoneParam ?? CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID,
            shouldPlaySound: false,
            isInSidePanel,
            delegateAccountID,
        });
    }

    const options: Array<DropdownOption<ChronosAction>> = [
        {
            value: 'timer' as const,
            text: timerStartTime ? translate('chronos.stopTimer', formatElapsedTime(timerStartTime)) : translate('chronos.startTimer'),
            disabled: shouldDisableButton,
            onSelected: () => {
                if (shouldDisableButton) {
                    return;
                }
                callFunctionIfActionIsAllowed(sendCommentToChronos)();
            },
        },
        {
            value: 'scheduleOOO' as const,
            text: translate('chronos.scheduleOOO'),
            disabled: shouldDisableButton,
            onSelected: () => {
                if (shouldDisableButton) {
                    return;
                }
                Navigation.navigate(ROUTES.CHRONOS_SCHEDULE_OOO.getRoute(report.reportID));
            },
            shouldUpdateSelectedIndex: false,
        },
    ];

    if (!canWriteInReport(report)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <ButtonWithDropdownMenu<ChronosAction>
                success={!timerStartTime}
                isDisabled={shouldDisableButton}
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
