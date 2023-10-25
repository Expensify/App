import React, {useEffect, useRef} from 'react';
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
import reportMetadataPropTypes from '../../reportMetadataPropTypes';
import CONST from '../../../CONST';

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

    /** The report metadata */
    reportMetadata: reportMetadataPropTypes,
};

const defaultProps = {
    report: {},
    reportMetadata: {},
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
    const sourceID = (source.match(CONST.REGEX.ATTACHMENT_ID) || [])[1];
    const reportActionsLoadedRef = useRef(false);

    /** This effects handles 2x cases when report attachments are opened with deep link */
    useEffect(() => {
        // return early if report actions are already loaded
        if (reportActionsLoadedRef.current) {
            return;
        }

        // Case 1 - if we are logged out, then use deep link for attachments, then login, then
        // the report will not have reportID as well as actions data loaded yet
        // Case 2 (for small screens) - if we are logged in, then use the deep link for attachments,
        // of a chat we haven't opened after login (from any page other than the chat itself), the
        // report actions are not loaded for that report
        const reportActions = ReportActionUtils.getAllReportActions(reportID);
        if (props.reportMetadata.isLoadingInitialReportActions || (!_.isEmpty(reportActions) && _.has(reportActions, sourceID))) {
            reportActionsLoadedRef.current = true;
            return;
        }

        Report.openReport(reportID);
    }, [props.reportMetadata, reportID, sourceID]);

    return (
        <AttachmentModal
            allowDownload
            defaultOpen
            report={props.report}
            source={source}
            onModalHide={() => Navigation.dismissModal()}
            onCarouselAttachmentChange={(attachment) => {
                const route = ROUTES.REPORT_ATTACHMENTS.getRoute(reportID, attachment.source);
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
    reportMetadata: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_METADATA}${getReportID(route)}`,
    },
})(ReportAttachments);
