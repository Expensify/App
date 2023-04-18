import * as API from '../API';
import * as Report from './Report';

/**
 * Assign a task to a user
 * @param {String} parentReportActionID
 * @param {String} parentReportID
 * @param {String} taskReportID
 * @param {String} name
 * @param {String} description
 * @param {String} assignee
 *
 */

function assignTask(parentReportActionID, parentReportID, taskReportID, name, description, assignee) {
    const parentReport = Report.getReportByID(parentReportID);

    const optimisticData = {};

    const successData = {};

    const failureData = {};

    return API.write(
        'CreateTask',
        {
            parentReportActionID,
            parentReportID,
            taskReportID,
            name,
            description,
            assignee,
        },
        {optimisticData, successData, failureData},
    );
}

// eslint-disable-next-line import/prefer-default-export
export {assignTask};
