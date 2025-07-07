"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var callOrReturn_1 = require("@src/types/utils/callOrReturn");
function StepScreenWrapper(_a) {
    var testID = _a.testID, headerTitle = _a.headerTitle, onBackButtonPress = _a.onBackButtonPress, onEntryTransitionEnd = _a.onEntryTransitionEnd, children = _a.children, shouldShowWrapper = _a.shouldShowWrapper, shouldShowNotFoundPage = _a.shouldShowNotFoundPage, includeSafeAreaPaddingBottom = _a.includeSafeAreaPaddingBottom, _b = _a.shouldShowOfflineIndicator, shouldShowOfflineIndicator = _b === void 0 ? true : _b, _c = _a.shouldEnableKeyboardAvoidingView, shouldEnableKeyboardAvoidingView = _c === void 0 ? true : _c;
    var styles = (0, useThemeStyles_1.default)();
    if (!shouldShowWrapper) {
        return <FullPageNotFoundView_1.default shouldShow={shouldShowNotFoundPage}>{children}</FullPageNotFoundView_1.default>;
    }
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={includeSafeAreaPaddingBottom} onEntryTransitionEnd={onEntryTransitionEnd} testID={testID} shouldEnableMaxHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} shouldShowOfflineIndicator={shouldShowOfflineIndicator} shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}>
            {function (_a) {
            var insets = _a.insets, safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle, didScreenTransitionEnd = _a.didScreenTransitionEnd;
            return (<FullPageNotFoundView_1.default shouldShow={shouldShowNotFoundPage}>
                    <react_native_1.View style={[styles.flex1]}>
                        <HeaderWithBackButton_1.default title={headerTitle} onBackButtonPress={onBackButtonPress}/>
                        {
                // If props.children is a function, call it to provide the insets to the children
                (0, callOrReturn_1.default)(children, { insets: insets, safeAreaPaddingBottomStyle: safeAreaPaddingBottomStyle, didScreenTransitionEnd: didScreenTransitionEnd })}
                    </react_native_1.View>
                </FullPageNotFoundView_1.default>);
        }}
        </ScreenWrapper_1.default>);
}
exports.default = StepScreenWrapper;
