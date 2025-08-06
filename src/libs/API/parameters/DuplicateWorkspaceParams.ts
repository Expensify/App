import type {FileObject} from '@pages/media/AttachmentModalScreen/types';

type DuplicateWorkspaceParams = {
    policyID: string;
    targetPolicyID: string;
    policyName: string;
    parts: Record<string, boolean>;
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
