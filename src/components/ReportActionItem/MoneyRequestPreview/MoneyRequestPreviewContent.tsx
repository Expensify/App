import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import {truncate} from 'lodash';
import lodashSortBy from 'lodash/sortBy';
import React from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import ConfirmedRoute from '@components/ConfirmedRoute';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyRequestSkeletonView from '@components/MoneyRequestSkeletonView';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RenderHTML from '@components/RenderHTML';
import ReportActionItemImages from '@components/ReportActionItem/ReportActionItemImages';
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
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import type {IOUMessage} from '@src/types/onyx/OriginalMessage';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {MoneyRequestPreviewProps} from './types';

function MoneyRequestPreviewContent({
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
    transactionViolations,
}: MoneyRequestPreviewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();
    const parser = new ExpensiMark();

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
    const isOnHold = TransactionUtils.isOnHold(transaction);
    const isSettlementOrApprovalPartial = Boolean(iouReport?.pendingFields?.partial);
    const isPartialHold = isSettlementOrApprovalPartial && isOnHold;
    const hasViolations = TransactionUtils.hasViolation(transaction?.transactionID ?? '', transactionViolations);
    const hasFieldErrors = TransactionUtils.hasMissingSmartscanFields(transaction);
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const isFetchingWaypointsFromServer = TransactionUtils.isFetchingWaypointsFromServer(transaction);
    const isCardTransaction = TransactionUtils.isCardTransaction(transaction);
    const isSettled = ReportUtils.isSettled(iouReport?.reportID);
    const isDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const shouldShowRBR =
        hasViolations || hasFieldErrors || (!(isSettled && !isSettlementOrApprovalPartial) && !(ReportUtils.isReportApproved(iouReport) && !isSettlementOrApprovalPartial) && isOnHold);

    /*
     Show the merchant for IOUs and expenses only if:
     - the merchant is not empty, is custom, or is not related to scanning smartscan;
     - the request is not a distance request with a pending route and amount = 0 - in this case,
       the merchant says: "Route pending...", which is already shown in the amount field;
    */
    const shouldShowMerchant =
        !!requestMerchant &&
        requestMerchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT &&
        requestMerchant !== CONST.TRANSACTION.DEFAULT_MERCHANT &&
        !(isFetchingWaypointsFromServer && !requestAmount);
    const shouldShowDescription = !!description && !shouldShowMerchant && !isScanning;

    let merchantOrDescription = requestMerchant;
    if (!shouldShowMerchant) {
        merchantOrDescription = description || '';
    }

    const receiptImages = hasReceipt ? [ReceiptUtils.getThumbnailAndImageURIs(transaction)] : [];

    const hasPendingWaypoints = transaction?.pendingFields?.waypoints;
    const showMapAsImage = isDistanceRequest && hasPendingWaypoints;

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
        let message = translate('iou.cash');

        if (isDistanceRequest) {
            message = translate('common.distance');
        } else if (isScanning) {
            message = translate('common.receipt');
        } else if (isBillSplit) {
            message = translate('iou.split');
        }

        if (isCardTransaction) {
            message = translate('iou.card');
            if (TransactionUtils.isPending(transaction)) {
                message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.pending')}`;
                return message;
            }
        }

        if (isSettled && !iouReport?.isCancelledIOU && !isPartialHold) {
            message += ` ${CONST.DOT_SEPARATOR} ${getSettledMessage()}`;
            return message;
        }

        if (shouldShowRBR && transaction) {
            const violations = TransactionUtils.getTransactionViolations(transaction.transactionID, transactionViolations);
            if (violations?.[0]) {
                const violationMessage = ViolationsUtils.getViolationTranslation(violations[0], translate);
                const violationsCount = violations.filter((v) => v.type === CONST.VIOLATION_TYPES.VIOLATION).length;
                const isTooLong = violationsCount > 1 || violationMessage.length > 15;
                const hasViolationsAndFieldErrors = violationsCount > 0 && hasFieldErrors;

                return `${message} ${CONST.DOT_SEPARATOR} ${isTooLong || hasViolationsAndFieldErrors ? translate('violations.reviewRequired') : violationMessage}`;
            }

            const isMerchantMissing = TransactionUtils.isMerchantMissing(transaction);
            const isAmountMissing = TransactionUtils.isAmountMissing(transaction);
            if (isAmountMissing && isMerchantMissing) {
                message += ` ${CONST.DOT_SEPARATOR} ${translate('violations.reviewRequired')}`;
            } else if (isAmountMissing) {
                message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.missingAmount')}`;
            } else if (isMerchantMissing) {
                message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.missingMerchant')}`;
            } else if (!(isSettled && !isSettlementOrApprovalPartial) && isOnHold) {
                message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.hold')}`;
            }
        } else if (ReportUtils.isPaidGroupPolicyExpenseReport(iouReport) && ReportUtils.isReportApproved(iouReport) && !ReportUtils.isSettled(iouReport?.reportID) && !isPartialHold) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.approved')}`;
        } else if (iouReport?.isWaitingOnBankAccount) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.pending')}`;
        } else if (iouReport?.isCancelledIOU) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        } else if (!(isSettled && !isSettlementOrApprovalPartial) && isOnHold) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.hold')}`;
        }
        return message;
    };

    const getDisplayAmountText = (): string => {
        if (isScanning) {
            return translate('iou.receiptScanning');
        }

        if (isFetchingWaypointsFromServer && !requestAmount) {
            return translate('iou.routePending');
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
                    {showMapAsImage && (
                        <View style={styles.reportActionItemImages}>
                            <ConfirmedRoute transaction={transaction} />
                        </View>
                    )}
                    {!showMapAsImage && hasReceipt && (
                        <ReportActionItemImages
                            images={receiptImages}
                            isHovered={isHovered || isScanning}
                            size={1}
                        />
                    )}
                    {isEmptyObject(transaction) && !ReportActionsUtils.isMessageDeleted(action) && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? (
                        <MoneyRequestSkeletonView />
                    ) : (
                        <View style={[styles.expenseAndReportPreviewBoxBody, hasReceipt ? styles.mtn1 : {}]}>
                            <View style={styles.expenseAndReportPreviewTextButtonContainer}>
                                <View style={styles.expenseAndReportPreviewTextContainer}>
                                    <View style={[styles.flexRow]}>
                                        <Text style={[styles.textLabelSupporting, styles.flex1, styles.lh16]}>{getPreviewHeaderText()}</Text>
                                        {!isSettled && shouldShowRBR && (
                                            <Icon
                                                src={Expensicons.DotIndicator}
                                                fill={theme.danger}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.reportPreviewAmountSubtitleContainer}>
                                        <View style={[styles.flexRow]}>
                                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                                <Text
                                                    style={[
                                                        styles.textHeadlineH1,
                                                        isBillSplit &&
                                                            StyleUtils.getAmountFontSizeAndLineHeight(isSmallScreenWidth, windowWidth, displayAmount.length, sortedParticipantAvatars.length),
                                                        isDeleted && styles.lineThrough,
                                                    ]}
                                                    numberOfLines={1}
                                                >
                                                    {displayAmount}
                                                </Text>
                                                {ReportUtils.isSettled(iouReport?.reportID) && !isPartialHold && !isBillSplit && (
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
                                                        shouldUseCardBackground
                                                    />
                                                </View>
                                            )}
                                        </View>
                                        <View style={[styles.flexRow]}>
                                            <View style={[styles.flex1]}>
                                                {!isCurrentUserManager && shouldShowPendingConversionMessage && (
                                                    <Text style={[styles.textLabel, styles.colorMuted]}>{translate('iou.pendingConversionMessage')}</Text>
                                                )}
                                                {shouldShowDescription && (
                                                    <View style={[styles.breakWord, styles.preWrap]}>
                                                        <RenderHTML html={`<muted-text>${parser.replace(merchantOrDescription)}</muted-text>`} />
                                                    </View>
                                                )}
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
                                </View>
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
        <PressableWithoutFeedback
            onPress={shouldDisableOnPress ? undefined : onPreviewPressed}
            onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onLongPress={showContextMenu}
            shouldUseHapticsOnLongPress
            accessibilityLabel={isBillSplit ? translate('iou.split') : translate('iou.cash')}
            accessibilityHint={CurrencyUtils.convertToDisplayString(requestAmount, requestCurrency)}
            style={[
                styles.moneyRequestPreviewBox,
                containerStyles,
                shouldDisableOnPress && styles.cursorDefault,
                (isSettled || ReportUtils.isReportApproved(iouReport)) && isSettlementOrApprovalPartial && styles.offlineFeedback.pending,
            ]}
        >
            {childContainer}
        </PressableWithoutFeedback>
    );
}

MoneyRequestPreviewContent.displayName = 'MoneyRequestPreview';

export default MoneyRequestPreviewContent;
