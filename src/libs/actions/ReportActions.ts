import Onyx from 'react-native-onyx';
import * as Localize from '@libs/Localize';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportAction, { Message } from '@src/types/onyx/ReportAction';
import OriginalMessage from '@src/types/onyx/OriginalMessage';
import * as Report from './Report';


function clearReportActionErrors(reportID: string, reportAction: ReportAction) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);

    if (!reportAction.reportActionID) {
        return;
    }

    if (reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        // Delete the optimistic action
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
            [reportAction.reportActionID]: null,
        });

        // If there's a linked transaction, delete that too
        const linkedTransactionID = ReportActionUtils.getLinkedTransactionID(originalReportID, reportAction.reportActionID);
        if (linkedTransactionID) {
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID}`, null);
        }

        // Delete the failed task report too
        const taskReportID = reportAction.message?.[0]?.taskReportID;
        if (taskReportID) {
            Report.deleteReport(taskReportID);
        }
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        [reportAction.reportActionID]: {
            errors: null,
        },
    });
}

/**
 * @param originalMessage
 * @param targetAccountIDs
 * @returns
 */
function getReportActionMessageRoomChange(message: Message, originalMessage: OriginalMessage) {
    const targetAccountIDs = 'targetAccountIDs' in originalMessage ? (originalMessage.targetAccountIDs as number[]) : [];
    if (targetAccountIDs.length === 0) {
        return message;
    }

    const mentionTags = targetAccountIDs.map((accountID, index) => {
        if (index === targetAccountIDs.length - 1 && index !== 0) {
            return `${Localize.translateLocal('common.and')} <mention-user accountID=${accountID}></mention-user>`;
        }
        return `<mention-user accountID=${accountID}></mention-user>${targetAccountIDs.length > 1 ? ', ' : ''}`;
    });

    let html = `<muted-text>${Localize.translateLocal('workspace.invite.invited')} ${mentionTags.join('')}`;

    const preposition =
        originalMessage.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.INVITE_TO_ROOM || originalMessage.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.INVITE_TO_ROOM
            ? ` ${Localize.translateLocal('workspace.invite.to')}`
            : ` ${Localize.translateLocal('workspace.invite.from')}`;

    const regex = /<a[^>]*>(.*?)<\/a>/;
    const match = message.html ? message.html.match(regex) : '';
    if (match) {
        const extractedATag = match[0];
        html += `${preposition} ${extractedATag}`;
    }

    html += `</muted-text>`;

    return {
        ...message,
        html,
    };
}

export {
    // eslint-disable-next-line import/prefer-default-export
    clearReportActionErrors,
    getReportActionMessageRoomChange,
};