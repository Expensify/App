import {useEffect, useState} from 'react';
import {getReportActionMessage, isPendingRemove} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

function useActionModeration(action: OnyxTypes.ReportAction) {
    const [isHidden, setIsHidden] = useState(false);
    const [moderationDecision, setModerationDecision] = useState<OnyxTypes.DecisionName>(CONST.MODERATION.MODERATOR_DECISION_APPROVED);

    const latestDecision = getReportActionMessage(action)?.moderationDecision?.decision ?? '';
    useEffect(() => {
        if (action.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
            return;
        }

        if (!latestDecision) {
            setModerationDecision(CONST.MODERATION.MODERATOR_DECISION_APPROVED);
            setIsHidden(false);
            return;
        }

        setModerationDecision(latestDecision);
        if (![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === latestDecision) && !isPendingRemove(action)) {
            setIsHidden(true);
            return;
        }
        setIsHidden(false);
    }, [latestDecision, action]);

    return {isHidden, setIsHidden, moderationDecision};
}

export default useActionModeration;
