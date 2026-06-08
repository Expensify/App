import type * as OnyxTypes from '@src/types/onyx';

type TrackedExpenseSubmitParams = {
    actionableWhisperReportActionID?: string;
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction;
    linkedTrackedExpenseReportID?: string;
    isLinkedTrackedExpenseReportArchived?: boolean;
};

export default TrackedExpenseSubmitParams;
