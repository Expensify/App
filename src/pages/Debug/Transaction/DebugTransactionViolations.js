"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Button_1 = require("@components/Button");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useTransactionViolations_1 = require("@hooks/useTransactionViolations");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function DebugTransactionViolations(_a) {
    var transactionID = _a.transactionID;
    var transactionViolations = (0, useTransactionViolations_1.default)(transactionID);
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var renderItem = function (item, index) { return (<PressableWithFeedback_1.default accessibilityLabel={translate('common.details')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.DEBUG_TRANSACTION_VIOLATION.getRoute(transactionID, String(index))); }} style={function (_a) {
        var pressed = _a.pressed;
        return [styles.flexRow, styles.justifyContentBetween, pressed && styles.hoveredComponentBG, styles.p4];
    }} hoverStyle={styles.hoveredComponentBG} key={index}>
            <Text_1.default>{item.type}</Text_1.default>
            <Text_1.default>{item.name}</Text_1.default>
        </PressableWithFeedback_1.default>); };
    return (<ScrollView_1.default style={styles.mv5}>
            <Button_1.default success large text={translate('common.create')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.DEBUG_TRANSACTION_VIOLATION_CREATE.getRoute(transactionID)); }} style={[styles.pb5, styles.ph3]}/>
            {/* This list was previously rendered as a FlatList, but it turned out that it caused the component to flash in some cases,
        so it was replaced by this solution. */}
            {transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations.map(function (item, index) { return renderItem(item, index); })}
        </ScrollView_1.default>);
}
DebugTransactionViolations.displayName = 'DebugTransactionViolations';
exports.default = DebugTransactionViolations;
