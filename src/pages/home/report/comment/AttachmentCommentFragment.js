"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var RenderCommentHTML_1 = require("./RenderCommentHTML");
function AttachmentCommentFragment(_a) {
    var addExtraMargin = _a.addExtraMargin, html = _a.html, source = _a.source, styleAsDeleted = _a.styleAsDeleted, reportActionID = _a.reportActionID;
    var styles = (0, useThemeStyles_1.default)();
    var htmlContent = (0, ReportActionsUtils_1.getHtmlWithAttachmentID)(styleAsDeleted ? "<del>".concat(html, "</del>") : html, reportActionID);
    return (<react_native_1.View style={addExtraMargin ? styles.mt2 : {}}>
            <RenderCommentHTML_1.default containsOnlyEmojis={false} source={source} html={htmlContent}/>
        </react_native_1.View>);
}
AttachmentCommentFragment.displayName = 'AttachmentCommentFragment';
exports.default = AttachmentCommentFragment;
