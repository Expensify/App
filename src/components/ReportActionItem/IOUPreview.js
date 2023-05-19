import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
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
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import * as IOUUtils from '../../libs/IOUUtils';
import * as ReportUtils from '../../libs/ReportUtils';

const propTypes = {
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

    /** True if this is this IOU is a split instead of a 1:1 request */
    isBillSplit: PropTypes.bool.isRequired,

    /** True if the IOU Preview is rendered within a single IOUAction */
    isIOUAction: PropTypes.bool,

    /** True if the IOU Preview card is hovered */
    isHovered: PropTypes.bool,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(
        PropTypes.shape({
            /** This is either the user's full name, or their login if full name is an empty string */
            displayName: PropTypes.string.isRequired,
        }),
    ),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    /** Information about the user accepting the terms for payments */
    walletTerms: walletTermsPropTypes,

    /** Pending action, if any */
    pendingAction: PropTypes.oneOf(_.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),

    /** Whether or not an IOU report contains money requests in a different currency
     * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
     */
    shouldShowPendingConversionMessage: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    iouReport: {},
    onPreviewPressed: null,
    action: undefined,
    contextMenuAnchor: undefined,
    checkIfContextMenuActive: () => {},
    containerStyles: [],
    walletTerms: {},
    pendingAction: null,
    isIOUAction: true,
    isHovered: false,
    personalDetails: {},
    session: {
        email: null,
    },
    shouldShowPendingConversionMessage: false,
};

const IOUPreview = (props) => {
    if (_.isEmpty(props.iouReport)) {
        return null;
    }
    const sessionEmail = lodashGet(props.session, 'email', null);
    const managerEmail = props.iouReport.managerEmail || '';
    const ownerEmail = props.iouReport.ownerEmail || '';

    // When displaying within a IOUDetailsModal we cannot guarantee that participants are included in the originalMessage data
    // Because an IOUPreview of type split can never be rendered within the IOUDetailsModal, manually building the email array is only needed for non-billSplit ious
    const participantEmails = props.isBillSplit ? lodashGet(props.action, 'originalMessage.participants', []) : [managerEmail, ownerEmail];
    const participantAvatars = OptionsListUtils.getAvatarsForLogins(participantEmails, props.personalDetails);

    // Pay button should only be visible to the manager of the report.
    const isCurrentUserManager = managerEmail === sessionEmail;

    const moneyRequestAction = ReportUtils.getMoneyRequestAction(props.action);

    // If props.action is undefined then we are displaying within IOUDetailsModal and should use the full report amount
    const requestAmount = props.isIOUAction ? moneyRequestAction.amount : ReportUtils.getMoneyRequestTotal(props.iouReport);
    const requestCurrency = props.isIOUAction ? moneyRequestAction.currency : props.iouReport.currency;
    const requestComment = Str.htmlDecode(moneyRequestAction.comment).trim();

    const getSettledMessage = () => {
        switch (lodashGet(props.action, 'originalMessage.paymentType', '')) {
            case CONST.IOU.PAYMENT_TYPE.PAYPAL_ME:
                return props.translate('iou.settledPaypalMe');
            case CONST.IOU.PAYMENT_TYPE.ELSEWHERE:
                return props.translate('iou.settledElsewhere');
            case CONST.IOU.PAYMENT_TYPE.EXPENSIFY:
                return props.translate('iou.settledExpensify');
            default:
                return '';
        }
    };

    const showContextMenu = (event) => {
        // Use action prop to check if we are in IOUDetailsModal,
        // if it's true, do nothing when user long press, otherwise show context menu.
        if (!props.action) {
            return;
        }

        showContextMenuForReport(event, props.contextMenuAnchor, props.chatReportID, props.action, props.checkIfContextMenuActive);
    };

    const childContainer = (
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
                            <Text style={[styles.textLabelSupporting, styles.lh16]}>{props.isBillSplit ? props.translate('iou.split') : props.translate('iou.cash')}</Text>
                            {Boolean(getSettledMessage()) && (
                                <>
                                    <Icon
                                        src={Expensicons.DotIndicator}
                                        width={4}
                                        height={4}
                                        additionalStyles={[styles.mr1, styles.ml1]}
                                    />
                                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{getSettledMessage()}</Text>
                                </>
                            )}
                        </View>
                    </View>
                    <View style={[styles.flexRow]}>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text style={styles.textHeadline}>{CurrencyUtils.convertToDisplayString(requestAmount, requestCurrency)}</Text>
                            {!props.iouReport.hasOutstandingIOU && !props.isBillSplit && (
                                <View style={styles.iouPreviewBoxCheckmark}>
                                    <Icon
                                        src={Expensicons.Checkmark}
                                        fill={themeColors.iconSuccessFill}
                                    />
                                </View>
                            )}
                        </View>
                        {props.isBillSplit && (
                            <View style={styles.iouPreviewBoxAvatar}>
                                <MultipleAvatars
                                    icons={participantAvatars}
                                    shouldStackHorizontally
                                    size="small"
                                    isHovered={props.isHovered}
                                    shouldUseCardBackground
                                    avatarTooltips={participantEmails}
                                />
                            </View>
                        )}
                    </View>
                    <View style={[styles.flexRow]}>
                        <View style={[styles.flex1]}>
                            {!isCurrentUserManager && props.shouldShowPendingConversionMessage && (
                                <Text style={[styles.textLabel, styles.colorMuted]}>{props.translate('iou.pendingConversionMessage')}</Text>
                            )}
                            {!_.isEmpty(requestComment) && <Text style={[styles.colorMuted]}>{requestComment}</Text>}
                        </View>
                        {props.isBillSplit && !_.isEmpty(participantEmails) && (
                            <Text style={[styles.textLabel, styles.colorMuted, styles.ml1]}>
                                {props.translate('iou.amountEach', {
                                    amount: CurrencyUtils.convertToDisplayString(IOUUtils.calculateAmount(participantEmails.length - 1, requestAmount), requestCurrency),
                                })}
                            </Text>
                        )}
                    </View>
                </View>
            </OfflineWithFeedback>
        </View>
    );

    if (!props.onPreviewPressed) {
        return childContainer;
    }

    return (
        <Pressable
            onPress={props.onPreviewPressed}
            onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onLongPress={showContextMenu}
        >
            {childContainer}
        </Pressable>
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
