import lodashSortBy from 'lodash/sortBy';
import truncate from 'lodash/truncate';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {DotIndicator, Folder, Tag} from '@components/Icon/Expensicons';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReportActionItemImages from '@components/ReportActionItem/ReportActionItemImages';
import UserInfoCellsWithArrow from '@components/SelectionList/Search/UserInfoCellsWithArrow';
import Text from '@components/Text';
import TransactionPreviewSkeletonView from '@components/TransactionPreviewSkeletonView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {calculateAmount} from '@libs/IOUUtils';
import {getAvatarsForAccountIDs} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getCleanedTagName} from '@libs/PolicyUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getOriginalMessage, getReportActions, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {canEditMoneyRequest, getTransactionDetails, getWorkspaceIcon, isIOUReport, isPolicyExpenseChat, isReportApproved, isSettled} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import type {TranslationPathOrText} from '@libs/TransactionPreviewUtils';
import {createTransactionPreviewConditionals, getIOUData, getTransactionPreviewTextAndTranslationPaths} from '@libs/TransactionPreviewUtils';
import {hasReceipt as hasReceiptTransactionUtils, isReceiptBeingScanned} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionPreviewContentProps} from './types';

function TransactionPreviewContent({
    action,
    isWhisper,
    isHovered,
    chatReport,
    personalDetails,
    iouReport,
    transaction,
    violations,
    offlineWithFeedbackOnClose,
    containerStyles,
    transactionPreviewWidth,
    isBillSplit,
    areThereDuplicates,
    sessionAccountID,
    walletTermsErrors,
    reportPreviewAction,
    shouldHideOnDelete = true,
    shouldShowIOUData,
    navigateToReviewFields,
    isReviewDuplicateTransactionPage = false,
}: TransactionPreviewContentProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`, {canBeMissing: true});
    const transactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction, undefined, policy) ?? {}, [transaction, policy]);
    const managerID = iouReport?.managerID ?? reportPreviewAction?.childManagerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const ownerAccountID = iouReport?.ownerAccountID ?? reportPreviewAction?.childOwnerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const isReportAPolicyExpenseChat = isPolicyExpenseChat(chatReport);
    const {amount: requestAmount, comment: requestComment, merchant, tag, category, currency: requestCurrency} = transactionDetails;
    const reportActions = useMemo(() => (iouReport ? (getReportActions(iouReport) ?? {}) : {}), [iouReport]);

    const transactionPreviewCommonArguments = useMemo(
        () => ({
            iouReport,
            transaction,
            action,
            isBillSplit,
            violations,
            transactionDetails,
        }),
        [action, iouReport, isBillSplit, transaction, transactionDetails, violations],
    );

    const conditionals = useMemo(
        () =>
            createTransactionPreviewConditionals({
                ...transactionPreviewCommonArguments,
                areThereDuplicates,
                isReportAPolicyExpenseChat,
            }),
        [areThereDuplicates, transactionPreviewCommonArguments, isReportAPolicyExpenseChat],
    );

    const {shouldShowRBR, shouldShowMerchant, shouldShowSplitShare, shouldShowTag, shouldShowCategory, shouldShowSkeleton, shouldShowDescription} = conditionals;

    const firstViolation = violations.at(0);
    const isIOUActionType = isMoneyRequestAction(action);
    const canEdit = isIOUActionType && canEditMoneyRequest(action, transaction);
    const violationMessage = firstViolation ? ViolationsUtils.getViolationTranslation(firstViolation, translate, canEdit) : undefined;

    const previewText = useMemo(
        () =>
            getTransactionPreviewTextAndTranslationPaths({
                ...transactionPreviewCommonArguments,
                shouldShowRBR,
                violationMessage,
                reportActions,
            }),
        [transactionPreviewCommonArguments, shouldShowRBR, violationMessage, reportActions],
    );
    const getTranslatedText = (item: TranslationPathOrText) => (item.translationPath ? translate(item.translationPath) : (item.text ?? ''));

    const previewHeaderText = previewText.previewHeaderText.reduce((text, currentKey) => {
        return `${text}${getTranslatedText(currentKey)}`;
    }, '');

    const RBRMessage = getTranslatedText(previewText.RBRMessage);
    const displayAmountText = getTranslatedText(previewText.displayAmountText);
    const displayDeleteAmountText = getTranslatedText(previewText.displayDeleteAmountText);

    const iouData = shouldShowIOUData
        ? getIOUData(managerID, ownerAccountID, isIOUReport(iouReport) || reportPreviewAction?.childType === CONST.REPORT.TYPE.IOU, personalDetails, requestAmount ?? 0)
        : undefined;
    const {from, to} = iouData ?? {from: null, to: null};
    const isDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const shouldShowCategoryOrTag = shouldShowCategory || shouldShowTag;
    const shouldShowMerchantOrDescription = shouldShowDescription || shouldShowMerchant;
    const shouldShowIOUHeader = !!from && !!to;
    const description = truncate(StringUtils.lineBreaksToSpaces(Parser.htmlToText(requestComment ?? '')), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const requestMerchant = truncate(merchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const hasReceipt = hasReceiptTransactionUtils(transaction);
    const isApproved = isReportApproved({report: iouReport});
    const isIOUSettled = isSettled(iouReport?.reportID);
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;
    const isScanning = hasReceipt && isReceiptBeingScanned(transaction);
    const displayAmount = isDeleted ? displayDeleteAmountText : displayAmountText;
    const receiptImages = [{...getThumbnailAndImageURIs(transaction), transaction}];
    const merchantOrDescription = shouldShowMerchant ? requestMerchant : description || '';
    const participantAccountIDs = isMoneyRequestAction(action) && isBillSplit ? (getOriginalMessage(action)?.participantAccountIDs ?? []) : [managerID, ownerAccountID];
    const participantAvatars = getAvatarsForAccountIDs(participantAccountIDs, personalDetails ?? {});
    const sortedParticipantAvatars = lodashSortBy(participantAvatars, (avatar) => avatar.id);
    if (isReportAPolicyExpenseChat && isBillSplit) {
        sortedParticipantAvatars.push(getWorkspaceIcon(chatReport));
    }

    // If available, retrieve the split share from the splits object of the transaction, if not, display an even share.
    const splitShare = useMemo(
        () =>
            shouldShowSplitShare
                ? (transaction?.comment?.splits?.find((split) => split.accountID === sessionAccountID)?.amount ??
                  calculateAmount(isReportAPolicyExpenseChat ? 1 : participantAccountIDs.length - 1, requestAmount ?? 0, requestCurrency ?? '', action?.actorAccountID === sessionAccountID))
                : 0,
        [
            shouldShowSplitShare,
            isReportAPolicyExpenseChat,
            action?.actorAccountID,
            participantAccountIDs.length,
            transaction?.comment?.splits,
            requestAmount,
            requestCurrency,
            sessionAccountID,
        ],
    );

    const shouldWrapDisplayAmount = !(isBillSplit || shouldShowMerchantOrDescription || isScanning);
    const previewTextViewGap = (shouldShowCategoryOrTag || !shouldWrapDisplayAmount) && styles.gap2;
    const previewTextMargin = shouldShowIOUHeader && shouldShowMerchantOrDescription && !isBillSplit && !shouldShowCategoryOrTag && styles.mbn1;

    const transactionWrapperStyles = [styles.border, styles.moneyRequestPreviewBox, (isIOUSettled || isApproved) && isSettlementOrApprovalPartial && styles.offlineFeedback.pending];

    return (
        <View style={[transactionWrapperStyles, containerStyles]}>
            <OfflineWithFeedback
                errors={walletTermsErrors}
                onClose={() => offlineWithFeedbackOnClose}
                errorRowStyles={[styles.mbn1]}
                needsOffscreenAlphaCompositing
                pendingAction={action?.pendingAction}
                shouldDisableStrikeThrough={isDeleted}
                shouldDisableOpacity={isDeleted}
                shouldHideOnDelete={shouldHideOnDelete}
            >
                <View style={[(isScanning || isWhisper) && [styles.reportPreviewBoxHoverBorder, styles.reportContainerBorderRadius]]}>
                    <ReportActionItemImages
                        images={receiptImages}
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        isHovered={isHovered || isScanning}
                        size={1}
                        shouldUseAspectRatio
                    />
                    {shouldShowSkeleton ? (
                        <TransactionPreviewSkeletonView transactionPreviewWidth={transactionPreviewWidth} />
                    ) : (
                        <View style={[styles.expenseAndReportPreviewBoxBody, styles.mtn1]}>
                            <View style={styles.gap3}>
                                {shouldShowIOUHeader && (
                                    <View style={[styles.flex1, styles.dFlex, styles.alignItemsCenter, styles.gap2, styles.flexRow]}>
                                        <UserInfoCellsWithArrow
                                            shouldShowToRecipient
                                            participantFrom={from}
                                            participantFromDisplayName={from.displayName ?? from.login ?? translate('common.hidden')}
                                            participantToDisplayName={to.displayName ?? to.login ?? translate('common.hidden')}
                                            participantTo={to}
                                            avatarSize="mid-subscript"
                                            infoCellsTextStyle={{...styles.textMicroBold, lineHeight: 14}}
                                            infoCellsAvatarStyle={styles.pr1}
                                        />
                                    </View>
                                )}
                                <View style={previewTextViewGap}>
                                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                        <Text style={[isDeleted && styles.lineThrough, styles.textLabelSupporting, styles.flex1, styles.lh16, previewTextMargin]}>{previewHeaderText}</Text>
                                        {isBillSplit && (
                                            <View style={styles.moneyRequestPreviewBoxAvatar}>
                                                <MultipleAvatars
                                                    icons={sortedParticipantAvatars}
                                                    shouldStackHorizontally
                                                    size="subscript"
                                                    shouldUseCardBackground
                                                />
                                            </View>
                                        )}
                                        {shouldWrapDisplayAmount && (
                                            <Text
                                                fontSize={variables.fontSizeNormal}
                                                style={[isDeleted && styles.lineThrough, styles.flexShrink0]}
                                                numberOfLines={1}
                                            >
                                                {displayAmount}
                                            </Text>
                                        )}
                                    </View>
                                    <View>
                                        <View style={[styles.flexRow]}>
                                            <View
                                                style={[
                                                    styles.flex1,
                                                    styles.flexRow,
                                                    styles.alignItemsCenter,
                                                    isBillSplit && !shouldShowMerchantOrDescription ? styles.justifyContentEnd : styles.justifyContentBetween,
                                                    styles.gap2,
                                                ]}
                                            >
                                                {shouldShowMerchantOrDescription && (
                                                    <Text
                                                        fontSize={variables.fontSizeNormal}
                                                        style={[isDeleted && styles.lineThrough, styles.flexShrink1]}
                                                        numberOfLines={1}
                                                    >
                                                        {merchantOrDescription}
                                                    </Text>
                                                )}
                                                {!shouldWrapDisplayAmount && (
                                                    <Text
                                                        fontSize={variables.fontSizeNormal}
                                                        style={[isDeleted && styles.lineThrough, styles.flexShrink0]}
                                                        numberOfLines={1}
                                                    >
                                                        {displayAmount}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <View style={[styles.flexRow, styles.justifyContentEnd]}>
                                            {!!splitShare && (
                                                <Text style={[isDeleted && styles.lineThrough, styles.textLabel, styles.colorMuted, styles.amountSplitPadding]}>
                                                    {translate('iou.yourSplit', {amount: convertToDisplayString(splitShare, requestCurrency)})}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    {shouldShowCategoryOrTag && (
                                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                            {shouldShowCategory && (
                                                <View
                                                    style={[
                                                        styles.flexRow,
                                                        styles.alignItemsCenter,
                                                        styles.gap1,
                                                        shouldShowTag && styles.mw50,
                                                        shouldShowTag && styles.pr1,
                                                        styles.flexShrink1,
                                                    ]}
                                                >
                                                    <Icon
                                                        src={Folder}
                                                        height={variables.iconSizeExtraSmall}
                                                        width={variables.iconSizeExtraSmall}
                                                        fill={theme.icon}
                                                    />
                                                    <Text
                                                        numberOfLines={1}
                                                        style={[isDeleted && styles.lineThrough, styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                                                    >
                                                        {category}
                                                    </Text>
                                                </View>
                                            )}
                                            {shouldShowTag && !!tag && (
                                                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap1, category && styles.pl1]}>
                                                    <Icon
                                                        src={Tag}
                                                        height={variables.iconSizeExtraSmall}
                                                        width={variables.iconSizeExtraSmall}
                                                        fill={theme.icon}
                                                    />
                                                    <Text
                                                        numberOfLines={1}
                                                        style={[isDeleted && styles.lineThrough, styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
                                                    >
                                                        {getCleanedTagName(tag)}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                                {!isIOUSettled && shouldShowRBR && (
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                                        <Icon
                                            src={DotIndicator}
                                            fill={theme.danger}
                                            height={variables.iconSizeExtraSmall}
                                            width={variables.iconSizeExtraSmall}
                                        />
                                        <Text
                                            numberOfLines={1}
                                            style={[isDeleted && styles.lineThrough, styles.textMicroSupporting, styles.pre, styles.flexShrink1, {color: theme.danger}]}
                                        >
                                            {RBRMessage}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                    {isReviewDuplicateTransactionPage && !isIOUSettled && !isApproved && areThereDuplicates && (
                        <Button
                            text={translate('violations.keepThisOne')}
                            success
                            style={[styles.ph4, styles.pb4]}
                            onPress={navigateToReviewFields}
                        />
                    )}
                </View>
            </OfflineWithFeedback>
        </View>
    );
}

TransactionPreviewContent.displayName = 'TransactionPreviewContent';

export default TransactionPreviewContent;
