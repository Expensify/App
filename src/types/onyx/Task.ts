import Report from './Report';

type Task = {
    /** Title of the Task */
    title: string;

    /** Description of the Task */
    description?: string;

    // TODO: Make sure this field exists in the API
    /** Share destination of the Task */
    shareDestination?: string;

    /** The task report if it's currently being edited */
    report?: Report;

    /** Assignee of the task */
    assignee?: string;

    /** The account id of the assignee */
    assigneeAccountID?: number;

    /** Report id only when a task was created from a report */
    parentReportID?: string;
};

export default Task;
