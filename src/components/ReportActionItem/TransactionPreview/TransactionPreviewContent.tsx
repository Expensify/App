import lodashSortBy from 'lodash/sortBy';
import truncate from 'lodash/truncate';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {DotIndicator, Folder, Tag} from '@components/Icon/Expensicons';
import MoneyRequestSkeletonView from '@components/MoneyRequestSkeletonView';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportActionItemImages from '@components/ReportActionItem/ReportActionItemImages';
import UserInfoCellsWithArrow from '@components/SelectionList/Search/UserInfoCellsWithArrow';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {calculateAmount} from '@libs/IOUUtils';
import {getAvatarsForAccountIDs} from '@libs/OptionsListUtils';
import {getCleanedTagName} from '@libs/PolicyUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {canEditMoneyRequest, getTransactionDetails, getWorkspaceIcon, isPolicyExpenseChat, isReportApproved, isSettled} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import type {TranslationPathOrText} from '@libs/TransactionPreviewUtils';
import {createTransactionPreviewConditionals, getIOUData, getTransactionPreviewTextAndTranslationPaths} from '@libs/TransactionPreviewUtils';
import {hasReceipt as hasReceiptTransactionUtils, isReceiptBeingScanned} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
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
    showContextMenu,
    offlineWithFeedbackOnClose,
    navigateToReviewFields,
    onPreviewPressed,
    containerStyles,
    isBillSplit,
    areThereDuplicates,
    sessionAccountID,
    walletTermsErrors,
    routeName,
    shouldHideOnDelete = true,
}: TransactionPreviewContentProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const themeStyles = {
        backgroundColor: theme.cardBG,
    };

    const transactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction) ?? {}, [transaction]);
    const managerID = iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const ownerAccountID = iouReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const isReportAPolicyExpenseChat = isPolicyExpenseChat(chatReport);
    const {amount: requestAmount, comment: requestComment, merchant, tag, category, currency: requestCurrency} = transactionDetails;

    const transactionPreviewUtilsArguments = useMemo(
        () => ({
            iouReport,
            transaction,
            translate,
            action,
            isBillSplit,
            violations,
            transactionDetails,
        }),
        [action, iouReport, isBillSplit, transaction, transactionDetails, translate, violations],
    );

    const conditionals = useMemo(
        () =>
            createTransactionPreviewConditionals({
                ...transactionPreviewUtilsArguments,
                areThereDuplicates,
                isReportAPolicyExpenseChat,
            }),
        [areThereDuplicates, transactionPreviewUtilsArguments, isReportAPolicyExpenseChat],
    );

    const {
        shouldShowRBR,
        shouldShowMerchant,
        shouldShowSplitShare,
        shouldShowTag,
        shouldShowCategory,
        shouldShowSkeleton,
        shouldShowDescription,
        shouldShowKeepButton,
        shouldDisableOnPress,
    } = conditionals;

    const firstViolation = violations.at(0);
    const isIOUActionType = isMoneyRequestAction(action);
    const canEdit = isIOUActionType && canEditMoneyRequest(action, transaction);
    const violationMessage = firstViolation ? ViolationsUtils.getViolationTranslation(firstViolation, translate, canEdit) : undefined;

    const previewText = useMemo(
        () =>
            getTransactionPreviewTextAndTranslationPaths({
                ...transactionPreviewUtilsArguments,
                shouldShowRBR,
                violationMessage,
            }),
        [transactionPreviewUtilsArguments, shouldShowRBR, violationMessage],
    );
    const getTranslatedText = (item: TranslationPathOrText) => (item.translationPath ? translate(item.translationPath) : item.text ?? '');

    const previewHeaderText = previewText.previewHeaderText.reduce((text, currentKey) => {
        return `${text}${getTranslatedText(currentKey)}`;
    }, '');

    const RBRMessage = getTranslatedText(previewText.RBRMessage);
    const displayAmountText = getTranslatedText(previewText.displayAmountText);
    const showCashOrCard = getTranslatedText(previewText.showCashOrCard);
    const displayDeleteAmountText = getTranslatedText(previewText.displayDeleteAmountText);

    const iouData = getIOUData(managerID, ownerAccountID, iouReport, personalDetails, (transaction && transaction.amount) ?? 0);
    const {from, to} = iouData ?? {from: null, to: null};
    const isDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const shouldShowCategoryOrTag = shouldShowCategory || shouldShowTag;
    const shouldShowMerchantOrDescription = shouldShowDescription || shouldShowMerchant;
    const shouldShowIOUHeader = !!from && !!to;
    const description = truncate(StringUtils.lineBreaksToSpaces(requestComment), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const requestMerchant = truncate(merchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const hasReceipt = hasReceiptTransactionUtils(transaction);
    const isApproved = isReportApproved({report: iouReport});
    const isIOUSettled = isSettled(iouReport?.reportID);
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;
    const isScanning = hasReceipt && isReceiptBeingScanned(transaction);
    const displayAmount = isDeleted ? displayDeleteAmountText : displayAmountText;
    const receiptImages = [{...getThumbnailAndImageURIs(transaction), transaction}];
    const merchantOrDescription = shouldShowMerchant ? requestMerchant : description || '';
    const isReviewDuplicateTransactionPage = routeName === SCREENS.TRANSACTION_DUPLICATE.REVIEW;
    const participantAccountIDs = isMoneyRequestAction(action) && isBillSplit ? getOriginalMessage(action)?.participantAccountIDs ?? [] : [managerID, ownerAccountID];
    const participantAvatars = getAvatarsForAccountIDs(participantAccountIDs, personalDetails ?? {});
    const sortedParticipantAvatars = lodashSortBy(participantAvatars, (avatar) => avatar.id);
    if (isReportAPolicyExpenseChat && isBillSplit) {
        sortedParticipantAvatars.push(getWorkspaceIcon(chatReport));
    }

    // If available, retrieve the split share from the splits object of the transaction, if not, display an even share.
    const splitShare = useMemo(
        () =>
            shouldShowSplitShare
                ? transaction?.comment?.splits?.find((split) => split.accountID === sessionAccountID)?.amount ??
                  calculateAmount(isReportAPolicyExpenseChat ? 1 : participantAccountIDs.length - 1, requestAmount ?? 0, requestCurrency ?? '', action.actorAccountID === sessionAccountID)
                : 0,
        [
            shouldShowSplitShare,
            isReportAPolicyExpenseChat,
            action.actorAccountID,
            participantAccountIDs.length,
            transaction?.comment?.splits,
            requestAmount,
            requestCurrency,
            sessionAccountID,
        ],
    );

    const transactionContent = (
        <View style={[styles.border, styles.reportContainerBorderRadius]}>
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
                <View
                    style={[
                        isScanning || isWhisper ? [styles.reportPreviewBoxHoverBorder, styles.reportContainerBorderRadius] : undefined,
                        !onPreviewPressed ? [styles.moneyRequestPreviewBox, containerStyles, themeStyles] : {},
                    ]}
                >
                    {!isDeleted && (
                        <ReportActionItemImages
                            images={receiptImages}
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            isHovered={isHovered || isScanning}
                            size={1}
                        />
                    )}
                    {shouldShowSkeleton ? (
                        <MoneyRequestSkeletonView />
                    ) : (
                        <View style={[styles.expenseAndReportPreviewBoxBody, styles.mtn1]}>
                            <View style={styles.gap3}>
                                <View style={isBillSplit || shouldShowMerchantOrDescription || shouldShowCategoryOrTag ? styles.gap2 : {}}>
                                    {shouldShowIOUHeader && (
                                        <View style={[styles.flex1, styles.dFlex, styles.alignItemsCenter, styles.gap2, styles.flexRow]}>
                                            <UserInfoCellsWithArrow
                                                shouldDisplayArrowIcon
                                                participantFrom={from}
                                                participantFromDisplayName={from.displayName ?? from.login ?? ''}
                                                participantTo={to}
                                                participantToDisplayName={to.displayName ?? to.login ?? ''}
                                                avatarSize="mid-subscript"
                                                infoCellsTextStyle={{...styles.textMicroBold, lineHeight: 14}}
                                                infoCellsAvatarStyle={styles.pr1}
                                            />
                                        </View>
                                    )}
                                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                        <Text style={[styles.textLabelSupporting, styles.flex1, styles.lh16]}>{previewHeaderText}</Text>
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
                                        {!isBillSplit && !shouldShowMerchantOrDescription && (
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
                                                ]}
                                            >
                                                {shouldShowMerchantOrDescription && (
                                                    <Text
                                                        fontSize={variables.fontSizeNormal}
                                                        style={[isDeleted && styles.lineThrough]}
                                                        numberOfLines={1}
                                                    >
                                                        {merchantOrDescription}
                                                    </Text>
                                                )}
                                                {(shouldShowMerchant || shouldShowDescription || isBillSplit) && (
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
                                                <Text style={[styles.textLabel, styles.colorMuted, styles.amountSplitPadding]}>
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
                                                        style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
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
                                                        style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}
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
                                            style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1, {color: theme.danger}]}
                                        >
                                            {RBRMessage}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </OfflineWithFeedback>
        </View>
    );

    if (!onPreviewPressed) {
        return transactionContent;
    }

    return (
        <PressableWithoutFeedback
            onPress={shouldDisableOnPress ? undefined : onPreviewPressed}
            onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onLongPress={showContextMenu}
            shouldUseHapticsOnLongPress
            accessibilityLabel={isBillSplit ? translate('iou.split') : showCashOrCard}
            accessibilityHint={convertToDisplayString(requestAmount, requestCurrency)}
            style={[
                styles.moneyRequestPreviewBox,
                containerStyles,
                themeStyles,
                shouldDisableOnPress && styles.cursorDefault,
                (isIOUSettled || isApproved) && isSettlementOrApprovalPartial && styles.offlineFeedback.pending,
            ]}
        >
            {transactionContent}
            {isReviewDuplicateTransactionPage && !isIOUSettled && !isApproved && shouldShowKeepButton && (
                <Button
                    text={translate('violations.keepThisOne')}
                    success
                    style={[styles.ph4, styles.pb4]}
                    onPress={navigateToReviewFields}
                />
            )}
        </PressableWithoutFeedback>
    );
}

TransactionPreviewContent.displayName = 'TransactionPreviewContent';

export default TransactionPreviewContent;
