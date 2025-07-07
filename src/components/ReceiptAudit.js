"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptAuditMessages = ReceiptAuditMessages;
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var RenderHTML_1 = require("./RenderHTML");
var Text_1 = require("./Text");
function ReceiptAudit(_a) {
    var notes = _a.notes, shouldShowAuditResult = _a.shouldShowAuditResult;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var auditText = '';
    if (notes.length > 0 && shouldShowAuditResult) {
        auditText = translate('iou.receiptIssuesFound', { count: notes.length });
    }
    else if (!notes.length && shouldShowAuditResult) {
        auditText = translate('common.verified');
    }
    return (<react_native_1.View style={[styles.ph5, styles.mbn1]}>
            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                <Text_1.default style={[styles.textLabelSupporting]}>{translate('common.receipt')}</Text_1.default>
                {!!auditText && (<>
                        <Text_1.default style={[styles.textLabelSupporting]}>{" \u2022 ".concat(auditText)}</Text_1.default>
                        <Icon_1.default width={12} height={12} src={notes.length ? Expensicons.DotIndicator : Expensicons.Checkmark} fill={notes.length ? theme.danger : theme.success} additionalStyles={styles.ml1}/>
                    </>)}
            </react_native_1.View>
        </react_native_1.View>);
}
function ReceiptAuditMessages(_a) {
    var _b = _a.notes, notes = _b === void 0 ? [] : _b;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.mtn1, styles.mb2, styles.ph5, styles.gap1]}>
            {notes.length > 0 &&
            notes.map(function (message) { return (<react_native_1.View key={message}>
                        <RenderHTML_1.default html={"<rbr>".concat(message, "</rbr>")}/>
                    </react_native_1.View>); })}
        </react_native_1.View>);
}
exports.default = ReceiptAudit;
