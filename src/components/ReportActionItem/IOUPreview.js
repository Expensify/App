import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
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
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import * as IOUUtils from '../../libs/IOUUtils';
import * as ReportUtils from '../../libs/ReportUtils';
import * as TransactionUtils from '../../libs/TransactionUtils';
import refPropTypes from '../refPropTypes';
import PressableWithFeedback from '../Pressable/PressableWithoutFeedback';

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
    contextMenuAnchor: refPropTypes,

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    /** Extra styles to pass to View wrapper */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /* Onyx Props */

    /** Active IOU Report for current report */
    iouReport: PropTypes.shape({
        /** Account ID of the manager in this iou report */
        managerID: PropTypes.number,

        /** Account ID of the creator of this iou report */
        ownerAccountID: PropTypes.number,

        /** Outstanding amount in cents of this transaction */
        total: PropTypes.number,

        /** Currency of outstanding amount of this transaction */
        currency: PropTypes.string,

        /** Does the iouReport have an outstanding IOU? */
        hasOutstandingIOU: PropTypes.bool,
    }),

    /** True if this is this IOU is a split instead of a 1:1 request */
    isBillSplit: PropTypes.bool.isRequired,

    /** True if the IOU Preview card is hovered */
    isHovered: PropTypes.bool,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(
        PropTypes.shape({
            /** This is either the user's full name, or their login if full name is an empty string */
            displayName: PropTypes.string,
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
    isHovered: false,
    personalDetails: {},
    session: {
        email: null,
    },
    shouldShowPendingConversionMessage: false,
};

function IOUPreview(props) {
    if (_.isEmpty(props.iouReport) && !props.isBillSplit) {
        return null;
    }
    const sessionAccountID = lodashGet(props.session, 'accountID', null);
    const managerID = props.iouReport.managerID || '';
    const ownerAccountID = props.iouReport.ownerAccountID || '';
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.chatReport);

    const participantAccountIDs = props.isBillSplit ? lodashGet(props.action, 'originalMessage.participantAccountIDs', []) : [managerID, ownerAccountID];
    const participantAvatars = OptionsListUtils.getAvatarsForAccountIDs(participantAccountIDs, props.personalDetails);
    if (isPolicyExpenseChat && props.isBillSplit) {
        participantAvatars.push(ReportUtils.getWorkspaceIcon(props.chatReport));
    }

    // Pay button should only be visible to the manager of the report.
    const isCurrentUserManager = managerID === sessionAccountID;

    const transaction = TransactionUtils.getLinkedTransaction(props.action);
    const {amount: requestAmount, currency: requestCurrency, comment: requestComment} = ReportUtils.getTransactionDetails(transaction);

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
        showContextMenuForReport(event, props.contextMenuAnchor, props.chatReportID, props.action, props.checkIfContextMenuActive);
    };

    const getPreviewHeaderText = () => {
        if (props.isBillSplit) {
            return props.translate('iou.split');
        }

        let message = props.translate('iou.cash');
        if (props.iouReport.isWaitingOnBankAccount) {
            message += ` • ${props.translate('iou.pending')}`;
        } else if (ReportUtils.isSettled(props.iouReport.reportID)) {
            message += ` • ${props.translate('iou.settledExpensify')}`;
        }
        return message;
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
                            <Text style={[styles.textLabelSupporting, styles.mb1, styles.lh16]}>{getPreviewHeaderText()}</Text>
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
                            {ReportUtils.isSettled(props.iouReport.reportID) && !props.isBillSplit && (
                                <View style={styles.defaultCheckmarkWrapper}>
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
                                />
                            </View>
                        )}
                    </View>
                    <View style={[styles.flexRow]}>
                        <View style={[styles.flex1]}>
                            {!isCurrentUserManager && props.shouldShowPendingConversionMessage && (
                                <Text style={[styles.textLabel, styles.colorMuted, styles.mt1]}>{props.translate('iou.pendingConversionMessage')}</Text>
                            )}
                            {!_.isEmpty(requestComment) && <Text style={[styles.mt1, styles.colorMuted]}>{requestComment}</Text>}
                        </View>
                        {props.isBillSplit && !_.isEmpty(participantAccountIDs) && (
                            <Text style={[styles.textLabel, styles.colorMuted, styles.ml1]}>
                                {props.translate('iou.amountEach', {
                                    amount: CurrencyUtils.convertToDisplayString(
                                        IOUUtils.calculateAmount(isPolicyExpenseChat ? 1 : participantAccountIDs.length - 1, requestAmount, requestCurrency),
                                        requestCurrency,
                                    ),
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
        <PressableWithFeedback
            onPress={props.onPreviewPressed}
            onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onLongPress={showContextMenu}
            accessibilityLabel={props.isBillSplit ? props.translate('iou.split') : props.translate('iou.cash')}
            accessibilityHint={CurrencyUtils.convertToDisplayString(requestAmount, requestCurrency)}
        >
            {childContainer}
        </PressableWithFeedback>
    );
}

IOUPreview.propTypes = propTypes;
IOUPreview.defaultProps = defaultProps;
IOUPreview.displayName = 'IOUPreview';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        chatReport: {
            key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
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
