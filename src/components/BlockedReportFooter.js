"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Banner_1 = require("./Banner");
function BlockedReportFooter() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var text = translate('youHaveBeenBanned');
    return (<Banner_1.default containerStyles={[styles.chatFooterBanner]} text={text} shouldShowIcon shouldRenderHTML/>);
}
BlockedReportFooter.displayName = 'ArchivedReportFooter';
exports.default = BlockedReportFooter;
