"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var RenderHTML_1 = require("@components/RenderHTML");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ViolationsUtils_1 = require("@libs/Violations/ViolationsUtils");
var variables_1 = require("@styles/variables");
/** This component is lighter version of TransactionItemRowRBRWithOnyx that doesn't use onyx but uses transactionViolations data computed from search,
 *  thus it doesn't include violations taken from reportActions like its counterpart does. */
function TransactionItemRowRBR(_a) {
    var transactionViolations = _a.transactionViolations, containerStyles = _a.containerStyles, missingFieldError = _a.missingFieldError;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    if (!transactionViolations && !missingFieldError) {
        return null;
    }
    var RBRMessages = __spreadArray(__spreadArray([], (missingFieldError ? ["".concat(missingFieldError, ".")] : []), true), (transactionViolations
        ? transactionViolations.map(function (violation) {
            var message = ViolationsUtils_1.default.getViolationTranslation(violation, translate);
            return message.endsWith('.') ? message : "".concat(message, ".");
        })
        : []), true).join(' ');
    return (RBRMessages.length > 0 && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, containerStyles]} testID="TransactionItemRowRBR">
                <Icon_1.default src={Expensicons_1.DotIndicator} fill={theme.danger} height={variables_1.default.iconSizeExtraSmall} width={variables_1.default.iconSizeExtraSmall}/>
                <react_native_1.View style={[styles.pre, styles.flexShrink1, { color: theme.danger }]}>
                    <RenderHTML_1.default html={"<rbr shouldShowEllipsis=\"1\" issmall >".concat(RBRMessages, "</rbr>")}/>
                </react_native_1.View>
            </react_native_1.View>));
}
TransactionItemRowRBR.displayName = 'TransactionItemRowRBR';
exports.default = TransactionItemRowRBR;
