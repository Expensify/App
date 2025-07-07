"use strict";
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
var react_1 = require("react");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage(_a) {
    var _b = _a.onBackButtonPress, onBackButtonPress = _b === void 0 ? function () { return Navigation_1.default.goBack(); } : _b, isReportRelatedPage = _a.isReportRelatedPage, shouldShowOfflineIndicator = _a.shouldShowOfflineIndicator, fullPageNotFoundViewProps = __rest(_a, ["onBackButtonPress", "isReportRelatedPage", "shouldShowOfflineIndicator"]);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to go back to the not found page on large screens and to the home page on small screen
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var topmostReportId = Navigation_1.default.getTopmostReportId();
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(topmostReportId))[0];
    return (<ScreenWrapper_1.default testID={NotFoundPage.displayName} shouldShowOfflineIndicator={shouldShowOfflineIndicator}>
            <FullPageNotFoundView_1.default shouldShow onBackButtonPress={function () {
            var _a;
            if (!isReportRelatedPage || !isSmallScreenWidth) {
                onBackButtonPress();
                return;
            }
            // detect the report is invalid
            if (topmostReportId && (!report || ((_a = report.errorFields) === null || _a === void 0 ? void 0 : _a.notFound))) {
                Navigation_1.default.dismissModal();
                return;
            }
            onBackButtonPress();
        }} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...fullPageNotFoundViewProps}/>
        </ScreenWrapper_1.default>);
}
NotFoundPage.displayName = 'NotFoundPage';
exports.default = NotFoundPage;
