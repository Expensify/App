import ReportType from './ReportType';

type TaskType = {
    /** Title of the Task */
    title: string;

    /** Description of the Task */
    description: string;

    /** Share destination of the Task */
    shareDestination: string;

    /** The task report if it's currently being edited */
    report: ReportType;

    assignee: string;
    parentReportID: string;
};

export default TaskType;
