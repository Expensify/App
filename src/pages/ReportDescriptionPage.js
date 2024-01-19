import PropTypes from 'prop-types';
import React from 'react';
import * as ReportUtils from '@libs/ReportUtils';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import reportPropTypes from './reportPropTypes';
import RoomDescriptionPage from './RoomDescriptionPage';
import TaskDescriptionPage from './tasks/TaskDescriptionPage';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/roomDescription */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

function ReportDescriptionPage(props) {
    const isTask = ReportUtils.isTaskReport(props.report);

    if (isTask) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <TaskDescriptionPage {...props} />;
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <RoomDescriptionPage {...props} />;
}

ReportDescriptionPage.displayName = 'ReportDescriptionPage';
ReportDescriptionPage.propTypes = propTypes;

export default withReportOrNotFound()(ReportDescriptionPage);
