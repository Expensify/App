import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {startOrStopChronosTimer} from '@libs/actions/Chronos';
import Navigation from '@libs/Navigation/Navigation';
import {canWriteInReport} from '@libs/ReportUtils';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import type {DropdownOption} from './ButtonWithDropdownMenu/types';

import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';

type ChronosTimerHeaderButtonProps = {
    report: OnyxTypes.Report;
};

type ChronosAction = 'timer' | 'scheduleOOO';

function ChronosTimerHeaderButton({report}: ChronosTimerHeaderButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();

    // The Chronos timer NVP is the true source of whether a timer is running: a non-empty `startTime` means it is.
    const [chronosTimeTracking] = useOnyx(ONYXKEYS.NVP_CHRONOS_TIME_TRACKING);
    const timerStartTime = chronosTimeTracking?.startTime ? chronosTimeTracking.startTime : null;

    function formatElapsedTime(startTime: string): string {
        // eslint-disable-next-line react-hooks/purity
        const elapsedMs = Date.now() - new Date(`${startTime}Z`).getTime();
        const totalMinutes = Math.floor(elapsedMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}:${String(minutes).padStart(2, '0')}`;
    }

    function toggleChronosTimer() {
        startOrStopChronosTimer(report, currentUserAccountID, timerStartTime, delegateAccountID);
    }

    const options: Array<DropdownOption<ChronosAction>> = [
        {
            value: 'timer' as const,
            text: timerStartTime ? translate('chronos.stopTimer', formatElapsedTime(timerStartTime)) : translate('chronos.startTimer'),
            onSelected: () => {
                callFunctionIfActionIsAllowed(toggleChronosTimer)();
            },
        },
        {
            value: 'scheduleOOO' as const,
            text: translate('chronos.scheduleOOO'),
            onSelected: () => {
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
                variant={!timerStartTime ? CONST.BUTTON_VARIANT.SUCCESS : undefined}
                onPress={() => {
                    callFunctionIfActionIsAllowed(toggleChronosTimer)();
                }}
                options={options}
                wrapperStyle={styles.flex1}
                sentryLabel={CONST.SENTRY_LABEL.HEADER_VIEW.CHRONOS_TIMER_BUTTON}
            />
        </View>
    );
}

export default ChronosTimerHeaderButton;
