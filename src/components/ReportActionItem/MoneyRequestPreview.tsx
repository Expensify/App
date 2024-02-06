import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import {truncate} from 'lodash';
import lodashSortBy from 'lodash/sortBy';
import React from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyRequestSkeletonView from '@components/MoneyRequestSkeletonView';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithoutFeedback';
import RenderHTML from '@components/RenderHTML';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ControlSelection from '@libs/ControlSelection';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as IOUUtils from '@libs/IOUUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import * as Localize from '@src/libs/Localize';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {IOUMessage} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import ReportActionItemImages from './ReportActionItemImages';

type MoneyRequestPreviewOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;

    /** Chat report associated with iouReport */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** IOU report data object */
    iouReport: OnyxEntry<OnyxTypes.Report>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;

    /** The transaction attached to the action.message.iouTransactionID */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Information about the user accepting the terms for payments */
    walletTerms: OnyxEntry<OnyxTypes.WalletTerms>;
};

type MoneyRequestPreviewProps = MoneyRequestPreviewOnyxProps & {
    /** The active IOUReport, used for Onyx subscription */
    // The iouReportID is used inside withOnyx HOC
    // eslint-disable-next-line react/no-unused-prop-types
    iouReportID: string;

    /** The associated chatReport */
    chatReportID: string;

    /** The ID of the current report */
    reportID: string;

    /** Callback for the preview pressed */
    onPreviewPressed: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** All the data of the action, used for showing context menu */
    action: OnyxTypes.ReportAction;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** True if this is this IOU is a split instead of a 1:1 request */
    isBillSplit: boolean;

    /** True if the IOU Preview card is hovered */
    isHovered?: boolean;

    /** Whether or not an IOU report contains money requests in a different currency
     * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
     */
    shouldShowPendingConversionMessage?: boolean;

    /** Whether a message is a whisper */
    isWhisper?: boolean;
};

function MoneyRequestPreview({
    iouReport,
    isBillSplit,
    session,
    action,
    personalDetails,
    chatReport,
    transaction,
    contextMenuAnchor,
    chatReportID,
    reportID,
    onPreviewPressed,
    containerStyles,
    walletTerms,
    checkIfContextMenuActive = () => {},
    shouldShowPendingConversionMessage = false,
    isHovered = false,
    isWhisper = false,
}: MoneyRequestPreviewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();
    const parser = new ExpensiMark();

    if (isEmptyObject(iouReport) && !isBillSplit) {
        return null;
    }

    const sessionAccountID = session?.accountID;
    const managerID = iouReport?.managerID ?? -1;
    const ownerAccountID = iouReport?.ownerAccountID ?? -1;
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(chatReport);

    const participantAccountIDs = action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && isBillSplit ? action.originalMessage.participantAccountIDs ?? [] : [managerID, ownerAccountID];
    const participantAvatars = OptionsListUtils.getAvatarsForAccountIDs(participantAccountIDs, personalDetails ?? {});
    const sortedParticipantAvatars = lodashSortBy(participantAvatars, (avatar) => avatar.id);
    if (isPolicyExpenseChat && isBillSplit) {
        sortedParticipantAvatars.push(ReportUtils.getWorkspaceIcon(chatReport));
    }

    // Pay button should only be visible to the manager of the report.
    const isCurrentUserManager = managerID === sessionAccountID;

    const {amount: requestAmount, currency: requestCurrency, comment: requestComment, merchant} = ReportUtils.getTransactionDetails(transaction) ?? {};
    const description = truncate(requestComment, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const requestMerchant = truncate(merchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const hasReceipt = TransactionUtils.hasReceipt(transaction);
    const isScanning = hasReceipt && TransactionUtils.isReceiptBeingScanned(transaction);
    const hasFieldErrors = TransactionUtils.hasMissingSmartscanFields(transaction);
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const isCardTransaction = TransactionUtils.isCardTransaction(transaction);
    const isSettled = ReportUtils.isSettled(iouReport?.reportID);
    const isDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    // Show the merchant for IOUs and expenses only if they are custom or not related to scanning smartscan
    const shouldShowMerchant = !!requestMerchant && requestMerchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && requestMerchant !== CONST.TRANSACTION.DEFAULT_MERCHANT;
    const shouldShowDescription = !!description && !shouldShowMerchant && !isScanning;
    const hasPendingWaypoints = transaction?.pendingFields?.waypoints;

    let merchantOrDescription = requestMerchant;
    if (!shouldShowMerchant) {
        merchantOrDescription = description || '';
    } else if (hasPendingWaypoints) {
        merchantOrDescription = requestMerchant.replace(CONST.REGEX.FIRST_SPACE, translate('common.tbd'));
    }

    const receiptImages = hasReceipt ? [ReceiptUtils.getThumbnailAndImageURIs(transaction)] : [];

    const getSettledMessage = (): string => {
        if (isCardTransaction) {
            return translate('common.done');
        }
        return translate('iou.settledExpensify');
    };

    const showContextMenu = (event: GestureResponderEvent) => {
        showContextMenuForReport(event, contextMenuAnchor, reportID, action, checkIfContextMenuActive);
    };

    const getPreviewHeaderText = (): string => {
        if (isDistanceRequest) {
            return translate('common.distance');
        }

        if (isScanning) {
            return translate('common.receipt');
        }

        if (isBillSplit) {
            return translate('iou.split');
        }

        if (isCardTransaction) {
            let message = translate('iou.card');
            if (TransactionUtils.isPending(transaction)) {
                message += ` • ${translate('iou.pending')}`;
            }
            return message;
        }

        let message = translate('iou.cash');
        if (ReportUtils.isPaidGroupPolicyExpenseReport(iouReport) && ReportUtils.isReportApproved(iouReport) && !ReportUtils.isSettled(iouReport?.reportID)) {
            message += ` • ${translate('iou.approved')}`;
        } else if (iouReport?.isWaitingOnBankAccount) {
            message += ` • ${translate('iou.pending')}`;
        } else if (iouReport?.isCancelledIOU) {
            message += ` • ${translate('iou.canceled')}`;
        }
        return message;
    };

    const getDisplayAmountText = (): string => {
        if (isDistanceRequest) {
            return requestAmount && !hasPendingWaypoints ? CurrencyUtils.convertToDisplayString(requestAmount, requestCurrency) : translate('common.tbd');
        }

        if (isScanning) {
            return translate('iou.receiptScanning');
        }

        if (!isSettled && TransactionUtils.hasMissingSmartscanFields(transaction)) {
            return Localize.translateLocal('iou.receiptMissingDetails');
        }

        return CurrencyUtils.convertToDisplayString(requestAmount, requestCurrency);
    };

    const getDisplayDeleteAmountText = (): string => {
        const iouOriginalMessage: IOUMessage | EmptyObject = action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? action.originalMessage : {};
        const {amount = 0, currency = CONST.CURRENCY.USD} = iouOriginalMessage;

        return CurrencyUtils.convertToDisplayString(amount, currency);
    };

    const displayAmount = isDeleted ? getDisplayDeleteAmountText() : getDisplayAmountText();

    const childContainer = (
        <View>
            <OfflineWithFeedback
                errors={walletTerms?.errors}
                onClose={() => {
                    PaymentMethods.clearWalletTermsError();
                    Report.clearIOUError(chatReportID);
                }}
                errorRowStyles={[styles.mbn1]}
                needsOffscreenAlphaCompositing
            >
                <View
                    style={[
                        isScanning || isWhisper ? [styles.reportPreviewBoxHoverBorder, styles.reportContainerBorderRadius] : undefined,
                        !onPreviewPressed ? [styles.moneyRequestPreviewBox, containerStyles] : {},
                    ]}
                >
                    {hasReceipt && (
                        <ReportActionItemImages
                            images={receiptImages}
                            isHovered={isHovered || isScanning}
                            size={1}
                        />
                    )}
                    {isEmptyObject(transaction) && !ReportActionsUtils.isMessageDeleted(action) && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? (
                        <MoneyRequestSkeletonView />
                    ) : (
                        <View style={styles.moneyRequestPreviewBoxText}>
                            <View style={[styles.flexRow]}>
                                <Text style={[styles.textLabelSupporting, styles.flex1, styles.lh20, styles.mb1]}>
                                    {getPreviewHeaderText() + (isSettled && !iouReport?.isCancelledIOU ? ` • ${getSettledMessage()}` : '')}
                                </Text>
                                {!isSettled && hasFieldErrors && (
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
                                            isBillSplit && StyleUtils.getAmountFontSizeAndLineHeight(isSmallScreenWidth, windowWidth, displayAmount.length, sortedParticipantAvatars.length),
                                            isDeleted && styles.lineThrough,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {displayAmount}
                                    </Text>
                                    {ReportUtils.isSettled(iouReport?.reportID) && !isBillSplit && (
                                        <View style={styles.defaultCheckmarkWrapper}>
                                            <Icon
                                                src={Expensicons.Checkmark}
                                                fill={theme.iconSuccessFill}
                                            />
                                        </View>
                                    )}
                                </View>
                                {isBillSplit && (
                                    <View style={styles.moneyRequestPreviewBoxAvatar}>
                                        <MultipleAvatars
                                            icons={sortedParticipantAvatars}
                                            shouldStackHorizontally
                                            size="small"
                                            isHovered={isHovered}
                                            shouldUseCardBackground
                                        />
                                    </View>
                                )}
                            </View>
                            <View style={[styles.flexRow, styles.mt1]}>
                                <View style={[styles.flex1]}>
                                    {!isCurrentUserManager && shouldShowPendingConversionMessage && (
                                        <Text style={[styles.textLabel, styles.colorMuted]}>{translate('iou.pendingConversionMessage')}</Text>
                                    )}
                                    {shouldShowDescription && <RenderHTML html={parser.replace(merchantOrDescription)} />}
                                    {shouldShowMerchant && <Text style={[styles.textLabelSupporting, styles.textNormal]}>{merchantOrDescription}</Text>}
                                </View>
                                {isBillSplit && participantAccountIDs.length > 0 && !!requestAmount && requestAmount > 0 && (
                                    <Text style={[styles.textLabel, styles.colorMuted, styles.ml1, styles.amountSplitPadding]}>
                                        {translate('iou.amountEach', {
                                            amount: CurrencyUtils.convertToDisplayString(
                                                IOUUtils.calculateAmount(isPolicyExpenseChat ? 1 : participantAccountIDs.length - 1, requestAmount, requestCurrency ?? ''),
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

    if (!onPreviewPressed) {
        return childContainer;
    }

    const shouldDisableOnPress = isBillSplit && isEmptyObject(transaction);

    return (
        <PressableWithFeedback
            onPress={shouldDisableOnPress ? undefined : onPreviewPressed}
            onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onLongPress={showContextMenu}
            accessibilityLabel={isBillSplit ? translate('iou.split') : translate('iou.cash')}
            accessibilityHint={CurrencyUtils.convertToDisplayString(requestAmount, requestCurrency)}
            style={[styles.moneyRequestPreviewBox, containerStyles, shouldDisableOnPress && styles.cursorDefault]}
        >
            {childContainer}
        </PressableWithFeedback>
    );
}

MoneyRequestPreview.displayName = 'MoneyRequestPreview';

export default withOnyx<MoneyRequestPreviewProps, MoneyRequestPreviewOnyxProps>({
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
        key: ({action}) => {
            const originalMessage = action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? action.originalMessage : undefined;
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${originalMessage?.IOUTransactionID ?? 0}`;
        },
    },
    walletTerms: {
        key: ONYXKEYS.WALLET_TERMS,
    },
})(MoneyRequestPreview);
