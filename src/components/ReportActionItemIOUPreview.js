import React from 'react';
import {
    View,
    ActivityIndicator,
    TouchableOpacity,
    Text,
    TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import compose from '../libs/compose';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import MultipleAvatars from './MultipleAvatars';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import {fetchIOUReportByID} from '../libs/actions/Report';
import themeColors from '../styles/themes/default';
import Icon from './Icon';
import CONST from '../CONST';
import {Checkmark} from './Icon/Expensicons';

const propTypes = {
    /** Additional logic for displaying the pay button */
    shouldHidePayButton: PropTypes.bool,

    /** Callback for the Pay/Settle button */
    onPayButtonPressed: PropTypes.func,

    /** The active IOUReport, used for Onyx subscription */
    iouReportID: PropTypes.number.isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.number.isRequired,

    /* Onyx Props */

    /** Active IOU Report for current report */
    iouReport: PropTypes.shape({
        /** Email address of the manager in this iou report */
        managerEmail: PropTypes.string,

        /** Email address of the creator of this iou report */
        ownerEmail: PropTypes.string,

        /** Outstanding amount of this transaction */
        cachedTotal: PropTypes.string,

        /** Does the iouReport have an outstanding IOU? */
        hasOutstandingIOU: PropTypes.bool,
    }),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(PropTypes.shape({

        /** This is either the user's full name, or their login if full name is an empty string */
        displayName: PropTypes.string.isRequired,
    })).isRequired,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    iouReport: {},
    shouldHidePayButton: false,
    onPayButtonPressed: null,
};

const ReportActionItemIOUPreview = ({
    iouReportID,
    chatReportID,
    iouReport,
    personalDetails,
    session,
    shouldHidePayButton,
    onPayButtonPressed,
    onPreviewPressed,
    translate,
}) => {
    // Usually the parent determines whether the IOU Preview is displayed. But as the iouReport total cannot be known
    // until it is stored locally, we need to make this check within the Component after retrieving it. This allows us
    // to handle the loading UI from within this Component instead of needing to declare it within each parent, which
    // would duplicate and complicate the logic
    if (iouReport.total === 0) {
        return null;
    }

    const sessionEmail = lodashGet(session, 'email', null);
    const managerEmail = iouReport.managerEmail || '';
    const ownerEmail = iouReport.ownerEmail || '';

    // Pay button should only be visible to the manager of the report.
    const isCurrentUserManager = managerEmail === sessionEmail;
    const reportIsLoading = _.isEmpty(iouReport);

    if (reportIsLoading) {
        fetchIOUReportByID(iouReportID, chatReportID);
    }

    const managerName = lodashGet(personalDetails, [managerEmail, 'firstName'], '')
                        || Str.removeSMSDomain(managerEmail);
    const ownerName = lodashGet(personalDetails, [ownerEmail, 'firstName'], '') || Str.removeSMSDomain(ownerEmail);
    const managerAvatar = lodashGet(personalDetails, [managerEmail, 'avatar'], '');
    const ownerAvatar = lodashGet(personalDetails, [ownerEmail, 'avatar'], '');
    const cachedTotal = iouReport.cachedTotal ? iouReport.cachedTotal.replace(/[()]/g, '') : '';
    return (
        <TouchableWithoutFeedback onPress={onPreviewPressed}>
            <View style={styles.iouPreviewBox}>
                {reportIsLoading
                    ? <ActivityIndicator style={styles.iouPreviewBoxLoading} color={themeColors.text} />
                    : (
                        <View>
                            <View style={styles.flexRow}>
                                <View style={styles.flex1}>
                                    <View style={styles.flexRow}>
                                        <Text style={styles.h1}>
                                            {cachedTotal}
                                        </Text>
                                        {!iouReport.hasOutstandingIOU && (
                                            <View style={styles.iouPreviewBoxCheckmark}>
                                                <Icon src={Checkmark} fill={themeColors.iconSuccessFill} />
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.iouPreviewBoxAvatar}>
                                    <MultipleAvatars
                                        avatarImageURLs={[managerAvatar, ownerAvatar]}
                                        secondAvatarStyle={[styles.secondAvatarInline]}
                                    />
                                </View>
                            </View>
                            <Text>
                                {iouReport.hasOutstandingIOU
                                    ? translate('iou.owes', {manager: managerName, owner: ownerName})
                                    : translate('iou.paid', {manager: managerName, owner: ownerName})}
                            </Text>
                            {(isCurrentUserManager
                                && !shouldHidePayButton
                                && iouReport.stateNum === CONST.REPORT.STATE_NUM.PROCESSING && (
                                <TouchableOpacity
                                    style={[styles.buttonSmall, styles.buttonSuccess, styles.mt4]}
                                    onPress={onPayButtonPressed}
                                >
                                    <Text
                                        style={[
                                            styles.buttonSmallText,
                                            styles.buttonSuccessText,
                                        ]}
                                    >
                                        {translate('iou.pay')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
            </View>
        </TouchableWithoutFeedback>
    );
};

ReportActionItemIOUPreview.propTypes = propTypes;
ReportActionItemIOUPreview.defaultProps = defaultProps;
ReportActionItemIOUPreview.displayName = 'ReportActionItemIOUPreview';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        iouReport: {
            key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ReportActionItemIOUPreview);
