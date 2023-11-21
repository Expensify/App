import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyRequestSkeletonView from '@components/MoneyRequestSkeletonView';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithoutFeedback';
import refPropTypes from '@components/refPropTypes';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import transactionPropTypes from '@components/transactionPropTypes';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import ControlSelection from '@libs/ControlSelection';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as IOUUtils from '@libs/IOUUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import walletTermsPropTypes from '@pages/EnablePayments/walletTermsPropTypes';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionItemImages from './ReportActionItemImages';

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

    /** The transaction attached to the action.message.iouTransactionID */
    transaction: transactionPropTypes,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    /** Information about the user accepting the terms for payments */
    walletTerms: walletTermsPropTypes,

    /** Whether or not an IOU report contains money requests in a different currency
     * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
     */
    shouldShowPendingConversionMessage: PropTypes.bool,

    /** Whether a message is a whisper */
    isWhisper: PropTypes.bool,

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
    isHovered: false,
    personalDetails: {},
    session: {
        email: null,
    },
    transaction: {},
    shouldShowPendingConversionMessage: false,
    isWhisper: false,
};

function MoneyRequestPreview(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();

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

    const {amount: requestAmount, currency: requestCurrency, comment: requestComment, merchant: requestMerchant} = ReportUtils.getTransactionDetails(props.transaction);
    const description = requestComment;
    const hasReceipt = TransactionUtils.hasReceipt(props.transaction);
    const isScanning = hasReceipt && TransactionUtils.isReceiptBeingScanned(props.transaction);
    const hasFieldErrors = TransactionUtils.hasMissingSmartscanFields(props.transaction);
    const isDistanceRequest = TransactionUtils.isDistanceRequest(props.transaction);
    const isExpensifyCardTransaction = TransactionUtils.isExpensifyCardTransaction(props.transaction);
    const isSettled = ReportUtils.isSettled(props.iouReport.reportID);
    const isDeleted = lodashGet(props.action, 'pendingAction', null) === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    // Show the merchant for IOUs and expenses only if they are custom or not related to scanning smartscan
    const shouldShowMerchant =
        !_.isEmpty(requestMerchant) && !props.isBillSplit && requestMerchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && requestMerchant !== CONST.TRANSACTION.DEFAULT_MERCHANT;
    const shouldShowDescription = !_.isEmpty(description) && !shouldShowMerchant && !isScanning;

    const receiptImages = hasReceipt ? [ReceiptUtils.getThumbnailAndImageURIs(props.transaction)] : [];

    const hasPendingWaypoints = lodashGet(props.transaction, 'pendingFields.waypoints', null);

    const getSettledMessage = () => {
        if (isExpensifyCardTransaction) {
            return props.translate('common.done');
        }
        switch (lodashGet(props.action, 'originalMessage.paymentType', '')) {
            case CONST.IOU.PAYMENT_TYPE.EXPENSIFY:
                return props.translate('iou.settledExpensify');
            default:
                return props.translate('iou.settledElsewhere');
        }
    };

    const showContextMenu = (event) => {
        showContextMenuForReport(event, props.contextMenuAnchor, props.chatReportID, props.action, props.checkIfContextMenuActive);
    };

    const getPreviewHeaderText = () => {
        if (isDistanceRequest) {
            return props.translate('common.distance');
        }

        if (isScanning) {
            return props.translate('common.receipt');
        }

        if (props.isBillSplit) {
            return props.translate('iou.split');
        }

        if (isExpensifyCardTransaction) {
            let message = props.translate('iou.card');
            if (TransactionUtils.isPending(props.transaction)) {
                message += ` • ${props.translate('iou.pending')}`;
            }
            return message;
        }

        let message = props.translate('iou.cash');
        if (ReportUtils.isControlPolicyExpenseReport(props.iouReport) && ReportUtils.isReportApproved(props.iouReport) && !ReportUtils.isSettled(props.iouReport)) {
            message += ` • ${props.translate('iou.approved')}`;
        } else if (props.iouReport.isWaitingOnBankAccount) {
            message += ` • ${props.translate('iou.pending')}`;
        }
        return message;
    };

    const getDisplayAmountText = () => {
        if (isDistanceRequest) {
            return requestAmount && !hasPendingWaypoints ? CurrencyUtils.convertToDisplayString(requestAmount, props.transaction.currency) : props.translate('common.tbd');
        }

        if (isScanning) {
            return props.translate('iou.receiptScanning');
        }

        return CurrencyUtils.convertToDisplayString(requestAmount, requestCurrency);
    };

    const getDisplayDeleteAmountText = () => {
        const {amount, currency} = ReportUtils.getTransactionDetails(props.action.originalMessage);

        if (isDistanceRequest) {
            return CurrencyUtils.convertToDisplayString(TransactionUtils.getAmount(props.action.originalMessage), currency);
        }

        return CurrencyUtils.convertToDisplayString(amount, currency);
    };

    const displayAmount = isDeleted ? getDisplayDeleteAmountText() : getDisplayAmountText();

    const childContainer = (
        <View>
            <OfflineWithFeedback
                errors={props.walletTerms.errors}
                onClose={() => {
                    PaymentMethods.clearWalletTermsError();
                    Report.clearIOUError(props.chatReportID);
                }}
                errorRowStyles={[styles.mbn1]}
                needsOffscreenAlphaCompositing
            >
                <View
                    style={[
                        isScanning || props.isWhisper ? [styles.reportPreviewBoxHoverBorder, styles.reportContainerBorderRadius] : undefined,
                        !props.onPreviewPressed ? [styles.moneyRequestPreviewBox, ...props.containerStyles] : {},
                    ]}
                >
                    {hasReceipt && (
                        <ReportActionItemImages
                            images={receiptImages}
                            isHovered={props.isHovered || isScanning}
                            size={1}
                        />
                    )}
                    {_.isEmpty(props.transaction) &&
                    !ReportActionsUtils.isMessageDeleted(props.action) &&
                    lodashGet(props.action, 'pendingAction') !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? (
                        <MoneyRequestSkeletonView />
                    ) : (
                        <View style={styles.moneyRequestPreviewBoxText}>
                            <View style={[styles.flexRow]}>
                                <Text style={[styles.textLabelSupporting, styles.flex1, styles.lh20, styles.mb1]}>
                                    {getPreviewHeaderText() + (isSettled ? ` • ${getSettledMessage()}` : '')}
                                </Text>
                                {hasFieldErrors && (
                                    <Icon
                                        src={Expensicons.DotIndicator}
                                        fill={theme.danger}
                                    />
                                )}
                            </View>
                            <View style={[styles.flexRow]}>
                                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                    <Text
                                        style={[
                                            styles.textHeadline,
                                            props.isBillSplit && StyleUtils.getAmountFontSizeAndLineHeight(isSmallScreenWidth, windowWidth, displayAmount.length, participantAvatars.length),
                                            isDeleted && styles.lineThrough,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {displayAmount}
                                    </Text>
                                    {ReportUtils.isSettled(props.iouReport.reportID) && !props.isBillSplit && (
                                        <View style={styles.defaultCheckmarkWrapper}>
                                            <Icon
                                                src={Expensicons.Checkmark}
                                                fill={theme.iconSuccessFill}
                                            />
                                        </View>
                                    )}
                                </View>
                                {props.isBillSplit && (
                                    <View style={styles.moneyRequestPreviewBoxAvatar}>
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
                            {shouldShowMerchant && (
                                <View style={[styles.flexRow]}>
                                    <Text style={[styles.textLabelSupporting, styles.mb1, styles.lh20, styles.breakWord]}>
                                        {hasPendingWaypoints ? requestMerchant.replace(CONST.REGEX.FIRST_SPACE, props.translate('common.tbd')) : requestMerchant}
                                    </Text>
                                </View>
                            )}
                            <View style={[styles.flexRow, styles.mt1]}>
                                <View style={[styles.flex1]}>
                                    {!isCurrentUserManager && props.shouldShowPendingConversionMessage && (
                                        <Text style={[styles.textLabel, styles.colorMuted]}>{props.translate('iou.pendingConversionMessage')}</Text>
                                    )}
                                    {shouldShowDescription && <Text style={[styles.colorMuted]}>{description}</Text>}
                                </View>
                                {props.isBillSplit && !_.isEmpty(participantAccountIDs) && requestAmount > 0 && (
                                    <Text style={[styles.textLabel, styles.colorMuted, styles.ml1, styles.amountSplitPadding]}>
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
                    )}
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
            style={[styles.moneyRequestPreviewBox, ...props.containerStyles]}
        >
            {childContainer}
        </PressableWithFeedback>
    );
}

MoneyRequestPreview.propTypes = propTypes;
MoneyRequestPreview.defaultProps = defaultProps;
MoneyRequestPreview.displayName = 'MoneyRequestPreview';

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
        transaction: {
            key: ({action}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${(action && action.originalMessage && action.originalMessage.IOUTransactionID) || 0}`,
        },
        walletTerms: {
            key: ONYXKEYS.WALLET_TERMS,
        },
    }),
)(MoneyRequestPreview);
