import CONST from '@src/CONST';
import ACTION_FORM_INPUT_IDS from '@src/types/form/DebugReportActionForm';
import REPORT_FORM_INPUT_IDS from '@src/types/form/DebugReportForm';

const DETAILS_DROPDOWN_OPTIONS = {
    chatType: CONST.REPORT.CHAT_TYPE,
    currency: CONST.CURRENCY,
    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE,
    type: CONST.REPORT.TYPE,
    writeCapability: CONST.REPORT.WRITE_CAPABILITIES,
};

const LAST_ACTION_TYPE = 'lastActionType';
const ACTION_NAME = 'actionName';

const DETAILS_SELECTION_LIST = [ACTION_FORM_INPUT_IDS.ACTION_NAME, REPORT_FORM_INPUT_IDS.LAST_ACTION_TYPE] as string[];

export {DETAILS_DROPDOWN_OPTIONS, LAST_ACTION_TYPE, ACTION_NAME, DETAILS_SELECTION_LIST};
