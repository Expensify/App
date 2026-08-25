import type {REPORT_ACTION_TYPES} from '@src/CONST/REPORT_ACTION_TYPES';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

/** The name (or type) of a report action. */
type ReportActionName = DeepValueOf<typeof REPORT_ACTION_TYPES>;

/** Required properties shared by every report action. */
type ReportActionCore = {
    /** The ID of the report action. It is the string representation of a 64-bit integer. */
    reportActionID: string;

    /** The name (or type) of the action. */
    actionName: ReportActionName;

    /** ISO-formatted datetime. */
    created: string;
};

export type {ReportActionCore, ReportActionName};
