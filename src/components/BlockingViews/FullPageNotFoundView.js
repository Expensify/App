"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var StatsCounter_1 = require("@libs/actions/StatsCounter");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var BlockingView_1 = require("./BlockingView");
var ForceFullScreenView_1 = require("./ForceFullScreenView");
// eslint-disable-next-line rulesdir/no-negated-variables
function FullPageNotFoundView(_a) {
    var testID = _a.testID, _b = _a.children, children = _b === void 0 ? null : _b, _c = _a.shouldShow, shouldShow = _c === void 0 ? false : _c, _d = _a.titleKey, titleKey = _d === void 0 ? 'notFound.notHere' : _d, _e = _a.subtitleKey, subtitleKey = _e === void 0 ? 'notFound.pageNotFound' : _e, _f = _a.linkKey, linkKey = _f === void 0 ? 'notFound.goBackHome' : _f, _g = _a.onBackButtonPress, onBackButtonPress = _g === void 0 ? function () { return Navigation_1.default.goBack(); } : _g, _h = _a.shouldShowLink, shouldShowLink = _h === void 0 ? true : _h, _j = _a.shouldShowBackButton, shouldShowBackButton = _j === void 0 ? true : _j, _k = _a.onLinkPress, onLinkPress = _k === void 0 ? function () { return Navigation_1.default.goBackToHome(); } : _k, _l = _a.shouldForceFullScreen, shouldForceFullScreen = _l === void 0 ? false : _l, subtitleStyle = _a.subtitleStyle, shouldDisplaySearchRouter = _a.shouldDisplaySearchRouter, _m = _a.addBottomSafeAreaPadding, addBottomSafeAreaPadding = _m === void 0 ? true : _m, _o = _a.addOfflineIndicatorBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding = _o === void 0 ? addBottomSafeAreaPadding : _o;
    var styles = (0, useThemeStyles_1.default)();
    var _p = (0, useResponsiveLayout_1.default)(), isMediumScreenWidth = _p.isMediumScreenWidth, isLargeScreenWidth = _p.isLargeScreenWidth;
    var translate = (0, useLocalize_1.default)().translate;
    if (shouldShow) {
        (0, StatsCounter_1.default)('FullPageNotFoundView');
        return (<ForceFullScreenView_1.default shouldForceFullScreen={shouldForceFullScreen}>
                <HeaderWithBackButton_1.default onBackButtonPress={onBackButtonPress} shouldShowBackButton={shouldShowBackButton} shouldDisplaySearchRouter={shouldDisplaySearchRouter && (isMediumScreenWidth || isLargeScreenWidth)}/>
                <react_native_1.View style={[styles.flex1, styles.blockingViewContainer]} testID={testID}>
                    <BlockingView_1.default icon={Illustrations.ToddBehindCloud} iconWidth={variables_1.default.modalTopIconWidth} iconHeight={variables_1.default.modalTopIconHeight} title={translate(titleKey)} subtitle={subtitleKey && translate(subtitleKey)} linkKey={linkKey} shouldShowLink={shouldShowLink} onLinkPress={onLinkPress} subtitleStyle={subtitleStyle} addBottomSafeAreaPadding={addBottomSafeAreaPadding} addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding} testID={FullPageNotFoundView.displayName}/>
                </react_native_1.View>
            </ForceFullScreenView_1.default>);
    }
    return children;
}
FullPageNotFoundView.displayName = 'FullPageNotFoundView';
exports.default = FullPageNotFoundView;
