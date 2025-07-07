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
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var Report_1 = require("@libs/actions/Report");
var AttachmentUtils_1 = require("@libs/AttachmentUtils");
var ComposerFocusManager_1 = require("@libs/ComposerFocusManager");
var Localize_1 = require("@libs/Localize");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var AttachmentModalContainer_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalContainer");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function ReportAttachmentModalContent(_a) {
    var route = _a.route, navigation = _a.navigation;
    var _b = route.params, attachmentID = _b.attachmentID, type = _b.type, fileParam = _b.file, sourceParam = _b.source, isAuthTokenRequired = _b.isAuthTokenRequired, attachmentLink = _b.attachmentLink, originalFileName = _b.originalFileName, _c = _b.accountID, accountID = _c === void 0 ? CONST_1.default.DEFAULT_NUMBER_ID : _c, reportID = _b.reportID, hashKey = _b.hashKey, shouldDisableSendButton = _b.shouldDisableSendButton, headerTitle = _b.headerTitle, onConfirm = _b.onConfirm, onShow = _b.onShow;
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: false })[0];
    var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID), {
        canEvict: false,
        canBeMissing: true,
    })[0];
    var reportMetadata = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(reportID), {
        canBeMissing: false,
    })[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: true })[0];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _d = (0, react_1.useState)(false), isAttachmentInvalid = _d[0], setIsAttachmentInvalid = _d[1];
    var _e = (0, react_1.useState)(null), attachmentInvalidReason = _e[0], setAttachmentInvalidReason = _e[1];
    var _f = (0, react_1.useState)(null), attachmentInvalidReasonTitle = _f[0], setAttachmentInvalidReasonTitle = _f[1];
    var submitRef = (0, react_1.useRef)(null);
    // Extract the reportActionID from the attachmentID (format: reportActionID_index)
    var reportActionID = (0, react_1.useMemo)(function () { var _a; return (_a = attachmentID === null || attachmentID === void 0 ? void 0 : attachmentID.split('_')) === null || _a === void 0 ? void 0 : _a[0]; }, [attachmentID]);
    var shouldFetchReport = (0, react_1.useMemo)(function () {
        return (0, EmptyObject_1.isEmptyObject)(reportActions === null || reportActions === void 0 ? void 0 : reportActions[reportActionID !== null && reportActionID !== void 0 ? reportActionID : CONST_1.default.DEFAULT_NUMBER_ID]);
    }, [reportActions, reportActionID]);
    var isLoading = (0, react_1.useMemo)(function () {
        if (isOffline || (0, ReportUtils_1.isReportNotFound)(report) || !reportID) {
            return false;
        }
        var isEmptyReport = (0, EmptyObject_1.isEmptyObject)(report);
        return !!isLoadingApp || isEmptyReport || ((reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingInitialReportActions) !== false && shouldFetchReport);
    }, [isOffline, reportID, isLoadingApp, report, reportMetadata, shouldFetchReport]);
    var _g = (0, react_1.useState)(CONST_1.default.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE), modalType = _g[0], setModalType = _g[1];
    var _h = (0, react_1.useState)(function () { return Number(sourceParam) || (typeof sourceParam === 'string' ? (0, tryResolveUrlFromApiRoot_1.default)(decodeURIComponent(sourceParam)) : undefined); }), source = _h[0], setSource = _h[1];
    var fetchReport = (0, react_1.useCallback)(function () {
        (0, Report_1.openReport)(reportID, reportActionID);
    }, [reportID, reportActionID]);
    (0, react_1.useEffect)(function () {
        if (!reportID || !shouldFetchReport) {
            return;
        }
        fetchReport();
    }, [reportID, fetchReport, shouldFetchReport]);
    var onCarouselAttachmentChange = (0, react_1.useCallback)(function (attachment) {
        var _a;
        var routeToNavigate = ROUTES_1.default.ATTACHMENTS.getRoute({
            reportID: reportID,
            attachmentID: attachment.attachmentID,
            type: type,
            source: String(attachment.source),
            accountID: accountID,
            isAuthTokenRequired: attachment === null || attachment === void 0 ? void 0 : attachment.isAuthTokenRequired,
            originalFileName: (_a = attachment === null || attachment === void 0 ? void 0 : attachment.file) === null || _a === void 0 ? void 0 : _a.name,
            attachmentLink: attachment === null || attachment === void 0 ? void 0 : attachment.attachmentLink,
            hashKey: hashKey,
        });
        Navigation_1.default.navigate(routeToNavigate);
    }, [reportID, type, accountID, hashKey]);
    var onClose = (0, react_1.useCallback)(function () {
        // This enables Composer refocus when the attachments modal is closed by the browser navigation
        ComposerFocusManager_1.default.setReadyToFocus();
    }, []);
    /**
     * If our attachment is a PDF, return the unswipeable Modal type.
     */
    var getModalType = (0, react_1.useCallback)(function (sourceURL, fileObject) {
        var _a;
        return sourceURL && (expensify_common_1.Str.isPDF(sourceURL) || (fileObject && expensify_common_1.Str.isPDF((_a = fileObject.name) !== null && _a !== void 0 ? _a : (0, Localize_1.translateLocal)('attachmentView.unknownFilename'))))
            ? CONST_1.default.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
            : CONST_1.default.MODAL.MODAL_TYPE.CENTERED;
    }, []);
    // Validates the attachment file and renders the appropriate modal type or errors
    var validateFile = (0, react_1.useCallback)(function (file, setFile) {
        if (!file) {
            return;
        }
        (0, AttachmentUtils_1.default)(file).then(function (result) {
            if (!result.isValid) {
                var error = result.error;
                setIsAttachmentInvalid === null || setIsAttachmentInvalid === void 0 ? void 0 : setIsAttachmentInvalid(true);
                switch (error) {
                    case 'tooLarge':
                        setAttachmentInvalidReasonTitle === null || setAttachmentInvalidReasonTitle === void 0 ? void 0 : setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooLarge');
                        setAttachmentInvalidReason === null || setAttachmentInvalidReason === void 0 ? void 0 : setAttachmentInvalidReason('attachmentPicker.sizeExceeded');
                        break;
                    case 'tooSmall':
                        setAttachmentInvalidReasonTitle === null || setAttachmentInvalidReasonTitle === void 0 ? void 0 : setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooSmall');
                        setAttachmentInvalidReason === null || setAttachmentInvalidReason === void 0 ? void 0 : setAttachmentInvalidReason('attachmentPicker.sizeNotMet');
                        break;
                    case 'fileDoesNotExist':
                        setAttachmentInvalidReasonTitle === null || setAttachmentInvalidReasonTitle === void 0 ? void 0 : setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
                        setAttachmentInvalidReason === null || setAttachmentInvalidReason === void 0 ? void 0 : setAttachmentInvalidReason('attachmentPicker.folderNotAllowedMessage');
                        break;
                    case 'fileInvalid':
                    default:
                        setAttachmentInvalidReasonTitle === null || setAttachmentInvalidReasonTitle === void 0 ? void 0 : setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
                        setAttachmentInvalidReason === null || setAttachmentInvalidReason === void 0 ? void 0 : setAttachmentInvalidReason('attachmentPicker.errorWhileSelectingCorruptedAttachment');
                }
                return;
            }
            var fileSource = result.source;
            var inputModalType = getModalType(fileSource, file);
            setModalType(inputModalType);
            setSource(fileSource);
            setFile(file);
        });
    }, [getModalType]);
    var contentTypeProps = (0, react_1.useMemo)(function () {
        return fileParam
            ? {
                file: fileParam,
                onValidateFile: validateFile,
            }
            : {
                // In native the imported images sources are of type number. Ref: https://reactnative.dev/docs/image#imagesource
                type: type,
                report: report,
                shouldShowNotFoundPage: !isLoading && type !== CONST_1.default.ATTACHMENT_TYPE.SEARCH && !(report === null || report === void 0 ? void 0 : report.reportID),
                allowDownload: true,
                isAuthTokenRequired: !!isAuthTokenRequired,
                attachmentLink: attachmentLink !== null && attachmentLink !== void 0 ? attachmentLink : '',
                originalFileName: originalFileName !== null && originalFileName !== void 0 ? originalFileName : '',
                isLoading: isLoading,
            };
    }, [attachmentLink, fileParam, isAuthTokenRequired, isLoading, originalFileName, report, type, validateFile]);
    var contentProps = (0, react_1.useMemo)(function () { return (__assign(__assign({}, contentTypeProps), { source: source, attachmentID: attachmentID, accountID: accountID, onConfirm: onConfirm, headerTitle: headerTitle, isAttachmentInvalid: isAttachmentInvalid, attachmentInvalidReasonTitle: attachmentInvalidReasonTitle, attachmentInvalidReason: attachmentInvalidReason, shouldDisableSendButton: shouldDisableSendButton, submitRef: submitRef, onCarouselAttachmentChange: onCarouselAttachmentChange })); }, [
        accountID,
        attachmentID,
        attachmentInvalidReason,
        attachmentInvalidReasonTitle,
        contentTypeProps,
        headerTitle,
        isAttachmentInvalid,
        onCarouselAttachmentChange,
        onConfirm,
        shouldDisableSendButton,
        source,
    ]);
    // If the user refreshes during the send attachment flow, we need to navigate back to the report or home
    (0, react_1.useEffect)(function () {
        if (!!sourceParam || !!fileParam) {
            return;
        }
        Navigation_1.default.isNavigationReady().then(function () {
            if (reportID) {
                Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID));
            }
            else {
                Navigation_1.default.goBack(ROUTES_1.default.HOME);
            }
        });
    }, [sourceParam, reportID, route.name, fileParam]);
    return (<AttachmentModalContainer_1.default navigation={navigation} contentProps={contentProps} modalType={modalType} onShow={onShow} onClose={onClose}/>);
}
ReportAttachmentModalContent.displayName = 'ReportAttachmentModalContent';
exports.default = ReportAttachmentModalContent;
