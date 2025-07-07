"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fast_equals_1 = require("fast-equals");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AttachmentCarouselView_1 = require("./AttachmentCarouselView");
var extractAttachments_1 = require("./extractAttachments");
var useCarouselArrows_1 = require("./useCarouselArrows");
function AttachmentCarousel(_a) {
    var report = _a.report, attachmentID = _a.attachmentID, source = _a.source, onNavigate = _a.onNavigate, setDownloadButtonVisibility = _a.setDownloadButtonVisibility, type = _a.type, accountID = _a.accountID, onClose = _a.onClose, attachmentLink = _a.attachmentLink, onAttachmentError = _a.onAttachmentError;
    var parentReportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID), { canEvict: false, canBeMissing: true })[0];
    var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), { canEvict: false, canBeMissing: true })[0];
    var canUseTouchScreen = (0, DeviceCapabilities_1.canUseTouchScreen)();
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(), page = _b[0], setPage = _b[1];
    var _c = (0, react_1.useState)([]), attachments = _c[0], setAttachments = _c[1];
    var _d = (0, useCarouselArrows_1.default)(), shouldShowArrows = _d.shouldShowArrows, setShouldShowArrows = _d.setShouldShowArrows, autoHideArrows = _d.autoHideArrows, cancelAutoHideArrows = _d.cancelAutoHideArrows;
    (0, react_1.useEffect)(function () {
        if (!canUseTouchScreen) {
            return;
        }
        setShouldShowArrows(true);
    }, [canUseTouchScreen, page, setShouldShowArrows]);
    var compareImage = (0, react_1.useCallback)(function (attachment) {
        return (attachmentID ? attachment.attachmentID === attachmentID : attachment.source === source) && (!attachmentLink || attachment.attachmentLink === attachmentLink);
    }, [attachmentLink, attachmentID, source]);
    (0, react_1.useEffect)(function () {
        var parentReportAction = report.parentReportActionID && parentReportActions ? parentReportActions[report.parentReportActionID] : undefined;
        var newAttachments = [];
        if (type === CONST_1.default.ATTACHMENT_TYPE.NOTE && accountID) {
            newAttachments = (0, extractAttachments_1.default)(CONST_1.default.ATTACHMENT_TYPE.NOTE, { privateNotes: report.privateNotes, accountID: accountID, report: report });
        }
        else if (type === CONST_1.default.ATTACHMENT_TYPE.ONBOARDING) {
            newAttachments = (0, extractAttachments_1.default)(CONST_1.default.ATTACHMENT_TYPE.ONBOARDING, { parentReportAction: parentReportAction, reportActions: reportActions !== null && reportActions !== void 0 ? reportActions : undefined, report: report });
        }
        else {
            newAttachments = (0, extractAttachments_1.default)(CONST_1.default.ATTACHMENT_TYPE.REPORT, { parentReportAction: parentReportAction, reportActions: reportActions !== null && reportActions !== void 0 ? reportActions : undefined, report: report });
        }
        if ((0, fast_equals_1.deepEqual)(attachments, newAttachments)) {
            if (attachments.length === 0) {
                setPage(-1);
                setDownloadButtonVisibility === null || setDownloadButtonVisibility === void 0 ? void 0 : setDownloadButtonVisibility(false);
            }
            return;
        }
        var newIndex = newAttachments.findIndex(compareImage);
        var index = attachments.findIndex(compareImage);
        // If newAttachments includes an attachment with the same index, update newIndex to that index.
        // Previously, uploading an attachment offline would dismiss the modal when the image was previewed and the connection was restored.
        // Now, instead of dismissing the modal, we replace it with the new attachment that has the same index.
        if (newIndex === -1 && index !== -1 && newAttachments.at(index)) {
            newIndex = index;
        }
        // If no matching attachment with the same index, dismiss the modal
        if (newIndex === -1 && index !== -1 && attachments.at(index)) {
            Navigation_1.default.dismissModal();
        }
        else {
            setPage(newIndex);
            setAttachments(newAttachments);
            // Update the download button visibility in the parent modal
            if (setDownloadButtonVisibility) {
                setDownloadButtonVisibility(newIndex !== -1);
            }
            var attachment = newAttachments.at(newIndex);
            // Update the parent modal's state with the source and name from the mapped attachments
            if (newIndex !== -1 && attachment !== undefined && onNavigate) {
                onNavigate(attachment);
            }
        }
    }, [reportActions, parentReportActions, compareImage, attachments, setDownloadButtonVisibility, onNavigate, accountID, type, report]);
    if (page == null) {
        return (<react_native_1.View style={[styles.flex1, styles.attachmentCarouselContainer]}>
                <FullscreenLoadingIndicator_1.default />
            </react_native_1.View>);
    }
    return (<AttachmentCarouselView_1.default page={page} setPage={setPage} attachments={attachments} shouldShowArrows={shouldShowArrows} autoHideArrows={autoHideArrows} cancelAutoHideArrow={cancelAutoHideArrows} setShouldShowArrows={setShouldShowArrows} onClose={onClose} onAttachmentError={onAttachmentError} report={report} attachmentID={attachmentID} source={source}/>);
}
AttachmentCarousel.displayName = 'AttachmentCarousel';
exports.default = AttachmentCarousel;
