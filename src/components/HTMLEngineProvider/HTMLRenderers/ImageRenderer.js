"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AttachmentContext_1 = require("@components/AttachmentContext");
var utils_1 = require("@components/Button/utils");
var htmlEngineUtils_1 = require("@components/HTMLEngineProvider/htmlEngineUtils");
var Expensicons_1 = require("@components/Icon/Expensicons");
var PressableWithoutFocus_1 = require("@components/Pressable/PressableWithoutFocus");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var ThumbnailImage_1 = require("@components/ThumbnailImage");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ImageRenderer(_a) {
    var _b;
    var tnode = _a.tnode;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var htmlAttribs = tnode.attributes;
    var isDeleted = (0, htmlEngineUtils_1.isDeletedNode)(tnode);
    // There are two kinds of images that need to be displayed:
    //
    //     - Chat Attachment images
    //
    //           Images uploaded by the user account via the app or email.
    //           These have a full-sized image `htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]`
    //           and a thumbnail `htmlAttribs.src`. Both of these URLs need to have
    //           an authToken added to them in order to control who
    //           can see the images.
    //
    //     - Non-Attachment Images
    //
    //           These could be hosted from anywhere (Expensify or another source)
    //           and are not protected by any kind of access control e.g. certain
    //           Concierge responder attachments are uploaded to S3 without any access
    //           control and thus require no authToken to verify access.
    //
    var attachmentSourceAttribute = (_b = htmlAttribs[CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE]) !== null && _b !== void 0 ? _b : (new RegExp(CONST_1.default.ATTACHMENT_OR_RECEIPT_LOCAL_URL, 'i').test(htmlAttribs.src) ? htmlAttribs.src : null);
    var isAttachmentOrReceipt = !!attachmentSourceAttribute;
    var attachmentID = htmlAttribs[CONST_1.default.ATTACHMENT_ID_ATTRIBUTE];
    // Files created/uploaded/hosted by App should resolve from API ROOT. Other URLs aren't modified
    var previewSource = (0, tryResolveUrlFromApiRoot_1.default)(htmlAttribs.src);
    // The backend always returns these thumbnails with a .jpg extension, even for .png images.
    // As a workaround, we remove the .1024.jpg or .320.jpg suffix only for .png images,
    // For other image formats, we retain the thumbnail as is to avoid unnecessary modifications.
    var processedPreviewSource = typeof previewSource === 'string' ? previewSource.replace(/\.png\.(1024|320)\.jpg$/, '.png') : previewSource;
    var source = (0, tryResolveUrlFromApiRoot_1.default)(isAttachmentOrReceipt ? attachmentSourceAttribute : htmlAttribs.src);
    var alt = htmlAttribs.alt;
    var imageWidth = (htmlAttribs['data-expensify-width'] && parseInt(htmlAttribs['data-expensify-width'], 10)) || undefined;
    var imageHeight = (htmlAttribs['data-expensify-height'] && parseInt(htmlAttribs['data-expensify-height'], 10)) || undefined;
    var imagePreviewModalDisabled = htmlAttribs['data-expensify-preview-modal-disabled'] === 'true';
    var fileType = (0, FileUtils_1.getFileType)(attachmentSourceAttribute);
    var fallbackIcon = fileType === CONST_1.default.ATTACHMENT_FILE_TYPE.FILE ? Expensicons_1.Document : Expensicons_1.GalleryNotFound;
    var theme = (0, useTheme_1.default)();
    var fileName = htmlAttribs[CONST_1.default.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE] || (0, FileUtils_1.getFileName)("".concat(isAttachmentOrReceipt ? attachmentSourceAttribute : htmlAttribs.src));
    var fileInfo = (0, FileUtils_1.splitExtensionFromFileName)(fileName);
    if (!fileInfo.fileExtension) {
        fileName = "".concat((fileInfo === null || fileInfo === void 0 ? void 0 : fileInfo.fileName) || CONST_1.default.DEFAULT_IMAGE_FILE_NAME, ".jpg");
    }
    var thumbnailImageComponent = (<ThumbnailImage_1.default previewSourceURL={processedPreviewSource} style={styles.webViewStyles.tagStyles.img} isAuthTokenRequired={isAttachmentOrReceipt} fallbackIcon={fallbackIcon} imageWidth={imageWidth} imageHeight={imageHeight} isDeleted={isDeleted} altText={alt} fallbackIconBackground={theme.highlightBG} fallbackIconColor={theme.border}/>);
    return imagePreviewModalDisabled ? (thumbnailImageComponent) : (<ShowContextMenuContext_1.ShowContextMenuContext.Consumer>
            {function (_a) {
            var onShowContextMenu = _a.onShowContextMenu, anchor = _a.anchor, report = _a.report, isReportArchived = _a.isReportArchived, action = _a.action, checkIfContextMenuActive = _a.checkIfContextMenuActive, isDisabled = _a.isDisabled, shouldDisplayContextMenu = _a.shouldDisplayContextMenu;
            return (<AttachmentContext_1.AttachmentContext.Consumer>
                    {function (_a) {
                    var reportID = _a.reportID, accountID = _a.accountID, type = _a.type;
                    return (<PressableWithoutFocus_1.default style={[styles.noOutline]} onPress={function () {
                            var _a, _b, _c;
                            if (!source || !type) {
                                return;
                            }
                            var attachmentLink = (_b = (_a = tnode.parent) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.href;
                            var route = (_c = ROUTES_1.default.ATTACHMENTS) === null || _c === void 0 ? void 0 : _c.getRoute({
                                attachmentID: attachmentID,
                                reportID: reportID,
                                type: type,
                                source: source,
                                accountID: accountID,
                                isAuthTokenRequired: isAttachmentOrReceipt,
                                originalFileName: fileName,
                                attachmentLink: attachmentLink,
                            });
                            Navigation_1.default.navigate(route);
                        }} onLongPress={function (event) {
                            if (isDisabled || !shouldDisplayContextMenu) {
                                return;
                            }
                            return onShowContextMenu(function () {
                                return (0, ShowContextMenuContext_1.showContextMenuForReport)(event, anchor, report === null || report === void 0 ? void 0 : report.reportID, action, checkIfContextMenuActive, (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived));
                            });
                        }} isNested shouldUseHapticsOnLongPress role={(0, utils_1.getButtonRole)(true)} accessibilityLabel={translate('accessibilityHints.viewAttachment')}>
                            {thumbnailImageComponent}
                        </PressableWithoutFocus_1.default>);
                }}
                </AttachmentContext_1.AttachmentContext.Consumer>);
        }}
        </ShowContextMenuContext_1.ShowContextMenuContext.Consumer>);
}
ImageRenderer.displayName = 'ImageRenderer';
var ImageRendererMemorize = (0, react_1.memo)(ImageRenderer, function (prevProps, nextProps) { var _a, _b; return prevProps.tnode.attributes === nextProps.tnode.attributes && ((_a = prevProps.account) === null || _a === void 0 ? void 0 : _a.shouldUseStagingServer) === ((_b = nextProps.account) === null || _b === void 0 ? void 0 : _b.shouldUseStagingServer); });
function ImageRendererWrapper(props) {
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    return (<ImageRendererMemorize 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} account={account}/>);
}
exports.default = ImageRendererWrapper;
