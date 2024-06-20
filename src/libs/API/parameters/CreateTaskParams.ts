type CreateTaskParams = {
    parentReportActionID?: string;
    parentReportID?: string;
    taskReportID?: string;
    createdTaskReportActionID?: string;
    title?: string;
    description?: string;
    assignee?: string;
    assigneeAccountID?: number;
    assigneeChatReportID?: string;
    assigneeChatReportActionID?: string;
    assigneeChatCreatedReportActionID?: string;
};

export default CreateTaskParams;
