"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AttachmentContext_1 = require("@components/AttachmentContext");
var htmlEngineUtils_1 = require("@components/HTMLEngineProvider/htmlEngineUtils");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var VideoPlayerPreview_1 = require("@components/VideoPlayerPreview");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function VideoRenderer(_a) {
    var tnode = _a.tnode, key = _a.key;
    var htmlAttribs = tnode.attributes;
    var attrHref = htmlAttribs[CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE] || htmlAttribs.src || htmlAttribs.href || '';
    var sourceURL = (0, tryResolveUrlFromApiRoot_1.default)(attrHref);
    var fileName = (0, FileUtils_1.getFileName)("".concat(sourceURL));
    var thumbnailUrl = (0, tryResolveUrlFromApiRoot_1.default)(htmlAttribs[CONST_1.default.ATTACHMENT_THUMBNAIL_URL_ATTRIBUTE]);
    var width = Number(htmlAttribs[CONST_1.default.ATTACHMENT_THUMBNAIL_WIDTH_ATTRIBUTE]);
    var height = Number(htmlAttribs[CONST_1.default.ATTACHMENT_THUMBNAIL_HEIGHT_ATTRIBUTE]);
    var duration = Number(htmlAttribs[CONST_1.default.ATTACHMENT_DURATION_ATTRIBUTE]);
    var isDeleted = (0, htmlEngineUtils_1.isDeletedNode)(tnode);
    var attachmentID = htmlAttribs[CONST_1.default.ATTACHMENT_ID_ATTRIBUTE];
    return (<ShowContextMenuContext_1.ShowContextMenuContext.Consumer>
            {function (_a) {
            var report = _a.report;
            return (<AttachmentContext_1.AttachmentContext.Consumer>
                    {function (_a) {
                    var accountID = _a.accountID, type = _a.type, hashKey = _a.hashKey, reportID = _a.reportID;
                    return (<VideoPlayerPreview_1.default key={key} videoUrl={sourceURL} reportID={reportID !== null && reportID !== void 0 ? reportID : report === null || report === void 0 ? void 0 : report.reportID} fileName={fileName} thumbnailUrl={thumbnailUrl} videoDimensions={{ width: width, height: height }} videoDuration={duration} isDeleted={isDeleted} onShowModalPress={function () {
                            if (!sourceURL || !type) {
                                return;
                            }
                            var isAuthTokenRequired = !!htmlAttribs[CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE];
                            var route = ROUTES_1.default.ATTACHMENTS.getRoute({ attachmentID: attachmentID, reportID: report === null || report === void 0 ? void 0 : report.reportID, type: type, source: sourceURL, accountID: accountID, isAuthTokenRequired: isAuthTokenRequired, hashKey: hashKey });
                            Navigation_1.default.navigate(route);
                        }}/>);
                }}
                </AttachmentContext_1.AttachmentContext.Consumer>);
        }}
        </ShowContextMenuContext_1.ShowContextMenuContext.Consumer>);
}
VideoRenderer.displayName = 'VideoRenderer';
exports.default = VideoRenderer;
