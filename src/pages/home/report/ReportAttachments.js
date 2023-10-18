import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import AttachmentModal from '../../../components/AttachmentModal';
import Navigation from '../../../libs/Navigation/Navigation';
import * as ReportUtils from '../../../libs/ReportUtils';
import ROUTES from '../../../ROUTES';

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
};

function ReportAttachments(props) {
    const reportID = _.get(props, ['route', 'params', 'reportID']);
    const report = ReportUtils.getReport(reportID);
    const source = decodeURI(_.get(props, ['route', 'params', 'source']));

    return (
        <AttachmentModal
            allowDownload
            defaultOpen
            report={report}
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
ReportAttachments.displayName = 'ReportAttachments';

export default ReportAttachments;
