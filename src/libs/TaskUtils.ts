import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {OriginalMessageTaskEdited} from '@src/types/onyx/OriginalMessage';
import type {Message} from '@src/types/onyx/ReportAction';
import type ReportAction from '@src/types/onyx/ReportAction';
import * as CollectionUtils from './CollectionUtils';
import * as Localize from './Localize';
import * as ReportUtils from './ReportUtils';

const allReports: Record<string, Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report, key) => {
        if (!key || !report) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);
        allReports[reportID] = report;
    },
});

function buildMessageFragmentForValue(newValue: string | undefined, valueName: string): string {
    const fieldName = valueName.toLowerCase();

    if (!newValue) {
        return Localize.translateLocal('task.messages.removedField', {fieldName});
    }

    return Localize.translateLocal('task.messages.updatedField', {fieldName, newValueToDisplay: newValue});
}

function getTaskEditedMessage(reportAction: OnyxEntry<ReportAction>) {
    if (reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.TASKEDITED) {
        return {text: ''};
    }

    const originalMessage = reportAction?.originalMessage as OriginalMessageTaskEdited['originalMessage'] | undefined;
    if (!originalMessage) {
        return {
            text: reportAction?.message?.[0].text ?? '',
            html: reportAction?.message?.[0].html,
        };
    }

    const hasModifiedTitle = 'title' in originalMessage;
    if (hasModifiedTitle) {
        return {
            text: buildMessageFragmentForValue(originalMessage.title, Localize.translateLocal('task.title')),
        };
    }

    const hasModifiedDescription = 'description' in originalMessage;
    if (hasModifiedDescription) {
        return {
            text: buildMessageFragmentForValue(originalMessage.description, Localize.translateLocal('task.description')),
        };
    }

    const hasModifiedAssignee = 'assigneeAccountID' in originalMessage;
    if (hasModifiedAssignee) {
        return {
            text: Localize.translateLocal('task.messages.updatedAssignee', {assignee: ReportUtils.getDisplayNameForParticipant(originalMessage.assigneeAccountID)}),
            html: Localize.translateLocal('task.messages.updatedAssignee', {assignee: `<mention-user accountID=${originalMessage.assigneeAccountID}></mention-user>`}),
        };
    }

    return {text: ''};
}

/**
 * Given the Task reportAction name, return the appropriate message to be displayed and copied to clipboard.
 */
function getTaskReportActionMessage(action: OnyxEntry<ReportAction>): Pick<Message, 'text' | 'html'> {
    switch (action?.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED:
            return {text: Localize.translateLocal('task.messages.completed')};
        case CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED:
            return {text: Localize.translateLocal('task.messages.canceled')};
        case CONST.REPORT.ACTIONS.TYPE.TASKREOPENED:
            return {text: Localize.translateLocal('task.messages.reopened')};
        case CONST.REPORT.ACTIONS.TYPE.TASKEDITED:
            return getTaskEditedMessage(action);
        default:
            return {text: Localize.translateLocal('task.task')};
    }
}

function getTaskTitle(taskReportID: string, fallbackTitle = ''): string {
    const taskReport = allReports[taskReportID] ?? {};
    // We need to check for reportID, not just reportName, because when a receiver opens the task for the first time,
    // an optimistic report is created with the only property – reportName: 'Chat report',
    // and it will be displayed as the task title without checking for reportID to be present.
    return Object.hasOwn(taskReport, 'reportID') && taskReport.reportName ? taskReport.reportName : fallbackTitle;
}

function getTaskCreatedMessage(reportAction: OnyxEntry<ReportAction>) {
    const taskReportID = reportAction?.childReportID ?? '';
    const taskTitle = getTaskTitle(taskReportID, reportAction?.childReportName);
    return taskTitle ? Localize.translateLocal('task.messages.created', {title: taskTitle}) : '';
}

export {getTaskReportActionMessage, getTaskTitle, getTaskCreatedMessage};
