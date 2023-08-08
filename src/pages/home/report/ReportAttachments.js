import React, {useEffect, useState} from 'react';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import AttachmentModal from '../../../components/AttachmentModal';
import Navigation from '../../../libs/Navigation/Navigation';
import * as Report from '../../../libs/actions/Report';
import * as ReportActionUtils from '../../../libs/ReportActionsUtils';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import reportPropTypes from '../../reportPropTypes';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen */
        params: PropTypes.shape({
            /** The report ID which the attachment is associated with */
            reportID: PropTypes.string.isRequired,
            /** The uri encoded source of the attachment */
            source: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    /** The report that has this attachment */
    report: reportPropTypes,
};

const defaultProps = {
    report: {},
};

/**
 * Get the currently viewed report ID as number
 *
 * @param {Object} route
 * @param {Object} route.params
 * @param {String} route.params.reportID
 * @returns {String}
 */
function getReportID(route) {
    return String(lodashGet(route, 'params.reportID', null));
}

function ReportAttachments(props) {
    const reportID = _.get(props, ['route', 'params', 'reportID']);
    const source = decodeURI(_.get(props, ['route', 'params', 'source']));
    const [initialReport, setInitialReport] = useState(props.report);

    useEffect(() => {
        if (props.report.reportID && reportID !== props.report.reportID) {
            setInitialReport(props.report);
        }
    }, [reportID, props.report]);

    /** This effects handles 2x cases when report attachments are opened with deep link */
    useEffect(() => {
        // Case 1 - if we are logged out and use the deep link for attachments and then login, then
        // the report will not have reportID yet, and we wouldn't have loaded report and report actions
        // data yet. call openReport to get both report and report actions data
        if (!initialReport.reportID) {
            Report.openReport(reportID);
            return;
        }

        // Case 2 - if we are already logged in and the report actions are not already loading and
        // report has no report actions (even an empty chat will have the 'created' report action),
        // then we are on a page other than report screen. Now call openReport to get report actions
        // since we dont have them in onyx.
        const reportActions = ReportActionUtils.getReportActions(initialReport.reportID);
        if (initialReport.isLoadingReportActions || !_.isEmpty(reportActions)) return;
        Report.openReport(reportID);
    }, [initialReport, reportID]);

    return (
        <AttachmentModal
            allowDownload
            defaultOpen
            report={props.report}
            source={source}
            onModalHide={() => Navigation.dismissModal(reportID)}
            onCarouselAttachmentChange={(attachment) => {
                const route = ROUTES.getReportAttachmentRoute(reportID, attachment.source);
                Navigation.navigate(route);
            }}
        />
    );
}

ReportAttachments.propTypes = propTypes;
ReportAttachments.defaultProps = defaultProps;
ReportAttachments.displayName = 'ReportAttachments';

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${getReportID(route)}`,
    },
})(ReportAttachments);
