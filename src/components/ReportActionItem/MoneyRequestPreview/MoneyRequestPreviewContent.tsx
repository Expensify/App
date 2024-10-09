import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import lodashSortBy from 'lodash/sortBy';
import truncate from 'lodash/truncate';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {ReceiptScan} from '@components/Icon/Expensicons';
import MoneyRequestSkeletonView from '@components/MoneyRequestSkeletonView';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportActionItemImages from '@components/ReportActionItem/ReportActionItemImages';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ControlSelection from '@libs/ControlSelection';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import variables from '@styles/variables';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as Report from '@userActions/Report';
import * as Transaction from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {MoneyRequestPreviewProps, PendingMessageProps} from './types';

function MoneyRequestPreviewContent({
    isBillSplit,
    action,
    contextMenuAnchor,
    chatReportID,
    reportID,
    onPreviewPressed,
    containerStyles,
    checkIfContextMenuActive = () => {},
    shouldShowPendingConversionMessage = false,
    isHovered = false,
    isWhisper = false,
    shouldDisplayContextMenu = true,
    iouReportID,
}: MoneyRequestPreviewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const route = useRoute<RouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);

    const isMoneyRequestAction = ReportActionsUtils.isMoneyRequestAction(action);
    const transactionID = isMoneyRequestAction ? ReportActionsUtils.getOriginalMessage(action)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

    const sessionAccountID = session?.accountID;
    const managerID = iouReport?.managerID;
    const ownerAccountID = iouReport?.ownerAccountID;
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(chatReport);

    const participantAccountIDs =
        ReportActionsUtils.isMoneyRequestAction(action) && isBillSplit ? ReportActionsUtils.getOriginalMessage(action)?.participantAccountIDs ?? [] : [managerID, ownerAccountID];
    const participantAvatars = OptionsListUtils.getAvatarsForAccountIDs(participantAccountIDs, personalDetails ?? {});
    const sortedParticipantAvatars = lodashSortBy(participantAvatars, (avatar) => avatar.id);
    if (isPolicyExpenseChat && isBillSplit) {
        sortedParticipantAvatars.push(ReportUtils.getWorkspaceIcon(chatReport));
    }

    // Pay button should only be visible to the manager of the report.
    const isCurrentUserManager = managerID === sessionAccountID;

    const {
        amount: requestAmount,
        currency: requestCurrency,
        comment: requestComment,
        merchant,
    } = useMemo<Partial<TransactionDetails>>(() => ReportUtils.getTransactionDetails(transaction) ?? {}, [transaction]);

    const description = truncate(StringUtils.lineBreaksToSpaces(requestComment), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const requestMerchant = truncate(merchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const hasReceipt = TransactionUtils.hasReceipt(transaction);
    const isScanning = hasReceipt && TransactionUtils.isReceiptBeingScanned(transaction);
    const isOnHold = TransactionUtils.isOnHold(transaction);
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;
    const isPartialHold = isSettlementOrApprovalPartial && isOnHold;
    const hasViolations = TransactionUtils.hasViolation(transaction?.transactionID, transactionViolations);
    const hasNoticeTypeViolations = TransactionUtils.hasNoticeTypeViolation(transaction?.transactionID, transactionViolations) && ReportUtils.isPaidGroupPolicy(iouReport);
    const hasFieldErrors = TransactionUtils.hasMissingSmartscanFields(transaction);
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const isFetchingWaypointsFromServer = TransactionUtils.isFetchingWaypointsFromServer(transaction);
    const isCardTransaction = TransactionUtils.isCardTransaction(transaction);
    const isSettled = ReportUtils.isSettled(iouReport?.reportID);
    const isApproved = ReportUtils.isReportApproved(iouReport);
    const isDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const isReviewDuplicateTransactionPage = route.name === SCREENS.TRANSACTION_DUPLICATE.REVIEW;

    const isFullySettled = isSettled && !isSettlementOrApprovalPartial;
    const isFullyApproved = isApproved && !isSettlementOrApprovalPartial;

    // Get transaction violations for given transaction id from onyx, find duplicated transactions violations and get duplicates
    const allDuplicates = useMemo(
        () =>
            transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`]?.find(
                (violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
            )?.data?.duplicates ?? [],
        [transaction?.transactionID, transactionViolations],
    );

    // Remove settled transactions from duplicates
    const duplicates = useMemo(() => TransactionUtils.removeSettledAndApprovedTransactions(allDuplicates), [allDuplicates]);

    // When there are no settled transactions in duplicates, show the "Keep this one" button
    const shouldShowKeepButton = !!(allDuplicates.length && duplicates.length && allDuplicates.length === duplicates.length);

    const hasDuplicates = duplicates.length > 0;

    const shouldShowRBR = hasNoticeTypeViolations || hasViolations || hasFieldErrors || (!isFullySettled && !isFullyApproved && isOnHold) || hasDuplicates;
    const showCashOrCard = isCardTransaction ? translate('iou.card') : translate('iou.cash');
    // We don't use isOnHold because it's true for duplicated transaction too and we only want to show hold message if the transaction is truly on hold
    const shouldShowHoldMessage = !(isSettled && !isSettlementOrApprovalPartial) && !!transaction?.comment?.hold;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params?.threadReportID}`);
    const parentReportAction = ReportActionsUtils.getReportAction(report?.parentReportID, report?.parentReportActionID);
    const reviewingTransactionID = ReportActionsUtils.isMoneyRequestAction(parentReportAction) ? ReportActionsUtils.getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;

    /*
     Show the merchant for IOUs and expenses only if:
     - the merchant is not empty, is custom, or is not related to scanning smartscan;
     - the expense is not a distance expense with a pending route and amount = 0 - in this case,
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

    const receiptImages = hasReceipt ? [{...ReceiptUtils.getThumbnailAndImageURIs(transaction), transaction}] : [];

    const getSettledMessage = (): string => {
        if (isCardTransaction) {
            return translate('common.done');
        }
        return translate('iou.settledExpensify');
    };

    const showContextMenu = (event: GestureResponderEvent) => {
        if (!shouldDisplayContextMenu) {
            return;
        }
        showContextMenuForReport(event, contextMenuAnchor, reportID, action, checkIfContextMenuActive);
    };

    const getPreviewHeaderText = (): string => {
        let message = showCashOrCard;

        if (isDistanceRequest) {
            message = translate('common.distance');
        } else if (isScanning) {
            message = translate('common.receipt');
        } else if (isBillSplit) {
            message = translate('iou.split');
        }

        if (isSettled && !iouReport?.isCancelledIOU && !isPartialHold) {
            message += ` ${CONST.DOT_SEPARATOR} ${getSettledMessage()}`;
            return message;
        }

        if (shouldShowRBR && transaction) {
            const violations = TransactionUtils.getTransactionViolations(transaction.transactionID, transactionViolations);
            if (shouldShowHoldMessage) {
                return `${message} ${CONST.DOT_SEPARATOR} ${translate('violations.hold')}`;
            }
            const firstViolation = violations?.at(0);
            if (firstViolation) {
                const violationMessage = ViolationsUtils.getViolationTranslation(firstViolation, translate);
                const violationsCount = violations?.filter((v) => v.type === CONST.VIOLATION_TYPES.VIOLATION).length ?? 0;
                const isTooLong = violationsCount > 1 || violationMessage.length > 15;
                const hasViolationsAndFieldErrors = violationsCount > 0 && hasFieldErrors;

                return `${message} ${CONST.DOT_SEPARATOR} ${isTooLong || hasViolationsAndFieldErrors ? translate('violations.reviewRequired') : violationMessage}`;
            }
            if (hasFieldErrors) {
                const isMerchantMissing = TransactionUtils.isMerchantMissing(transaction);
                const isAmountMissing = TransactionUtils.isAmountMissing(transaction);
                if (isAmountMissing && isMerchantMissing) {
                    message += ` ${CONST.DOT_SEPARATOR} ${translate('violations.reviewRequired')}`;
                } else if (isAmountMissing) {
                    message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.missingAmount')}`;
                } else if (isMerchantMissing) {
                    message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.missingMerchant')}`;
                }
                return message;
            }
        } else if (hasNoticeTypeViolations && transaction && !ReportUtils.isReportApproved(iouReport) && !ReportUtils.isSettled(iouReport?.reportID)) {
            message += ` • ${translate('violations.reviewRequired')}`;
        } else if (ReportUtils.isPaidGroupPolicyExpenseReport(iouReport) && ReportUtils.isReportApproved(iouReport) && !ReportUtils.isSettled(iouReport?.reportID) && !isPartialHold) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.approved')}`;
        } else if (iouReport?.isCancelledIOU) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        } else if (shouldShowHoldMessage) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('violations.hold')}`;
        }
        return message;
    };

    const getPendingMessageProps: () => PendingMessageProps = () => {
        if (isScanning) {
            return {shouldShow: true, messageIcon: ReceiptScan, messageDescription: translate('iou.receiptScanInProgress')};
        }
        if (TransactionUtils.isPending(transaction)) {
            return {shouldShow: true, messageIcon: Expensicons.CreditCardHourglass, messageDescription: translate('iou.transactionPending')};
        }
        if (TransactionUtils.hasPendingUI(transaction, TransactionUtils.getTransactionViolations(transaction?.transactionID, transactionViolations))) {
            return {shouldShow: true, messageIcon: Expensicons.Hourglass, messageDescription: translate('iou.pendingMatchWithCreditCard')};
        }
        return {shouldShow: false};
    };

    const pendingMessageProps = getPendingMessageProps();

    const getDisplayAmountText = (): string => {
        if (isScanning) {
            return translate('iou.receiptScanning');
        }

        if (isFetchingWaypointsFromServer && !requestAmount) {
            return translate('iou.fieldPending');
        }

        return CurrencyUtils.convertToDisplayString(requestAmount, requestCurrency);
    };

    const getDisplayDeleteAmountText = (): string => {
        const iouOriginalMessage: OnyxEntry<OriginalMessageIOU> = ReportActionsUtils.isMoneyRequestAction(action) ? ReportActionsUtils.getOriginalMessage(action) ?? undefined : undefined;
        return CurrencyUtils.convertToDisplayString(iouOriginalMessage?.amount, iouOriginalMessage?.currency);
    };

    const displayAmount = isDeleted ? getDisplayDeleteAmountText() : getDisplayAmountText();

    const shouldShowSplitShare = isBillSplit && !!requestAmount && requestAmount > 0;

    // If available, retrieve the split share from the splits object of the transaction, if not, display an even share.
    const splitShare = useMemo(
        () =>
            shouldShowSplitShare
                ? transaction?.comment?.splits?.find((split) => split.accountID === sessionAccountID)?.amount ??
                  IOUUtils.calculateAmount(isPolicyExpenseChat ? 1 : participantAccountIDs.length - 1, requestAmount, requestCurrency ?? '', action.actorAccountID === sessionAccountID)
                : 0,
        [shouldShowSplitShare, isPolicyExpenseChat, action.actorAccountID, participantAccountIDs.length, transaction?.comment?.splits, requestAmount, requestCurrency, sessionAccountID],
    );

    const navigateToReviewFields = () => {
        const backTo = route.params.backTo;
        const comparisonResult = TransactionUtils.compareDuplicateTransactionFields(reviewingTransactionID);
        Transaction.setReviewDuplicatesKey({...comparisonResult.keep, duplicates, transactionID: transaction?.transactionID});
        if ('merchant' in comparisonResult.change) {
            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.getRoute(route.params?.threadReportID, backTo));
        } else if ('category' in comparisonResult.change) {
            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.getRoute(route.params?.threadReportID, backTo));
        } else if ('tag' in comparisonResult.change) {
            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.getRoute(route.params?.threadReportID, backTo));
        } else if ('description' in comparisonResult.change) {
            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.getRoute(route.params?.threadReportID, backTo));
        } else if ('taxCode' in comparisonResult.change) {
            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.getRoute(route.params?.threadReportID, backTo));
        } else if ('billable' in comparisonResult.change) {
            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.getRoute(route.params?.threadReportID, backTo));
        } else if ('reimbursable' in comparisonResult.change) {
            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.getRoute(route.params?.threadReportID, backTo));
        } else {
            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION_PAGE.getRoute(route.params?.threadReportID, backTo));
        }
    };

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
                pendingAction={action.pendingAction}
                shouldDisableStrikeThrough={!isDeleted}
                shouldDisableOpacity={!isDeleted}
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
                                                            StyleUtils.getAmountFontSizeAndLineHeight(
                                                                shouldUseNarrowLayout,
                                                                windowWidth,
                                                                displayAmount.length,
                                                                sortedParticipantAvatars.length,
                                                            ),
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
                                                {(shouldShowMerchant || shouldShowDescription) && (
                                                    <Text style={[styles.textLabelSupporting, styles.textNormal]}>{merchantOrDescription}</Text>
                                                )}
                                            </View>
                                            {!!splitShare && (
                                                <Text style={[styles.textLabel, styles.colorMuted, styles.ml1, styles.amountSplitPadding]}>
                                                    {translate('iou.yourSplit', {amount: CurrencyUtils.convertToDisplayString(splitShare, requestCurrency)})}
                                                </Text>
                                            )}
                                        </View>
                                        {pendingMessageProps.shouldShow && (
                                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                                                <Icon
                                                    src={pendingMessageProps.messageIcon}
                                                    height={variables.iconSizeExtraSmall}
                                                    width={variables.iconSizeExtraSmall}
                                                    fill={theme.icon}
                                                />
                                                <Text style={[styles.textMicroSupporting, styles.ml1, styles.amountSplitPadding]}>{pendingMessageProps.messageDescription}</Text>
                                            </View>
                                        )}
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
            accessibilityLabel={isBillSplit ? translate('iou.split') : showCashOrCard}
            accessibilityHint={CurrencyUtils.convertToDisplayString(requestAmount, requestCurrency)}
            style={[
                styles.moneyRequestPreviewBox,
                containerStyles,
                shouldDisableOnPress && styles.cursorDefault,
                (isSettled || ReportUtils.isReportApproved(iouReport)) && isSettlementOrApprovalPartial && styles.offlineFeedback.pending,
            ]}
        >
            {childContainer}
            {isReviewDuplicateTransactionPage && !isSettled && !isApproved && shouldShowKeepButton && (
                <Button
                    text={translate('violations.keepThisOne')}
                    success
                    style={styles.p4}
                    onPress={navigateToReviewFields}
                />
            )}
        </PressableWithoutFeedback>
    );
}

MoneyRequestPreviewContent.displayName = 'MoneyRequestPreview';

export default MoneyRequestPreviewContent;
