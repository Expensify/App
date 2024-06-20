import type Report from './Report';

/** Model of task data */
type Task = {
    /** Title of the Task */
    title?: string;

    /** Description of the Task */
    description?: string;

    /**
     * Report ID of the report where the task will be shared
     *
     * (Note: This variable doesn't exist in the API. It's only used locally for UI purposes)
     */
    shareDestination?: string;

    /** The task report if it's currently being edited */
    report?: Report;

    /** Assignee of the task */
    assignee?: string;

    /** The account id of the assignee */
    assigneeAccountID?: number;

    /** Report id only when a task was created from a report */
    parentReportID?: string;

    /** Chat report with assignee of task */
    assigneeChatReport?: Report;

    /** If set, skip confirmation when creating the task */
    skipConfirmation?: boolean;
};

export default Task;
