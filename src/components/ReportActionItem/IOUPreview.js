import React from 'react';
import {
    View,
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
import ControlSelection from '../../libs/ControlSelection';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import {showContextMenuForReport} from '../ShowContextMenuContext';
import * as ReportUtils from '../../libs/ReportUtils';
import Button from '../Button';

const propTypes = {
    /** Additional logic for displaying the pay button */
    shouldHidePayButton: PropTypes.bool,

    /** Callback for the Pay/Settle button */
    onPayButtonPressed: PropTypes.func,

    /** The active IOUReport, used for Onyx subscription */
    // eslint-disable-next-line react/no-unused-prop-types
    iouReportID: PropTypes.string.isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** Callback for the preview pressed */
    onPreviewPressed: PropTypes.func,

    /** All the data of the action, used for showing context menu */
    action: PropTypes.shape(reportActionPropTypes),

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor: PropTypes.shape({current: PropTypes.elementType}),

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

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
    })),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

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
    action: undefined,
    contextMenuAnchor: undefined,
    checkIfContextMenuActive: () => {},
    containerStyles: [],
    walletTerms: {},
    pendingAction: null,
    isHovered: false,
    personalDetails: {},
    session: {
        email: null,
    },
};

const IOUPreview = (props) => {
    // Usually the parent determines whether the IOU Preview is displayed. But as the iouReport total cannot be known
    // until it is stored locally, we need to make this check within the Component after retrieving it. This allows us
    // to handle the loading UI from within this Component instead of needing to declare it within each parent, which
    // would duplicate and complicate the logic
    if (props.iouReport.total === 0) {
        return null;
    }

    const sessionEmail = lodashGet(props.session, 'email', null);
    const managerEmail = props.iouReport.managerEmail || '';
    const ownerEmail = props.iouReport.ownerEmail || '';

    // Pay button should only be visible to the manager of the report.
    const isCurrentUserManager = managerEmail === sessionEmail;

    const managerName = ReportUtils.getDisplayNameForParticipant(managerEmail, true);
    const ownerName = ReportUtils.getDisplayNameForParticipant(ownerEmail, true);
    const managerAvatar = {
        source: ReportUtils.getAvatar(lodashGet(props.personalDetails, [managerEmail, 'avatar']), managerEmail),
        type: CONST.ICON_TYPE_AVATAR,
        name: managerEmail,
    };
    const ownerAvatar = {
        source: ReportUtils.getAvatar(lodashGet(props.personalDetails, [ownerEmail, 'avatar']), ownerEmail),
        type: CONST.ICON_TYPE_AVATAR,
        name: ownerEmail,
    };
    const cachedTotal = props.iouReport.total && props.iouReport.currency
        ? props.numberFormat(
            Math.abs(props.iouReport.total) / 100,
            {style: 'currency', currency: props.iouReport.currency},
        ) : '';
    const avatarTooltip = [Str.removeSMSDomain(managerEmail), Str.removeSMSDomain(ownerEmail)];

    const showContextMenu = (event) => {
        // Use action and shouldHidePayButton props to check if we are in IOUDetailsModal,
        // if it's true, do nothing when user long press, otherwise show context menu.
        if (!props.action && props.shouldHidePayButton) {
            return;
        }

        showContextMenuForReport(
            event,
            props.contextMenuAnchor,
            props.chatReportID,
            props.action,
            props.checkIfContextMenuActive,
        );
    };

    return (
        <TouchableWithoutFeedback
            onPress={props.onPreviewPressed}
            onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onLongPress={showContextMenu}
        >
            <View>
                <OfflineWithFeedback
                    pendingAction={props.pendingAction}
                    errors={props.walletTerms.errors}
                    onClose={() => {
                        PaymentMethods.clearWalletTermsError();
                        Report.clearIOUError(props.chatReportID);
                    }}
                    errorRowStyles={[styles.mbn1]}
                    needsOffscreenAlphaCompositing
                >
                    <View style={[styles.iouPreviewBox, ...props.containerStyles]}>
                        <View style={[styles.flexRow]}>
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                <Text style={styles.h1}>
                                    {cachedTotal}
                                </Text>
                                {!props.iouReport.hasOutstandingIOU && (
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
                                        props.isHovered
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
                                    {props.iouReport.hasOutstandingIOU
                                        ? props.translate('iou.youowe', {owner: ownerName})
                                        : props.translate('iou.youpaid', {owner: ownerName})}
                                </Text>
                            )
                            : (
                                <>
                                    <Text>
                                        {props.iouReport.hasOutstandingIOU
                                            ? props.translate('iou.owesyou', {manager: managerName})
                                            : props.translate('iou.paidyou', {manager: managerName})}
                                    </Text>
                                    {props.shouldShowPendingConversionMessage && (
                                        <Text style={[styles.textLabel, styles.colorMuted]}>
                                            {props.translate('iou.pendingConversionMessage')}
                                        </Text>
                                    )}
                                </>
                            )}
                        {(isCurrentUserManager
                            && !props.shouldHidePayButton
                            && props.iouReport.stateNum === CONST.REPORT.STATE_NUM.PROCESSING && (
                                <Button
                                    style={styles.mt4}
                                    onPress={props.onPayButtonPressed}
                                    onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                                    onPressOut={() => ControlSelection.unblock()}
                                    onLongPress={showContextMenu}
                                    text={props.translate('iou.pay')}
                                    success
                                    medium
                                />
                        ))}
                    </View>
                </OfflineWithFeedback>
            </View>
        </TouchableWithoutFeedback>
    );
};

IOUPreview.propTypes = propTypes;
IOUPreview.defaultProps = defaultProps;
IOUPreview.displayName = 'IOUPreview';

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
