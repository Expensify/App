"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Illustrations = require("@components/Icon/Illustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var BlockingView_1 = require("./BlockingView");
var ForceFullScreenView_1 = require("./ForceFullScreenView");
// eslint-disable-next-line rulesdir/no-negated-variables
function FullPageErrorView(_a) {
    var testID = _a.testID, _b = _a.children, children = _b === void 0 ? null : _b, _c = _a.shouldShow, shouldShow = _c === void 0 ? false : _c, _d = _a.title, title = _d === void 0 ? '' : _d, _e = _a.subtitle, subtitle = _e === void 0 ? '' : _e, _f = _a.shouldForceFullScreen, shouldForceFullScreen = _f === void 0 ? false : _f, subtitleStyle = _a.subtitleStyle;
    var styles = (0, useThemeStyles_1.default)();
    if (shouldShow) {
        return (<ForceFullScreenView_1.default shouldForceFullScreen={shouldForceFullScreen}>
                <react_native_1.View style={[styles.flex1, styles.blockingErrorViewContainer]} testID={testID}>
                    <BlockingView_1.default icon={Illustrations.BrokenMagnifyingGlass} iconWidth={variables_1.default.errorPageIconWidth} iconHeight={variables_1.default.errorPageIconHeight} title={title} subtitle={subtitle} subtitleStyle={subtitleStyle}/>
                </react_native_1.View>
            </ForceFullScreenView_1.default>);
    }
    return children;
}
FullPageErrorView.displayName = 'FullPageErrorView';
exports.default = FullPageErrorView;
