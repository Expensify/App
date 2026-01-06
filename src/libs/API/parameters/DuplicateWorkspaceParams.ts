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
    announceChatReportActionID: string;
    customUnitID: string;
    customUnitRateID: string;
    file?: FileObject;
};

export default DuplicateWorkspaceParams;
