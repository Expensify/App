import React from 'react';
import PropTypes from 'prop-types';
import reportPropTypes from '../../reportPropTypes';
import ShareCodePage from '../../ShareCodePage';
import withReportOrNotFound from './withReportOrNotFound';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen */
        params: PropTypes.shape({
            reportID: PropTypes.string,
        }).isRequired,
    }).isRequired,

    /** The report currently being looked at */
    report: reportPropTypes,
};

const defaultProps = {
    report: undefined,
};

function ReportDetailsShareCodePage(props) {
    return <ShareCodePage report={props.report} />;
}

ReportDetailsShareCodePage.propTypes = propTypes;
ReportDetailsShareCodePage.defaultProps = defaultProps;

export default withReportOrNotFound()(ReportDetailsShareCodePage);
