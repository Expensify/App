type CreateTaskParams = {
    parentReportActionID?: string;
    parentReportID?: string;
    taskReportID?: string;
    createdTaskReportActionID?: string;
    htmlTitle?: string;
    description?: string;
    assignee?: string;
    assigneeAccountID?: number;
    assigneeChatReportID?: string;
    assigneeChatReportActionID?: string;
    assigneeChatCreatedReportActionID?: string;
};

export default CreateTaskParams;
