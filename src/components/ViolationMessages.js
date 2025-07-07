"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ViolationMessages;
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ViolationsUtils_1 = require("@libs/Violations/ViolationsUtils");
var Text_1 = require("./Text");
function ViolationMessages(_a) {
    var violations = _a.violations, isLast = _a.isLast, containerStyle = _a.containerStyle, textStyle = _a.textStyle, canEdit = _a.canEdit;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var violationMessages = (0, react_1.useMemo)(function () { return violations.map(function (violation) { return [violation.name, ViolationsUtils_1.default.getViolationTranslation(violation, translate, canEdit)]; }); }, [canEdit, translate, violations]);
    return (<react_native_1.View style={[styles.mtn1, isLast ? styles.mb2 : styles.mb1, containerStyle, styles.gap1]}>
            {violationMessages.map(function (_a) {
            var name = _a[0], message = _a[1];
            return (<Text_1.default key={"violationMessages.".concat(name)} style={[styles.ph5, styles.textLabelError, textStyle]}>
                    {message}
                </Text_1.default>);
        })}
        </react_native_1.View>);
}
