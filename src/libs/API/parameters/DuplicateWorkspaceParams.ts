import type {FileObject} from '@src/types/utils/Attachment';

type DuplicateWorkspaceParams = {
    policyID: string;
    targetPolicyID: string;
    policyName: string;
    parts: string;
    announceChatReportID: string;
    adminsChatReportID: string;
    welcomeNote: string;
    expenseChatReportID: string;
    adminsCreatedReportActionID: string;
    expenseCreatedReportActionID: string;
    announceCreatedReportActionID: string;
    perDiemCustomUnitID: string;
    distanceCustomUnitID: string;
    optimisticRateIDs?: string;
    currency: string;
    hasAcceptedTravelTerms: boolean;
    file?: FileObject;
};

export default DuplicateWorkspaceParams;
