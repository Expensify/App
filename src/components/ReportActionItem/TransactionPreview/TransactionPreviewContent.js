"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var sortBy_1 = require("lodash/sortBy");
var truncate_1 = require("lodash/truncate");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var MultipleAvatars_1 = require("@components/MultipleAvatars");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ReportActionItemImages_1 = require("@components/ReportActionItem/ReportActionItemImages");
var UserInfoCellsWithArrow_1 = require("@components/SelectionList/Search/UserInfoCellsWithArrow");
var Text_1 = require("@components/Text");
var TransactionPreviewSkeletonView_1 = require("@components/TransactionPreviewSkeletonView");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var getNonEmptyStringOnyxID_1 = require("@libs/getNonEmptyStringOnyxID");
var IOUUtils_1 = require("@libs/IOUUtils");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Parser_1 = require("@libs/Parser");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReceiptUtils_1 = require("@libs/ReceiptUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var StringUtils_1 = require("@libs/StringUtils");
var TransactionPreviewUtils_1 = require("@libs/TransactionPreviewUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var ViolationsUtils_1 = require("@libs/Violations/ViolationsUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function TransactionPreviewContent(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var action = _a.action, isWhisper = _a.isWhisper, isHovered = _a.isHovered, chatReport = _a.chatReport, personalDetails = _a.personalDetails, report = _a.report, transaction = _a.transaction, violations = _a.violations, transactionRawAmount = _a.transactionRawAmount, offlineWithFeedbackOnClose = _a.offlineWithFeedbackOnClose, containerStyles = _a.containerStyles, transactionPreviewWidth = _a.transactionPreviewWidth, isBillSplit = _a.isBillSplit, areThereDuplicates = _a.areThereDuplicates, sessionAccountID = _a.sessionAccountID, walletTermsErrors = _a.walletTermsErrors, reportPreviewAction = _a.reportPreviewAction, _p = _a.shouldHideOnDelete, shouldHideOnDelete = _p === void 0 ? true : _p, shouldShowPayerAndReceiver = _a.shouldShowPayerAndReceiver, navigateToReviewFields = _a.navigateToReviewFields, _q = _a.isReviewDuplicateTransactionPage, isReviewDuplicateTransactionPage = _q === void 0 ? false : _q;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: true })[0];
    var transactionDetails = (0, react_1.useMemo)(function () { var _a; return (_a = (0, ReportUtils_1.getTransactionDetails)(transaction, undefined, policy)) !== null && _a !== void 0 ? _a : {}; }, [transaction, policy]);
    var amount = transactionDetails.amount, requestComment = transactionDetails.comment, merchant = transactionDetails.merchant, tag = transactionDetails.tag, category = transactionDetails.category, requestCurrency = transactionDetails.currency;
    var managerID = (_c = (_b = report === null || report === void 0 ? void 0 : report.managerID) !== null && _b !== void 0 ? _b : reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.childManagerAccountID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID;
    var ownerAccountID = (_e = (_d = report === null || report === void 0 ? void 0 : report.ownerAccountID) !== null && _d !== void 0 ? _d : reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.childOwnerAccountID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID;
    var isReportAPolicyExpenseChat = (0, ReportUtils_1.isPolicyExpenseChat)(chatReport);
    var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((0, getNonEmptyStringOnyxID_1.default)(report === null || report === void 0 ? void 0 : report.reportID)), { canBeMissing: true })[0];
    var transactionPreviewCommonArguments = (0, react_1.useMemo)(function () { return ({
        iouReport: report,
        transaction: transaction,
        action: action,
        isBillSplit: isBillSplit,
        violations: violations,
        transactionDetails: transactionDetails,
    }); }, [action, report, isBillSplit, transaction, transactionDetails, violations]);
    var conditionals = (0, react_1.useMemo)(function () {
        return (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(__assign(__assign({}, transactionPreviewCommonArguments), { areThereDuplicates: areThereDuplicates, isReportAPolicyExpenseChat: isReportAPolicyExpenseChat }));
    }, [areThereDuplicates, transactionPreviewCommonArguments, isReportAPolicyExpenseChat]);
    var shouldShowRBR = conditionals.shouldShowRBR, shouldShowMerchant = conditionals.shouldShowMerchant, shouldShowSplitShare = conditionals.shouldShowSplitShare, shouldShowTag = conditionals.shouldShowTag, shouldShowCategory = conditionals.shouldShowCategory, shouldShowSkeleton = conditionals.shouldShowSkeleton, shouldShowDescription = conditionals.shouldShowDescription;
    var firstViolation = violations.at(0);
    var isIOUActionType = (0, ReportActionsUtils_1.isMoneyRequestAction)(action);
    var canEdit = isIOUActionType && (0, ReportUtils_1.canEditMoneyRequest)(action, transaction);
    var violationMessage = firstViolation ? ViolationsUtils_1.default.getViolationTranslation(firstViolation, translate, canEdit) : undefined;
    var previewText = (0, react_1.useMemo)(function () {
        return (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(__assign(__assign({}, transactionPreviewCommonArguments), { shouldShowRBR: shouldShowRBR, violationMessage: violationMessage, reportActions: reportActions }));
    }, [transactionPreviewCommonArguments, shouldShowRBR, violationMessage, reportActions]);
    var getTranslatedText = function (item) { var _a; return (item.translationPath ? translate(item.translationPath) : ((_a = item.text) !== null && _a !== void 0 ? _a : '')); };
    var previewHeaderText = previewText.previewHeaderText.reduce(function (text, currentKey) {
        return "".concat(text).concat(getTranslatedText(currentKey));
    }, '');
    var RBRMessage = getTranslatedText(previewText.RBRMessage);
    var displayAmountText = getTranslatedText(previewText.displayAmountText);
    var displayDeleteAmountText = getTranslatedText(previewText.displayDeleteAmountText);
    var isDeleted = (action === null || action === void 0 ? void 0 : action.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || (transaction === null || transaction === void 0 ? void 0 : transaction.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    var shouldShowCategoryOrTag = shouldShowCategory || shouldShowTag;
    var shouldShowMerchantOrDescription = shouldShowDescription || shouldShowMerchant;
    var description = (0, truncate_1.default)(StringUtils_1.default.lineBreaksToSpaces(Parser_1.default.htmlToText(requestComment !== null && requestComment !== void 0 ? requestComment : '')), { length: CONST_1.default.REQUEST_PREVIEW.MAX_LENGTH });
    var requestMerchant = (0, truncate_1.default)(merchant, { length: CONST_1.default.REQUEST_PREVIEW.MAX_LENGTH });
    var isApproved = (0, ReportUtils_1.isReportApproved)({ report: report });
    var isIOUSettled = (0, ReportUtils_1.isSettled)(report === null || report === void 0 ? void 0 : report.reportID);
    var isSettlementOrApprovalPartial = !!((_f = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _f === void 0 ? void 0 : _f.partial);
    var isTransactionScanning = (0, TransactionUtils_1.isScanning)(transaction);
    var displayAmount = isDeleted ? displayDeleteAmountText : displayAmountText;
    var receiptImages = [__assign(__assign({}, (0, ReceiptUtils_1.getThumbnailAndImageURIs)(transaction)), { transaction: transaction })];
    var merchantOrDescription = shouldShowMerchant ? requestMerchant : description || '';
    var participantAccountIDs = (0, ReportActionsUtils_1.isMoneyRequestAction)(action) && isBillSplit ? ((_h = (_g = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _g === void 0 ? void 0 : _g.participantAccountIDs) !== null && _h !== void 0 ? _h : []) : [managerID, ownerAccountID];
    var participantAvatars = (0, OptionsListUtils_1.getAvatarsForAccountIDs)(participantAccountIDs, personalDetails !== null && personalDetails !== void 0 ? personalDetails : {});
    var sortedParticipantAvatars = (0, sortBy_1.default)(participantAvatars, function (avatar) { return avatar.id; });
    if (isReportAPolicyExpenseChat && isBillSplit) {
        sortedParticipantAvatars.push((0, ReportUtils_1.getWorkspaceIcon)(chatReport));
    }
    // Compute the from/to data only for IOU reports
    var _r = (0, react_1.useMemo)(function () {
        if (!shouldShowPayerAndReceiver) {
            return {
                from: undefined,
                to: undefined,
            };
        }
        // For IOU or Split, we want the unprocessed amount because it is important whether the amount was positive or negative
        var payerAndReceiver = (0, TransactionPreviewUtils_1.getIOUPayerAndReceiver)(managerID, ownerAccountID, personalDetails, transactionRawAmount);
        return {
            from: payerAndReceiver.from,
            to: payerAndReceiver.to,
        };
    }, [managerID, ownerAccountID, personalDetails, shouldShowPayerAndReceiver, transactionRawAmount]), from = _r.from, to = _r.to;
    var shouldShowIOUHeader = !!from && !!to;
    // If available, retrieve the split share from the splits object of the transaction, if not, display an even share.
    var splitShare = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d;
        return shouldShowSplitShare
            ? ((_d = (_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.splits) === null || _b === void 0 ? void 0 : _b.find(function (split) { return split.accountID === sessionAccountID; })) === null || _c === void 0 ? void 0 : _c.amount) !== null && _d !== void 0 ? _d : (0, IOUUtils_1.calculateAmount)(isReportAPolicyExpenseChat ? 1 : participantAccountIDs.length - 1, amount !== null && amount !== void 0 ? amount : 0, requestCurrency !== null && requestCurrency !== void 0 ? requestCurrency : '', (action === null || action === void 0 ? void 0 : action.actorAccountID) === sessionAccountID))
            : 0;
    }, [shouldShowSplitShare, isReportAPolicyExpenseChat, action === null || action === void 0 ? void 0 : action.actorAccountID, participantAccountIDs.length, (_j = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _j === void 0 ? void 0 : _j.splits, amount, requestCurrency, sessionAccountID]);
    var shouldWrapDisplayAmount = !(isBillSplit || shouldShowMerchantOrDescription || isTransactionScanning);
    var previewTextViewGap = (shouldShowCategoryOrTag || !shouldWrapDisplayAmount) && styles.gap2;
    var previewTextMargin = shouldShowIOUHeader && shouldShowMerchantOrDescription && !isBillSplit && !shouldShowCategoryOrTag && styles.mbn1;
    var transactionWrapperStyles = [styles.border, styles.moneyRequestPreviewBox, (isIOUSettled || isApproved) && isSettlementOrApprovalPartial && styles.offlineFeedback.pending];
    return (<react_native_1.View style={[transactionWrapperStyles, containerStyles]}>
            <OfflineWithFeedback_1.default errors={walletTermsErrors} onClose={function () { return offlineWithFeedbackOnClose; }} errorRowStyles={[styles.mbn1]} needsOffscreenAlphaCompositing pendingAction={action === null || action === void 0 ? void 0 : action.pendingAction} shouldDisableStrikeThrough={isDeleted} shouldDisableOpacity={isDeleted} shouldHideOnDelete={shouldHideOnDelete}>
                <react_native_1.View style={[(isTransactionScanning || isWhisper) && [styles.reportPreviewBoxHoverBorder, styles.reportContainerBorderRadius]]}>
                    <ReportActionItemImages_1.default images={receiptImages} 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    isHovered={isHovered || isTransactionScanning} size={1} shouldUseAspectRatio/>
                    {shouldShowSkeleton ? (<TransactionPreviewSkeletonView_1.default transactionPreviewWidth={transactionPreviewWidth}/>) : (<react_native_1.View style={[styles.expenseAndReportPreviewBoxBody, styles.mtn1]}>
                            <react_native_1.View style={styles.gap3}>
                                {shouldShowIOUHeader && (<react_native_1.View style={[styles.flex1, styles.dFlex, styles.alignItemsCenter, styles.gap2, styles.flexRow]}>
                                        <UserInfoCellsWithArrow_1.default shouldShowToRecipient participantFrom={from} participantFromDisplayName={(_l = (_k = from.displayName) !== null && _k !== void 0 ? _k : from.login) !== null && _l !== void 0 ? _l : translate('common.hidden')} participantToDisplayName={(_o = (_m = to.displayName) !== null && _m !== void 0 ? _m : to.login) !== null && _o !== void 0 ? _o : translate('common.hidden')} participantTo={to} avatarSize="mid-subscript" infoCellsTextStyle={__assign(__assign({}, styles.textMicroBold), { lineHeight: 14 })} infoCellsAvatarStyle={styles.pr1}/>
                                    </react_native_1.View>)}
                                <react_native_1.View style={previewTextViewGap}>
                                    <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                                        <Text_1.default style={[isDeleted && styles.lineThrough, styles.textLabelSupporting, styles.flex1, styles.lh16, previewTextMargin]}>{previewHeaderText}</Text_1.default>
                                        {isBillSplit && (<react_native_1.View style={styles.moneyRequestPreviewBoxAvatar}>
                                                <MultipleAvatars_1.default icons={sortedParticipantAvatars} shouldStackHorizontally size="subscript" shouldUseCardBackground/>
                                            </react_native_1.View>)}
                                        {shouldWrapDisplayAmount && (<Text_1.default fontSize={variables_1.default.fontSizeNormal} style={[isDeleted && styles.lineThrough, styles.flexShrink0]} numberOfLines={1}>
                                                {displayAmount}
                                            </Text_1.default>)}
                                    </react_native_1.View>
                                    <react_native_1.View>
                                        <react_native_1.View style={[styles.flexRow]}>
                                            <react_native_1.View style={[
                styles.flex1,
                styles.flexRow,
                styles.alignItemsCenter,
                isBillSplit && !shouldShowMerchantOrDescription ? styles.justifyContentEnd : styles.justifyContentBetween,
                styles.gap2,
            ]}>
                                                {shouldShowMerchantOrDescription && (<Text_1.default fontSize={variables_1.default.fontSizeNormal} style={[isDeleted && styles.lineThrough, styles.flexShrink1]} numberOfLines={1}>
                                                        {merchantOrDescription}
                                                    </Text_1.default>)}
                                                {!shouldWrapDisplayAmount && (<Text_1.default fontSize={variables_1.default.fontSizeNormal} style={[isDeleted && styles.lineThrough, styles.flexShrink0]} numberOfLines={1}>
                                                        {displayAmount}
                                                    </Text_1.default>)}
                                            </react_native_1.View>
                                        </react_native_1.View>
                                        <react_native_1.View style={[styles.flexRow, styles.justifyContentEnd]}>
                                            {!!splitShare && (<Text_1.default style={[isDeleted && styles.lineThrough, styles.textLabel, styles.colorMuted, styles.amountSplitPadding]}>
                                                    {translate('iou.yourSplit', { amount: (0, CurrencyUtils_1.convertToDisplayString)(splitShare, requestCurrency) })}
                                                </Text_1.default>)}
                                        </react_native_1.View>
                                    </react_native_1.View>
                                    {shouldShowCategoryOrTag && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                                            {shouldShowCategory && (<react_native_1.View style={[
                        styles.flexRow,
                        styles.alignItemsCenter,
                        styles.gap1,
                        shouldShowTag && styles.mw50,
                        shouldShowTag && styles.pr1,
                        styles.flexShrink1,
                    ]}>
                                                    <Icon_1.default src={Expensicons_1.Folder} height={variables_1.default.iconSizeExtraSmall} width={variables_1.default.iconSizeExtraSmall} fill={theme.icon}/>
                                                    <Text_1.default numberOfLines={1} style={[isDeleted && styles.lineThrough, styles.textMicroSupporting, styles.pre, styles.flexShrink1]}>
                                                        {category}
                                                    </Text_1.default>
                                                </react_native_1.View>)}
                                            {shouldShowTag && !!tag && (<react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap1, category && styles.pl1]}>
                                                    <Icon_1.default src={Expensicons_1.Tag} height={variables_1.default.iconSizeExtraSmall} width={variables_1.default.iconSizeExtraSmall} fill={theme.icon}/>
                                                    <Text_1.default numberOfLines={1} style={[isDeleted && styles.lineThrough, styles.textMicroSupporting, styles.pre, styles.flexShrink1]}>
                                                        {(0, PolicyUtils_1.getCleanedTagName)(tag)}
                                                    </Text_1.default>
                                                </react_native_1.View>)}
                                        </react_native_1.View>)}
                                </react_native_1.View>
                                {!isIOUSettled && shouldShowRBR && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                                        <Icon_1.default src={Expensicons_1.DotIndicator} fill={theme.danger} height={variables_1.default.iconSizeExtraSmall} width={variables_1.default.iconSizeExtraSmall}/>
                                        <Text_1.default numberOfLines={1} style={[isDeleted && styles.lineThrough, styles.textMicroSupporting, styles.pre, styles.flexShrink1, { color: theme.danger }]}>
                                            {RBRMessage}
                                        </Text_1.default>
                                    </react_native_1.View>)}
                            </react_native_1.View>
                        </react_native_1.View>)}
                    {isReviewDuplicateTransactionPage && !isIOUSettled && !isApproved && areThereDuplicates && (<Button_1.default text={translate('violations.keepThisOne')} success style={[styles.ph4, styles.pb4]} onPress={navigateToReviewFields}/>)}
                </react_native_1.View>
            </OfflineWithFeedback_1.default>
        </react_native_1.View>);
}
TransactionPreviewContent.displayName = 'TransactionPreviewContent';
exports.default = TransactionPreviewContent;
