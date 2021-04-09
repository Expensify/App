import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../ONYXKEYS';
import ReportActionItemIOUQuote from './ReportActionItemIOUQuote';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import Text from './Text';
import MultipleAvatars from './MultipleAvatars';
import styles from '../styles/styles';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Is this the most recent IOU Action?
    isMostRecentIOUReportAction: PropTypes.bool.isRequired,

    // The report currently being looked at
    report: PropTypes.shape({

        // IOU report ID associated with current report
        iouReportID: PropTypes.number,

        // Whether there is an outstanding amount in IOU
        hasOutstandingIOU: PropTypes.bool,
    }).isRequired,

    /* --- Onyx Props --- */
    // Active IOU Report for current report
    iou: PropTypes.shape({
        // Email address of the manager in this iou report
        managerEmail: PropTypes.string,

        // Email address of the creator of this iou report
        ownerEmail: PropTypes.string,

        // Outstanding amount of this transaction
        cachedTotal: PropTypes.string,
    }),

    // All of the personal details for everyone
    personalDetails: PropTypes.objectOf(PropTypes.shape({

        // This is either the user's full name, or their login if full name is an empty string
        displayName: PropTypes.string.isRequired,
    })).isRequired,

    // Session info for the currently logged in user.
    session: PropTypes.shape({
        // Currently logged in user email
        email: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    iou: {},
};

const ReportActionItemIOUPreview = ({
    action,
    isMostRecentIOUReportAction,
    report,
    iou,
    personalDetails,
    session,
}) => {
    const managerName = lodashGet(personalDetails, [iou.managerEmail, 'displayName'], iou.managerEmail);
    const ownerName = lodashGet(personalDetails, [iou.ownerEmail, 'displayName'], iou.ownerEmail);
    const managerAvatar = lodashGet(personalDetails, [iou.managerEmail, 'avatar'], '');
    const ownerAvatar = lodashGet(personalDetails, [iou.ownerEmail, 'avatar'], '');
    const sessionEmail = lodashGet(session, 'email', null);
    const cachedTotal = iou.cachedTotal ? iou.cachedTotal.replace(/[()]/g, '') : '';

    return (
        <View>
            <ReportActionItemIOUQuote action={action} />
            {isMostRecentIOUReportAction
                    && report.hasOutstandingIOU
                    && iou ? (
                        <View style={styles.iouPreviewBox}>
                            <View style={styles.flexRow}>
                                <View style={styles.flex1}>
                                    <Text style={styles.h1}>{cachedTotal}</Text>
                                    <Text style={styles.mt2}>
                                        {managerName}
                                        {' owes '}
                                        {ownerName}
                                    </Text>
                                </View>
                                <View style={styles.iouPreviewBoxAvatar}>
                                    <MultipleAvatars
                                        avatarImageURLs={[managerAvatar, ownerAvatar]}
                                        secondAvatarStyle={[styles.secondAvatarInline]}
                                    />
                                </View>
                            </View>
                            {(iou.managerEmail === sessionEmail) ? (
                                <TouchableOpacity
                                    style={[styles.buttonSmall, styles.buttonSuccess, styles.mt4]}
                                >
                                    <Text
                                        style={[
                                            styles.buttonSmallText,
                                            styles.buttonSuccessText,
                                        ]}
                                    >
                                        Pay
                                    </Text>
                                </TouchableOpacity>
                            )
                                : null}
                        </View>
                )
                : null}
        </View>
    );
};

ReportActionItemIOUPreview.propTypes = propTypes;
ReportActionItemIOUPreview.defaultProps = defaultProps;
ReportActionItemIOUPreview.displayName = 'ReportActionItemIOUPreview';

export default withOnyx({
    iou: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${report.iouReportID}`,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ReportActionItemIOUPreview);
