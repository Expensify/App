"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AttachmentView_1 = require("@components/Attachments/AttachmentView");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var addEncryptedAuthTokenToURL_1 = require("@libs/addEncryptedAuthTokenToURL");
var Browser_1 = require("@libs/Browser");
var fileDownload_1 = require("@libs/fileDownload");
var ReportUtils_1 = require("@libs/ReportUtils");
var Download_1 = require("@userActions/Download");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function BaseAnchorForAttachmentsOnly(_a) {
    var _b, _c;
    var style = _a.style, _d = _a.source, source = _d === void 0 ? '' : _d, _e = _a.displayName, displayName = _e === void 0 ? '' : _e, onPressIn = _a.onPressIn, onPressOut = _a.onPressOut, isDeleted = _a.isDeleted;
    var sourceURLWithAuth = (0, addEncryptedAuthTokenToURL_1.default)(source);
    var sourceID = ((_b = source.match(CONST_1.default.REGEX.ATTACHMENT_ID)) !== null && _b !== void 0 ? _b : [])[1];
    var download = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.DOWNLOAD).concat(sourceID), { canBeMissing: true })[0];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var styles = (0, useThemeStyles_1.default)();
    var isDownloading = (_c = download === null || download === void 0 ? void 0 : download.isDownloading) !== null && _c !== void 0 ? _c : false;
    return (<ShowContextMenuContext_1.ShowContextMenuContext.Consumer>
            {function (_a) {
            var anchor = _a.anchor, report = _a.report, isReportArchived = _a.isReportArchived, action = _a.action, checkIfContextMenuActive = _a.checkIfContextMenuActive, isDisabled = _a.isDisabled, shouldDisplayContextMenu = _a.shouldDisplayContextMenu;
            return (<PressableWithoutFeedback_1.default style={[style, (isOffline || !sourceID) && styles.cursorDefault]} onPress={function () {
                    if (isDownloading || isOffline || !sourceID) {
                        return;
                    }
                    (0, Download_1.setDownload)(sourceID, true);
                    (0, fileDownload_1.default)(sourceURLWithAuth, displayName, '', (0, Browser_1.isMobileSafari)()).then(function () { return (0, Download_1.setDownload)(sourceID, false); });
                }} onPressIn={onPressIn} onPressOut={onPressOut} onLongPress={function (event) {
                    if (isDisabled || !shouldDisplayContextMenu) {
                        return;
                    }
                    (0, ShowContextMenuContext_1.showContextMenuForReport)(event, anchor, report === null || report === void 0 ? void 0 : report.reportID, action, checkIfContextMenuActive, (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived));
                }} shouldUseHapticsOnLongPress accessibilityLabel={displayName} role={CONST_1.default.ROLE.BUTTON}>
                    <AttachmentView_1.default source={source} file={{ name: displayName }} shouldShowDownloadIcon={!!sourceID && !isOffline} shouldShowLoadingSpinnerIcon={isDownloading} isUsedAsChatAttachment isDeleted={!!isDeleted} isUploading={!sourceID} isAuthTokenRequired={!!sourceID}/>
                </PressableWithoutFeedback_1.default>);
        }}
        </ShowContextMenuContext_1.ShowContextMenuContext.Consumer>);
}
BaseAnchorForAttachmentsOnly.displayName = 'BaseAnchorForAttachmentsOnly';
exports.default = BaseAnchorForAttachmentsOnly;
