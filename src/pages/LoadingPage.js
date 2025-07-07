"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function LoadingPage(_a) {
    var onBackButtonPress = _a.onBackButtonPress, title = _a.title;
    var styles = (0, useThemeStyles_1.default)();
    return (<ScreenWrapper_1.default testID={LoadingPage.displayName}>
            <HeaderWithBackButton_1.default onBackButtonPress={onBackButtonPress} shouldShowBackButton title={title}/>
            <FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>
        </ScreenWrapper_1.default>);
}
LoadingPage.displayName = 'LoadingPage';
exports.default = LoadingPage;
