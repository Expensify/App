"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotedActions = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var HeaderUtils_1 = require("@libs/HeaderUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Report_1 = require("@userActions/Report");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var Button_1 = require("./Button");
var Expensicons = require("./Icon/Expensicons");
var PromotedActions = {
    pin: function (report) { return (__assign({ key: CONST_1.default.PROMOTED_ACTIONS.PIN }, (0, HeaderUtils_1.getPinMenuItem)(report))); },
    share: function (report, backTo) { return (__assign({ key: CONST_1.default.PROMOTED_ACTIONS.SHARE }, (0, HeaderUtils_1.getShareMenuItem)(report, backTo))); },
    join: function (report) { return ({
        key: CONST_1.default.PROMOTED_ACTIONS.JOIN,
        icon: Expensicons.ChatBubbles,
        translationKey: 'common.join',
        onSelected: (0, Session_1.callFunctionIfActionIsAllowed)(function () {
            Navigation_1.default.dismissModal();
            (0, Report_1.joinRoom)(report);
        }),
    }); },
    message: function (_a) {
        var reportID = _a.reportID, accountID = _a.accountID, login = _a.login;
        return ({
            key: CONST_1.default.PROMOTED_ACTIONS.MESSAGE,
            icon: Expensicons.CommentBubbles,
            translationKey: 'common.message',
            onSelected: function () {
                if (reportID) {
                    Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID));
                    return;
                }
                // The accountID might be optimistic, so we should use the login if we have it
                if (login) {
                    (0, Report_1.navigateToAndOpenReport)([login], false);
                    return;
                }
                if (accountID) {
                    (0, Report_1.navigateToAndOpenReportWithAccountIDs)([accountID]);
                }
            },
        });
    },
};
exports.PromotedActions = PromotedActions;
function PromotedActionsBar(_a) {
    var promotedActions = _a.promotedActions, containerStyle = _a.containerStyle;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    if (promotedActions.length === 0) {
        return null;
    }
    return (<react_native_1.View style={[styles.flexRow, styles.ph5, styles.mb5, styles.gap2, styles.mw100, styles.w100, styles.justifyContentCenter, containerStyle]}>
            {promotedActions.map(function (_a) {
            var key = _a.key, onSelected = _a.onSelected, translationKey = _a.translationKey, props = __rest(_a, ["key", "onSelected", "translationKey"]);
            return (<react_native_1.View style={[styles.flex1, styles.mw50]} key={key}>
                    <Button_1.default onPress={onSelected} iconFill={theme.icon} text={translate(translationKey)} 
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}/>
                </react_native_1.View>);
        })}
        </react_native_1.View>);
}
PromotedActionsBar.displayName = 'PromotedActionsBar';
exports.default = PromotedActionsBar;
