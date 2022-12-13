import React from 'react';
import {
    View,
    ActivityIndicator,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import compose from '../../libs/compose';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import MultipleAvatars from '../MultipleAvatars';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import * as Report from '../../libs/actions/Report';
import themeColors from '../../styles/themes/default';
import Icon from '../Icon';
import CONST from '../../CONST';
import * as Expensicons from '../Icon/Expensicons';
import Text from '../Text';
import * as PaymentMethods from '../../libs/actions/PaymentMethods';
import OfflineWithFeedback from '../OfflineWithFeedback';
import walletTermsPropTypes from '../../pages/EnablePayments/walletTermsPropTypes';

const propTypes = {
    /** Additional logic for displaying the pay button */
    shouldHidePayButton: PropTypes.bool,

    /** Callback for the Pay/Settle button */
    onPayButtonPressed: PropTypes.func,

    /** The active IOUReport, used for Onyx subscription */
    iouReportID: PropTypes.string.isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** Callback for the preview pressed */
    onPreviewPressed: PropTypes.func,

    /** Extra styles to pass to View wrapper */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /* Onyx Props */

    /** Active IOU Report for current report */
    iouReport: PropTypes.shape({
        /** Email address of the manager in this iou report */
        managerEmail: PropTypes.string,

        /** Email address of the creator of this iou report */
        ownerEmail: PropTypes.string,

        /** Outstanding amount in cents of this transaction */
        total: PropTypes.number,

        /** Currency of outstanding amount of this transaction */
        currency: PropTypes.string,

        /** Does the iouReport have an outstanding IOU? */
        hasOutstandingIOU: PropTypes.bool,
    }),

    /** True if the IOU Preview card is hovered */
    isHovered: PropTypes.bool,

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

    /** Information about the user accepting the terms for payments */
    walletTerms: walletTermsPropTypes,

    /** Pending action, if any */
    pendingAction: PropTypes.oneOf(_.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),

    ...withLocalizePropTypes,
};

const defaultProps = {
    iouReport: {},
    shouldHidePayButton: false,
    onPayButtonPressed: null,
    onPreviewPressed: () => {},
    containerStyles: [],
    walletTerms: {},
    pendingAction: null,
    isHovered: false,
};

class IOUPreview extends React.Component {
    componentDidMount() {
        if (!_.isEmpty(this.props.iouReport)) {
            return;
        }
        Report.openIOUPreview(this.props.iouReportID, this.props.chatReportID);
    }

    render() {
        // Usually the parent determines whether the IOU Preview is displayed. But as the iouReport total cannot be known
        // until it is stored locally, we need to make this check within the Component after retrieving it. This allows us
        // to handle the loading UI from within this Component instead of needing to declare it within each parent, which
        // would duplicate and complicate the logic
        if (this.props.iouReport.total === 0) {
            return null;
        }

        const sessionEmail = lodashGet(this.props.session, 'email', null);
        const managerEmail = this.props.iouReport.managerEmail || '';
        const ownerEmail = this.props.iouReport.ownerEmail || '';

        // Pay button should only be visible to the manager of the report.
        const isCurrentUserManager = managerEmail === sessionEmail;
        const managerName = lodashGet(this.props.personalDetails, [managerEmail, 'firstName'], '')
                            || Str.removeSMSDomain(managerEmail);
        const ownerName = lodashGet(this.props.personalDetails, [ownerEmail, 'firstName'], '') || Str.removeSMSDomain(ownerEmail);
        const managerAvatar = lodashGet(this.props.personalDetails, [managerEmail, 'avatar'], '');
        const ownerAvatar = lodashGet(this.props.personalDetails, [ownerEmail, 'avatar'], '');
        const cachedTotal = this.props.iouReport.total && this.props.iouReport.currency
            ? this.props.numberFormat(
                Math.abs(this.props.iouReport.total) / 100,
                {style: 'currency', currency: this.props.iouReport.currency},
            ) : '';
        const avatarTooltip = [Str.removeSMSDomain(managerEmail), Str.removeSMSDomain(ownerEmail)];

        return (
            <TouchableWithoutFeedback onPress={this.props.onPreviewPressed}>
                <View style={[styles.iouPreviewBox, ...this.props.containerStyles]}>
                    {_.isEmpty(this.props.iouReport)
                        ? <ActivityIndicator style={styles.iouPreviewBoxLoading} color={themeColors.text} />
                        : (
                            <OfflineWithFeedback
                                pendingAction={this.props.pendingAction}
                                errors={this.props.walletTerms.errors}
                                onClose={() => {
                                    PaymentMethods.clearWalletTermsError();
                                    Report.clearIOUError(this.props.chatReportID);
                                }}
                                errorRowStyles={[styles.mbn1]}
                            >
                                <View>
                                    <View style={[styles.flexRow]}>
                                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                            <Text style={styles.h1}>
                                                {cachedTotal}
                                            </Text>
                                            {!this.props.iouReport.hasOutstandingIOU && (
                                                <View style={styles.iouPreviewBoxCheckmark}>
                                                    <Icon src={Expensicons.Checkmark} fill={themeColors.iconSuccessFill} />
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.iouPreviewBoxAvatar}>
                                            <MultipleAvatars
                                                icons={[managerAvatar, ownerAvatar]}
                                                secondAvatarStyle={[
                                                    styles.secondAvatarInline,
                                                    this.props.isHovered
                                                        ? styles.iouPreviewBoxAvatarHover
                                                        : undefined,
                                                ]}
                                                avatarTooltips={avatarTooltip}
                                            />
                                        </View>
                                    </View>
                                    {isCurrentUserManager
                                        ? (
                                            <Text>
                                                {this.props.iouReport.hasOutstandingIOU
                                                    ? this.props.translate('iou.youowe', {owner: ownerName})
                                                    : this.props.translate('iou.youpaid', {owner: ownerName})}
                                            </Text>
                                        )
                                        : (
                                            <Text>
                                                {this.props.iouReport.hasOutstandingIOU
                                                    ? this.props.translate('iou.owesyou', {manager: managerName})
                                                    : this.props.translate('iou.paidyou', {manager: managerName})}
                                            </Text>
                                        )}
                                    {(isCurrentUserManager
                                        && !this.props.shouldHidePayButton
                                        && this.props.iouReport.stateNum === CONST.REPORT.STATE_NUM.PROCESSING && (
                                        <TouchableOpacity
                                            style={[styles.buttonMedium, styles.buttonSuccess, styles.mt4]}
                                            onPress={this.props.onPayButtonPressed}
                                        >
                                            <Text
                                                style={[
                                                    styles.buttonMediumText,
                                                    styles.buttonSuccessText,
                                                ]}
                                            >
                                                {this.props.translate('iou.pay')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </OfflineWithFeedback>
                        )}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

IOUPreview.propTypes = propTypes;
IOUPreview.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        iouReport: {
            key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        walletTerms: {
            key: ONYXKEYS.WALLET_TERMS,
        },
    }),
)(IOUPreview);
