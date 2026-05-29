import {Portal} from '@gorhom/portal';
import React, {useEffect, useRef} from 'react';
import ConfettiCannonContainer from '@components/ConfettiCannon/ConfettiCannonContainer';
import type {ConfettiCannonHandle} from '@components/ConfettiCannon/ConfettiCannonContainer';
import {isReportActionUnread} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const GOAL_MESSAGE = "You've hit your goal for this week";

type ChronosGoalCelebrationProps = {
    reportActions: OnyxTypes.ReportAction[];
    lastReadTime: string | undefined;
};

function ChronosGoalCelebration({reportActions, lastReadTime}: ChronosGoalCelebrationProps) {
    const ref = useRef<ConfettiCannonHandle>(null);

    useEffect(() => {
        if (lastReadTime === undefined) {
            return;
        }

        for (const action of reportActions) {
            if (action.actorAccountID !== CONST.ACCOUNT_ID.CHRONOS) {
                continue;
            }

            if (!isReportActionUnread(action, lastReadTime)) {
                continue;
            }

            const message = Array.isArray(action.message) ? action.message.at(0) : undefined;
            const text = message && 'text' in message ? (message.text ?? '') : '';
            if (!text.includes(GOAL_MESSAGE)) {
                continue;
            }

            ref.current?.trigger();
            break;
        }
    }, [reportActions, lastReadTime]);

    return (
        <Portal hostName="SparkleFall">
            <ConfettiCannonContainer ref={ref} />
        </Portal>
    );
}

export default ChronosGoalCelebration;
