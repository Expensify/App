"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var LoadingBar_1 = require("@components/LoadingBar");
var Pressable_1 = require("@components/Pressable");
var SearchButton_1 = require("@components/Search/SearchRouter/SearchButton");
var HelpButton_1 = require("@components/SidePanel/HelpComponents/HelpButton");
var Text_1 = require("@components/Text");
var useLoadingBarVisibility_1 = require("@hooks/useLoadingBarVisibility");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SignInButton_1 = require("@pages/home/sidebar/SignInButton");
var Session_1 = require("@userActions/Session");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function TopBar(_a) {
    var breadcrumbLabel = _a.breadcrumbLabel, _b = _a.shouldDisplaySearch, shouldDisplaySearch = _b === void 0 ? true : _b, _c = _a.shouldDisplayHelpButton, shouldDisplayHelpButton = _c === void 0 ? true : _c, cancelSearch = _a.cancelSearch, _d = _a.shouldShowLoadingBar, shouldShowLoadingBar = _d === void 0 ? false : _d, children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (sessionValue) { return sessionValue && { authTokenType: sessionValue.authTokenType }; }, canBeMissing: true })[0];
    var shouldShowLoadingBarForReports = (0, useLoadingBarVisibility_1.default)();
    var isAnonymousUser = (0, Session_1.isAnonymousUser)(session);
    var displaySignIn = isAnonymousUser;
    var displaySearch = !isAnonymousUser && shouldDisplaySearch;
    return (<react_native_1.View style={[styles.w100, styles.zIndex10]}>
            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ml5, styles.mr3, styles.headerBarHeight]} dataSet={{ dragArea: true }}>
                <react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.pr2]}>
                    <react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                        <Text_1.default numberOfLines={1} style={[styles.flexShrink1, styles.topBarLabel]}>
                            {breadcrumbLabel}
                        </Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>
                {children}
                {displaySignIn && <SignInButton_1.default />}
                {!!cancelSearch && (<Pressable_1.PressableWithoutFeedback accessibilityLabel={translate('common.cancel')} style={styles.textBlue} onPress={function () {
                cancelSearch();
            }}>
                        <Text_1.default style={[styles.textBlue]}>{translate('common.cancel')}</Text_1.default>
                    </Pressable_1.PressableWithoutFeedback>)}
                {shouldDisplayHelpButton && <HelpButton_1.default />}
                {displaySearch && <SearchButton_1.default />}
            </react_native_1.View>
            <LoadingBar_1.default shouldShow={shouldShowLoadingBarForReports || shouldShowLoadingBar}/>
        </react_native_1.View>);
}
TopBar.displayName = 'TopBar';
exports.default = TopBar;
