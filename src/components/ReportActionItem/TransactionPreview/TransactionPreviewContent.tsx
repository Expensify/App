import MultiAccountAvatar from '@components/Avatar/connected/MultiAccountAvatar';
import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {ReportPreviewDataContext} from '@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext';
import ReportActionItemImages from '@components/ReportActionItem/ReportActionItemImages';
import UserInfoCellsWithArrow from '@components/Search/SearchList/ListItem/UserInfoCellsWithArrow';
import Text from '@components/Text';
import TransactionPreviewSkeletonView from '@components/TransactionPreviewSkeletonView';

import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getBrokenConnectionUrlToFixPersonalCard} from '@libs/CardUtils';
import {getDecodedLeafCategoryName} from '@libs/CategoryUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {calculateAmount} from '@libs/IOUUtils';
import Parser from '@libs/Parser';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isMarkAsCashActionForTransaction} from '@libs/ReportPrimaryActionUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {canEditMoneyRequest, getTransactionDetails, isPolicyExpenseChat, isReportApproved, isSettled} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import type {TranslationPathOrText} from '@libs/TransactionPreviewUtils';
import {createTransactionPreviewConditionals, getIOUPayerAndReceiver, getTransactionPreviewTextAndTranslationPaths} from '@libs/TransactionPreviewUtils';
import {isManagedCardTransaction as isCardTransactionUtils, isGPSDistanceRequest, isMapDistanceRequest, isScanning} from '@libs/TransactionUtils';
import ViolationsUtils, {filterReceiptViolations} from '@libs/Violations/ViolationsUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {cardByIdSelector} from '@src/selectors/Card';
import {getStableReportSelector} from '@src/selectors/Report';

import truncate from 'lodash/truncate';
import React, {useContext, useMemo} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import type {TransactionPreviewContentProps} from './types';

function TransactionPreviewContent({
    action,
    isWhisper,
    isHovered,
    chatReport,
    personalDetails,
    report,
    policy,
    transaction,
    violations,
    transactionRawAmount,
    offlineWithFeedbackOnClose,
    containerStyles,
    transactionPreviewWidth,
    isBillSplit,
    areThereDuplicates,
    sessionAccountID,
    walletTermsErrors,
    reportPreviewAction,
    shouldHideOnDelete = true,
    shouldShowPayerAndReceiver,
    navigateToReviewFields,
    isReviewDuplicateTransactionPage = false,
    shouldHighlight = false,
}: TransactionPreviewContentProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString, getCurrencyDecimals} = useCurrencyListActions();
    const {environmentURL} = useEnvironment();
    const isParentPolicyExpenseChat = isPolicyExpenseChat(chatReport);
    const transactionDetails = useMemo<Partial<TransactionDetails>>(
        () => getTransactionDetails(transaction, undefined, policy, isParentPolicyExpenseChat) ?? {},
        [transaction, policy, isParentPolicyExpenseChat],
    );
    const {amount, comment: requestComment, merchant, category, currency: requestCurrency} = transactionDetails;
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`);
    // Only when the expense is actually held: the hold is appended to the RBR message on its own, so it must not also be picked
    // as the violation to describe. Left alone otherwise, so duplicates and settled expenses keep their existing message.
    const filteredViolations = filterReceiptViolations(violations).filter((violation) => violation.name !== CONST.VIOLATIONS.HOLD || !transaction?.comment?.hold);
    const firstViolation = filteredViolations.at(0);
    const cardID = firstViolation?.data?.cardID;
    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardByIdSelector(String(cardID))});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {selector: getStableReportSelector});
    const managerID = report?.managerID ?? reportPreviewAction?.childManagerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const ownerAccountID = report?.ownerAccountID ?? reportPreviewAction?.childOwnerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const ownerLogin = getLoginByAccountID(ownerAccountID, personalDetails);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.reportID)}`);
    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserDetails.email ?? '';
    const currentUserLogin = currentUserDetails.login;
    const currentUserAccountID = currentUserDetails.accountID;
    const transactionPreviewCommonArguments = useMemo(
        () => ({
            iouReport: report,
            iouReportOwnerLogin: ownerLogin,
            policy,
            transaction,
            action,
            isBillSplit,
            violations,
            transactionDetails,
        }),
        [action, report, ownerLogin, policy, isBillSplit, transaction, transactionDetails, violations],
    );

    const conditionals = useMemo(
        () =>
            createTransactionPreviewConditionals({
                ...transactionPreviewCommonArguments,
                areThereDuplicates,
                isReportAPolicyExpenseChat: isParentPolicyExpenseChat,
                currentUserEmail,
                currentUserAccountID,
                reportActions,
            }),
        [areThereDuplicates, transactionPreviewCommonArguments, isParentPolicyExpenseChat, currentUserEmail, currentUserAccountID, reportActions],
    );

    const {shouldShowRBR, shouldShowMerchant, shouldShowSplitShare, shouldShowCategory, shouldShowSkeleton, shouldShowDescription} = conditionals;

    // Raw useContext (not the useReportPreviewData slice hook, which throws when absent): a missing provider means this is a
    // standalone preview with no report header to carry the status, so the preview has to report a cancelled payment itself.
    const isInsideReportPreview = !!useContext(ReportPreviewDataContext);
    const shouldShowCanceledStatus = !isInsideReportPreview;

    const isIOUActionType = isMoneyRequestAction(action);
    const canEdit = isIOUActionType && canEditMoneyRequest(action, transaction, isChatReportArchived, report, policy, reportActions);
    const companyCardPageURL = `${environmentURL}/${ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(report?.policyID)}`;
    const {personalCardsWithBrokenConnection} = useCardFeedErrors();
    const connectionLink = getBrokenConnectionUrlToFixPersonalCard(personalCardsWithBrokenConnection, environmentURL);
    const isMarkAsCash = parentReport && currentUserLogin ? isMarkAsCashActionForTransaction(currentUserLogin, parentReport, violations, policy) : false;

    const violationMessage = firstViolation
        ? ViolationsUtils.getViolationTranslation({
              dateFnsLocale,
              violation: firstViolation,
              translate,
              convertToDisplayString,
              canEdit,
              companyCardPageURL,
              connectionLink,
              card,
              isMarkAsCash,
              routeDistanceMeters: transaction?.comment?.customUnit?.routeDistanceMeters,
              distanceUnit: transaction?.comment?.customUnit?.distanceUnit,
          })
        : undefined;

    const previewText = useMemo(
        () =>
            getTransactionPreviewTextAndTranslationPaths({
                dateFnsLocale,
                ...transactionPreviewCommonArguments,
                shouldShowRBR,
                shouldShowCanceledStatus,
                violationMessage,
                reportActions,
                originalTransaction,
                convertToDisplayString,
            }),
        [transactionPreviewCommonArguments, shouldShowRBR, shouldShowCanceledStatus, violationMessage, reportActions, originalTransaction, convertToDisplayString, dateFnsLocale],
    );
    const getTranslatedText = (item: TranslationPathOrText) => (item.translationPath ? translate(item.translationPath) : (item.text ?? ''));

    // The hold comes last, after whatever else flagged the expense, e.g. "Category missing • This expense was put on hold".
    const RBRMessage = [getTranslatedText(previewText.RBRMessage), previewText.shouldShowHoldMessage ? translate('violations.hold') : ''].filter(Boolean).join(` ${CONST.DOT_SEPARATOR} `);
    const displayAmountText = getTranslatedText(previewText.displayAmountText);
    const displayDeleteAmountText = getTranslatedText(previewText.displayDeleteAmountText);
    const displayTypeText = getTranslatedText(previewText.previewTypeText);

    const isDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const shouldShowMerchantOrDescription = shouldShowDescription || shouldShowMerchant;

    const description = truncate(StringUtils.lineBreaksToSpaces(Parser.htmlToText(requestComment ?? '')), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const requestMerchant = truncate(merchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const isApproved = isReportApproved({report});
    const pendingAction = action?.pendingAction;
    const isIOUSettled = !pendingAction && isSettled(report);
    const isSettlementOrApprovalPartial = !!report?.pendingFields?.partial;
    const isTransactionScanning = isScanning(transaction);
    const displayAmount = isDeleted ? displayDeleteAmountText : displayAmountText;
    const receiptImages = [{...getThumbnailAndImageURIs(transaction), transaction}];
    const merchantOrDescription = shouldShowMerchant ? requestMerchant : description || '';

    // While scanning the status takes the merchant slot and the amount and type are left out, so the card matches the Spend row.
    const shouldUseScanningLayout = isTransactionScanning && !isDeleted;
    const primaryText = shouldUseScanningLayout ? displayAmount : merchantOrDescription;
    const shouldShowPrimaryText = shouldUseScanningLayout || shouldShowMerchantOrDescription;

    const previewSupportingText = [previewText.previewDateText, shouldShowCategory && category ? {text: getDecodedLeafCategoryName(category)} : undefined, ...previewText.previewStatusText]
        .filter((item): item is TranslationPathOrText => !!item)
        .map(getTranslatedText)
        .join(` ${CONST.DOT_SEPARATOR} `);
    const participantAccountIDs = isMoneyRequestAction(action) && isBillSplit ? (getOriginalMessage(action)?.participantAccountIDs ?? []) : [managerID, ownerAccountID];
    const isCardTransaction = isCardTransactionUtils(transaction);

    // Compute the from/to data only for IOU reports
    const {from, to} = useMemo(() => {
        if (!shouldShowPayerAndReceiver) {
            return {
                from: undefined,
                to: undefined,
            };
        }

        // For IOU or Split, we want the unprocessed amount because it is important whether the amount was positive or negative
        const payerAndReceiver = getIOUPayerAndReceiver(managerID, ownerAccountID, personalDetails, transactionRawAmount);

        return {
            from: payerAndReceiver.from,
            to: payerAndReceiver.to,
        };
    }, [managerID, ownerAccountID, personalDetails, shouldShowPayerAndReceiver, transactionRawAmount]);

    const shouldShowIOUHeader = !!from && !!to;

    // If available, retrieve the split share from the splits object of the transaction, if not, display an even share.
    const actorAccountID = action?.actorAccountID;
    const splitShare = useMemo(() => {
        if (!shouldShowSplitShare) {
            return 0;
        }

        const splitAmount = transaction?.comment?.splits?.find((split) => split.accountID === sessionAccountID)?.amount;
        if (splitAmount !== undefined) {
            return splitAmount;
        }

        let originalParticipantCount = participantAccountIDs.length;

        if (isBillSplit) {
            // Try to get the participant count from transaction splits data
            const transactionSplitsCount = transaction?.comment?.splits?.length;
            if (transactionSplitsCount && transactionSplitsCount > 0) {
                originalParticipantCount = transactionSplitsCount;
            } else if (isMoneyRequestAction(action)) {
                originalParticipantCount = getOriginalMessage(action)?.participantAccountIDs?.length ?? participantAccountIDs.length;
            }
        }

        return calculateAmount(
            isParentPolicyExpenseChat ? 1 : originalParticipantCount - 1,
            amount ?? 0,
            requestCurrency ?? '',
            actorAccountID === sessionAccountID,
            false,
            getCurrencyDecimals,
        );
    }, [
        shouldShowSplitShare,
        isParentPolicyExpenseChat,
        participantAccountIDs.length,
        transaction?.comment?.splits,
        amount,
        requestCurrency,
        sessionAccountID,
        isBillSplit,
        action,
        actorAccountID,
        getCurrencyDecimals,
    ]);

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.cardBG,
        shouldApplyOtherStyles: false,
    });

    const transactionWrapperStyles = [styles.border, styles.moneyRequestPreviewBox, (isIOUSettled || isApproved) && isSettlementOrApprovalPartial && styles.offlineFeedbackPending];

    return (
        <Animated.View style={[transactionWrapperStyles, containerStyles, animatedHighlightStyle]}>
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
                <View style={[(isTransactionScanning || isWhisper) && [styles.reportPreviewBoxHoverBorderColor, styles.reportContainerBorderRadius]]}>
                    <ReportActionItemImages
                        images={receiptImages}
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        isHovered={isHovered || isTransactionScanning}
                        size={1}
                        shouldUseAspectRatio={!isMapDistanceRequest(transaction) && !isGPSDistanceRequest(transaction)}
                    />
                    {shouldShowSkeleton ? (
                        <TransactionPreviewSkeletonView transactionPreviewWidth={transactionPreviewWidth} />
                    ) : (
                        <View style={[styles.expenseAndReportPreviewBoxBody, styles.mtn1]}>
                            <View style={styles.gap3}>
                                {shouldShowIOUHeader && (
                                    <UserInfoCellsWithArrow
                                        shouldShowToRecipient
                                        participantFrom={from}
                                        participantFromDisplayName={from.displayName ?? from.login ?? translate('common.hidden')}
                                        participantToDisplayName={to.displayName ?? to.login ?? translate('common.hidden')}
                                        participantTo={to}
                                        avatarSize={CONST.AVATAR_SIZE.XXX_SMALL}
                                        infoCellsTextStyle={styles.moneyRequestPreviewParticipantsText}
                                        infoCellsAvatarStyle={styles.pr1}
                                        style={[styles.flex1, styles.dFlex, styles.alignItemsCenter, styles.gap2, styles.flexRow]}
                                    />
                                )}
                                <View style={[styles.flexColumn, styles.gap1]}>
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                            {shouldShowPrimaryText && (
                                                <Text
                                                    fontSize={variables.fontSizeNormal}
                                                    style={[isDeleted && styles.lineThrough, styles.flexShrink1]}
                                                    numberOfLines={1}
                                                >
                                                    {primaryText}
                                                </Text>
                                            )}
                                        </View>
                                        {!shouldUseScanningLayout && (
                                            <Text
                                                fontSize={variables.fontSizeNormal}
                                                style={[isDeleted && styles.lineThrough, styles.flexShrink0]}
                                                numberOfLines={1}
                                            >
                                                {displayAmount}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                                        <Text
                                            numberOfLines={1}
                                            style={[isDeleted && styles.lineThrough, styles.textLabelSupporting, styles.pre, styles.flexShrink1, styles.lh16]}
                                        >
                                            {previewSupportingText}
                                        </Text>
                                        {!shouldUseScanningLayout && (
                                            <Text
                                                numberOfLines={1}
                                                style={[isDeleted && styles.lineThrough, styles.textLabelSupporting, styles.pre, styles.flexShrink0, styles.lh16]}
                                            >
                                                {displayTypeText}
                                            </Text>
                                        )}
                                    </View>
                                    {/* Split avatars sit bottom left, on the same row as "Your split", instead of trailing the merchant. */}
                                    {isBillSplit && (
                                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                                            <View style={styles.moneyRequestPreviewBoxAvatar}>
                                                <MultiAccountAvatar
                                                    accountIDs={participantAccountIDs}
                                                    horizontalOptions={{
                                                        avatarBorderColor: theme.cardBG,
                                                    }}
                                                    sortBy={[CONST.REPORT_ACTION_AVATARS.SORT_BY.ID]}
                                                    size={CONST.AVATAR_SIZE.XX_SMALL}
                                                />
                                            </View>
                                            {!!splitShare && (
                                                <Text style={[isDeleted && styles.lineThrough, styles.textLabel, styles.colorMuted, styles.flexShrink0]}>
                                                    {translate('iou.yourSplit', convertToDisplayString(splitShare, requestCurrency))}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                                {!isIOUSettled && shouldShowRBR && (
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                                        <Icon
                                            src={icons.DotIndicator}
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
                    {isReviewDuplicateTransactionPage && !isIOUSettled && !isApproved && !isCardTransaction && areThereDuplicates && (
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            style={[styles.ph4, styles.pb4]}
                            onPress={navigateToReviewFields}
                        >
                            <Button.Text>{translate('violations.keepThisOne')}</Button.Text>
                        </Button>
                    )}
                </View>
            </OfflineWithFeedback>
        </Animated.View>
    );
}

export default TransactionPreviewContent;
