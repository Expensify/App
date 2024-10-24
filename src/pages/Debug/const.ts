import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ACTION_FORM_INPUT_IDS from '@src/types/form/DebugReportActionForm';
import REPORT_FORM_INPUT_IDS from '@src/types/form/DebugReportForm';
import TRANSACTION_FORM_INPUT_IDS from '@src/types/form/DebugTransactionForm';
import TRANSACTION_VIOLATION_FORM_INPUT_IDS from '@src/types/form/DebugTransactionViolationForm';

type DebugForms = ValueOf<typeof CONST.DEBUG.FORMS>;

type ConstantField = {
    fieldName: string;
    options: Record<string, string | number | Record<string, string>>;
};

type DetailsConstantFields = Record<DebugForms, ConstantField[]>;

const DETAILS_CONSTANT_FIELDS: DetailsConstantFields = {
    [CONST.DEBUG.FORMS.REPORT]: [
        {
            fieldName: REPORT_FORM_INPUT_IDS.CHAT_TYPE,
            options: CONST.REPORT.CHAT_TYPE,
        },
        {
            fieldName: REPORT_FORM_INPUT_IDS.CURRENCY,
            options: CONST.CURRENCY,
        },
        {
            fieldName: REPORT_FORM_INPUT_IDS.NOTIFICATION_PREFERENCE,
            options: CONST.REPORT.NOTIFICATION_PREFERENCE,
        },
        {
            fieldName: REPORT_FORM_INPUT_IDS.TYPE,
            options: CONST.REPORT.TYPE,
        },
        {
            fieldName: REPORT_FORM_INPUT_IDS.LAST_ACTION_TYPE,
            options: CONST.REPORT.ACTIONS.TYPE,
        },
        {
            fieldName: REPORT_FORM_INPUT_IDS.WRITE_CAPABILITY,
            options: CONST.REPORT.WRITE_CAPABILITIES,
        },
        {
            fieldName: REPORT_FORM_INPUT_IDS.VISIBILITY,
            options: CONST.REPORT.VISIBILITY,
        },
        {
            fieldName: REPORT_FORM_INPUT_IDS.STATE_NUM,
            options: CONST.REPORT.STATE_NUM,
        },
        {
            fieldName: REPORT_FORM_INPUT_IDS.STATUS_NUM,
            options: CONST.REPORT.STATUS_NUM,
        },
    ],
    [CONST.DEBUG.FORMS.REPORT_ACTION]: [
        {
            fieldName: ACTION_FORM_INPUT_IDS.ACTION_NAME,
            options: CONST.REPORT.ACTIONS.TYPE,
        },
        {
            fieldName: ACTION_FORM_INPUT_IDS.CHILD_STATUS_NUM,
            options: CONST.REPORT.STATUS_NUM,
        },
        {
            fieldName: ACTION_FORM_INPUT_IDS.CHILD_STATE_NUM,
            options: CONST.REPORT.STATE_NUM,
        },
        {
            fieldName: ACTION_FORM_INPUT_IDS.CHILD_REPORT_NOTIFICATION_PREFERENCE,
            options: CONST.REPORT.NOTIFICATION_PREFERENCE,
        },
    ],
    [CONST.DEBUG.FORMS.TRANSACTION]: [
        {
            fieldName: TRANSACTION_FORM_INPUT_IDS.IOU_REQUEST_TYPE,
            options: CONST.IOU.REQUEST_TYPE,
        },
        {
            fieldName: TRANSACTION_FORM_INPUT_IDS.MODIFIED_CURRENCY,
            options: CONST.CURRENCY,
        },
        {
            fieldName: TRANSACTION_FORM_INPUT_IDS.CURRENCY,
            options: CONST.CURRENCY,
        },
        {
            fieldName: TRANSACTION_FORM_INPUT_IDS.ORIGINAL_CURRENCY,
            options: CONST.CURRENCY,
        },
        {
            fieldName: TRANSACTION_FORM_INPUT_IDS.STATUS,
            options: CONST.TRANSACTION.STATUS,
        },
        {
            fieldName: TRANSACTION_FORM_INPUT_IDS.MCC_GROUP,
            options: CONST.MCC_GROUPS,
        },
        {
            fieldName: TRANSACTION_FORM_INPUT_IDS.MODIFIED_MCC_GROUP,
            options: CONST.MCC_GROUPS,
        },
    ],
    [CONST.DEBUG.FORMS.TRANSACTION_VIOLATION]: [
        {
            fieldName: TRANSACTION_VIOLATION_FORM_INPUT_IDS.NAME,
            options: CONST.VIOLATIONS,
        },
        {
            fieldName: TRANSACTION_VIOLATION_FORM_INPUT_IDS.TYPE,
            options: CONST.VIOLATION_TYPES,
        },
    ],
};

const DETAILS_DATETIME_FIELDS = [
    ACTION_FORM_INPUT_IDS.CREATED,
    ACTION_FORM_INPUT_IDS.LAST_MODIFIED,
    REPORT_FORM_INPUT_IDS.LAST_READ_TIME,
    REPORT_FORM_INPUT_IDS.LAST_VISIBLE_ACTION_CREATED,
    REPORT_FORM_INPUT_IDS.LAST_VISIBLE_ACTION_LAST_MODIFIED,
    TRANSACTION_FORM_INPUT_IDS.MODIFIED_CREATED,
] as string[];

const DETAILS_DISABLED_KEYS = [
    ACTION_FORM_INPUT_IDS.REPORT_ACTION_ID,
    REPORT_FORM_INPUT_IDS.REPORT_ID,
    REPORT_FORM_INPUT_IDS.POLICY_ID,
    TRANSACTION_FORM_INPUT_IDS.TRANSACTION_ID,
] as string[];

export {DETAILS_CONSTANT_FIELDS, DETAILS_DATETIME_FIELDS, DETAILS_DISABLED_KEYS};
export type {DebugForms};
