import _ from 'underscore';
import PropTypes from 'prop-types';
import CONST from '../../../CONST';
import reportActionFragmentPropTypes from './reportActionFragmentPropTypes';

export default {
    /** The ID of the reportAction. It is the string representation of the a 64-bit integer. */
    reportActionID: PropTypes.string,

    /** Name of the action e.g. ADDCOMMENT */
    actionName: PropTypes.string,

    /** Person who created the action */
    person: PropTypes.arrayOf(reportActionFragmentPropTypes),

    /** ISO-formatted datetime */
    created: PropTypes.string,

    /** report action message */
    message: PropTypes.arrayOf(reportActionFragmentPropTypes),

    /** Original message associated with this action */
    originalMessage: PropTypes.shape({
        // The ID of the iou transaction
        IOUTransactionID: PropTypes.string,

        // The ID of the task report
        taskReportID: PropTypes.number,
    }),

    /** Whether we have received a response back from the server */
    isLoading: PropTypes.bool,

    /** Error message that's come back from the server. */
    error: PropTypes.string,

    /** Emails of the people to which the whisper was sent to (if any). Returns empty array if it is not a whisper */
    whisperedTo: PropTypes.arrayOf(PropTypes.string),

    /** ReportID of linked report */
    childReportID: PropTypes.string,

    /** Type of linked report */
    childType: PropTypes.string,

    /** Title of linked task report */
    taskTitle: PropTypes.string,

    /** Assignee of linked task report */
    taskAssignee: PropTypes.string,

    /** Status of child report */
    childStatusNum: PropTypes.oneOf(_.values(CONST.REPORT.STATUS)),

    /** State of child report */
    childStateNum: PropTypes.oneOf(_.values(CONST.REPORT.STATE_NUM)),
};
