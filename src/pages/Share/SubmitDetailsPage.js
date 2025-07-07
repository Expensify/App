"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var LocationPermissionModal_1 = require("@components/LocationPermissionModal");
var MoneyRequestConfirmationList_1 = require("@components/MoneyRequestConfirmationList");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var IOU_1 = require("@libs/actions/IOU");
var DateUtils_1 = require("@libs/DateUtils");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var getCurrentPosition_1 = require("@libs/getCurrentPosition");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ShareRootPage_1 = require("./ShareRootPage");
function SubmitDetailsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var reportOrAccountID = _a.route.params.reportOrAccountID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var currentAttachment = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHARE_TEMP_FILE, { canBeMissing: true })[0];
    var unknownUserDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHARE_UNKNOWN_USER_DETAILS, { canBeMissing: true })[0];
    var personalDetails = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST), { canBeMissing: true })[0];
    var report = (0, ReportUtils_1.getReportOrDraftReport)(reportOrAccountID);
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: false })[0];
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID), { canBeMissing: true })[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat((0, IOU_1.getIOURequestPolicyID)(transaction, report)), { canBeMissing: false })[0];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat((0, IOU_1.getIOURequestPolicyID)(transaction, report)), { canBeMissing: false })[0];
    var lastLocationPermissionPrompt = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_LAST_LOCATION_PERMISSION_PROMPT, { canBeMissing: false })[0];
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var _j = (0, react_1.useState)(false), startLocationPermissionFlow = _j[0], setStartLocationPermissionFlow = _j[1];
    var _k = (0, react_1.useState)(undefined), errorTitle = _k[0], setErrorTitle = _k[1];
    var _l = (0, react_1.useState)(undefined), errorMessage = _l[0], setErrorMessage = _l[1];
    (0, react_1.useEffect)(function () {
        if (!errorTitle || !errorMessage) {
            return;
        }
        (0, ShareRootPage_1.showErrorAlert)(errorTitle, errorMessage);
    }, [errorTitle, errorMessage]);
    (0, react_1.useEffect)(function () {
        (0, IOU_1.initMoneyRequest)({
            reportID: reportOrAccountID,
            policy: policy,
            currentIouRequestType: CONST_1.default.IOU.REQUEST_TYPE.SCAN,
            newIouRequestType: CONST_1.default.IOU.REQUEST_TYPE.SCAN,
        });
    }, [reportOrAccountID, policy]);
    var selectedParticipants = unknownUserDetails ? [unknownUserDetails] : (0, IOU_1.getMoneyRequestParticipantsFromReport)(report);
    var participants = selectedParticipants.map(function (participant) { return ((participant === null || participant === void 0 ? void 0 : participant.accountID) ? (0, OptionsListUtils_1.getParticipantsOption)(participant, personalDetails) : (0, OptionsListUtils_1.getReportOption)(participant)); });
    var trimmedComment = (_d = (_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.comment) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : '';
    var transactionAmount = (_e = transaction === null || transaction === void 0 ? void 0 : transaction.amount) !== null && _e !== void 0 ? _e : 0;
    var transactionTaxAmount = (_f = transaction === null || transaction === void 0 ? void 0 : transaction.taxAmount) !== null && _f !== void 0 ? _f : 0;
    var defaultTaxCode = (0, TransactionUtils_1.getDefaultTaxCode)(policy, transaction);
    var transactionTaxCode = (_g = ((transaction === null || transaction === void 0 ? void 0 : transaction.taxCode) ? transaction === null || transaction === void 0 ? void 0 : transaction.taxCode : defaultTaxCode)) !== null && _g !== void 0 ? _g : '';
    var finishRequestAndNavigate = function (participant, receipt, gpsPoints) {
        var _a, _b, _c;
        if (!transaction) {
            return;
        }
        if ((0, ReportUtils_1.isSelfDM)(report)) {
            (0, IOU_1.trackExpense)({
                report: report !== null && report !== void 0 ? report : { reportID: reportOrAccountID },
                isDraftPolicy: false,
                participantParams: { payeeEmail: currentUserPersonalDetails.login, payeeAccountID: currentUserPersonalDetails.accountID, participant: participant },
                policyParams: { policy: policy, policyTagList: policyTags, policyCategories: policyCategories },
                action: CONST_1.default.IOU.TYPE.CREATE,
                transactionParams: {
                    amount: transactionAmount,
                    currency: transaction.currency,
                    comment: trimmedComment,
                    receipt: receipt,
                    category: transaction.category,
                    tag: transaction.tag,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    billable: transaction.billable,
                    merchant: (_a = transaction.merchant) !== null && _a !== void 0 ? _a : '',
                    created: transaction.created,
                    actionableWhisperReportActionID: transaction.actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: transaction.linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: transaction.linkedTrackedExpenseReportID,
                },
            });
        }
        else {
            (0, IOU_1.requestMoney)({
                report: report,
                participantParams: { payeeEmail: currentUserPersonalDetails.login, payeeAccountID: currentUserPersonalDetails.accountID, participant: participant },
                policyParams: { policy: policy, policyTagList: policyTags, policyCategories: policyCategories },
                gpsPoints: gpsPoints,
                action: CONST_1.default.IOU.TYPE.CREATE,
                transactionParams: {
                    attendees: (_b = transaction.comment) === null || _b === void 0 ? void 0 : _b.attendees,
                    amount: transactionAmount,
                    currency: transaction.currency,
                    comment: trimmedComment,
                    receipt: receipt,
                    category: transaction.category,
                    tag: transaction.tag,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    billable: transaction.billable,
                    merchant: (_c = transaction.merchant) !== null && _c !== void 0 ? _c : '',
                    created: transaction.created,
                    actionableWhisperReportActionID: transaction.actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: transaction.linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: transaction.linkedTrackedExpenseReportID,
                },
            });
        }
    };
    var onSuccess = function (file, locationPermissionGranted) {
        var participant = selectedParticipants.at(0);
        if (!participant) {
            return;
        }
        var receipt = file;
        receipt.state = file && CONST_1.default.IOU.RECEIPT_STATE.SCAN_READY;
        if (locationPermissionGranted) {
            (0, getCurrentPosition_1.default)(function (successData) {
                finishRequestAndNavigate(participant, receipt, {
                    lat: successData.coords.latitude,
                    long: successData.coords.longitude,
                });
            }, function (errorData) {
                Log_1.default.info('[SubmitDetailsPage] getCurrentPosition failed', false, errorData);
                finishRequestAndNavigate(participant, receipt);
            }, {
                maximumAge: CONST_1.default.GPS.MAX_AGE,
                timeout: CONST_1.default.GPS.TIMEOUT,
            });
            return;
        }
        finishRequestAndNavigate(participant, receipt);
    };
    var onConfirm = function (gpsRequired) {
        var _a, _b, _c;
        var shouldStartLocationPermissionFlow = gpsRequired &&
            (!lastLocationPermissionPrompt ||
                (DateUtils_1.default.isValidDateString(lastLocationPermissionPrompt !== null && lastLocationPermissionPrompt !== void 0 ? lastLocationPermissionPrompt : '') &&
                    DateUtils_1.default.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt !== null && lastLocationPermissionPrompt !== void 0 ? lastLocationPermissionPrompt : '')) > CONST_1.default.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS));
        if (shouldStartLocationPermissionFlow) {
            setStartLocationPermissionFlow(true);
            return;
        }
        (0, FileUtils_1.readFileAsync)((_a = currentAttachment === null || currentAttachment === void 0 ? void 0 : currentAttachment.content) !== null && _a !== void 0 ? _a : '', (0, FileUtils_1.getFileName)((_b = currentAttachment === null || currentAttachment === void 0 ? void 0 : currentAttachment.content) !== null && _b !== void 0 ? _b : 'shared_image.png'), function (file) { return onSuccess(file, shouldStartLocationPermissionFlow); }, function () { }, (_c = currentAttachment === null || currentAttachment === void 0 ? void 0 : currentAttachment.mimeType) !== null && _c !== void 0 ? _c : 'image/jpeg');
    };
    return (<ScreenWrapper_1.default testID={SubmitDetailsPage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={!reportOrAccountID}>
                <HeaderWithBackButton_1.default title={translate('common.details')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <LocationPermissionModal_1.default startPermissionFlow={startLocationPermissionFlow} resetPermissionFlow={function () { return setStartLocationPermissionFlow(false); }} onGrant={onConfirm} onDeny={function () {
            (0, IOU_1.updateLastLocationPermissionPrompt)();
            setStartLocationPermissionFlow(false);
            onConfirm(false);
        }}/>
                <react_native_1.View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <MoneyRequestConfirmationList_1.default transaction={transaction} selectedParticipants={participants} iouAmount={0} iouComment={trimmedComment} iouCategory={transaction === null || transaction === void 0 ? void 0 : transaction.category} onConfirm={function () { return onConfirm(true); }} receiptPath={currentAttachment === null || currentAttachment === void 0 ? void 0 : currentAttachment.content} receiptFilename={(0, FileUtils_1.getFileName)((_h = currentAttachment === null || currentAttachment === void 0 ? void 0 : currentAttachment.content) !== null && _h !== void 0 ? _h : '')} reportID={reportOrAccountID} shouldShowSmartScanFields={false} isDistanceRequest={false} onPDFLoadError={function () {
            if (errorTitle) {
                return;
            }
            setErrorTitle(translate('attachmentPicker.attachmentError'));
            setErrorMessage(translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
        }} onPDFPassword={function () {
            if (errorTitle) {
                return;
            }
            setErrorTitle(translate('attachmentPicker.attachmentError'));
            setErrorMessage(translate('attachmentPicker.protectedPDFNotSupported'));
        }}/>
                </react_native_1.View>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
SubmitDetailsPage.displayName = 'SubmitDetailsPage';
exports.default = SubmitDetailsPage;
