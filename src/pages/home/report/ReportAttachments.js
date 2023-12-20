import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AttachmentModal from '@components/AttachmentModal';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import reportPropTypes from '@pages/reportPropTypes';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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

function ReportAttachments(props) {
    const reportID = _.get(props, ['route', 'params', 'reportID']);
    const report = ReportUtils.getReport(reportID);

    // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
    const decodedSource = decodeURI(_.get(props, ['route', 'params', 'source']));
    const source = Number(decodedSource) || decodedSource;

    const onCarouselAttachmentChange = useCallback(
        (attachment) => {
            const attachmentRoute = ROUTES.REPORT_ATTACHMENTS.getRoute(reportID, attachment.source);
            Navigation.navigate(attachmentRoute);
        },
        [reportID],
    );

    return (
        <AttachmentModal
            allowDownload
            defaultOpen
            report={report}
            source={source}
            onModalHide={() => {
                Navigation.dismissModal();
                // This enables Composer refocus when the attachments modal is closed by the browser navigation
                ComposerFocusManager.setReadyToFocus();
            }}
            onCarouselAttachmentChange={onCarouselAttachmentChange}
        />
    );
}

ReportAttachments.propTypes = propTypes;
ReportAttachments.defaultProps = defaultProps;
ReportAttachments.displayName = 'ReportAttachments';

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${_.get(route, ['params', 'reportID'])}`,
    },
})(ReportAttachments);
