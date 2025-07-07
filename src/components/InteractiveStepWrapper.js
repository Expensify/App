"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var HeaderWithBackButton_1 = require("./HeaderWithBackButton");
var InteractiveStepSubHeader_1 = require("./InteractiveStepSubHeader");
var ScreenWrapper_1 = require("./ScreenWrapper");
function InteractiveStepWrapper(_a, ref) {
    var children = _a.children, wrapperID = _a.wrapperID, handleBackButtonPress = _a.handleBackButtonPress, headerTitle = _a.headerTitle, headerSubtitle = _a.headerSubtitle, startStepIndex = _a.startStepIndex, stepNames = _a.stepNames, shouldEnableMaxHeight = _a.shouldEnableMaxHeight, shouldShowOfflineIndicator = _a.shouldShowOfflineIndicator, _b = _a.shouldEnablePickerAvoiding, shouldEnablePickerAvoiding = _b === void 0 ? false : _b, offlineIndicatorStyle = _a.offlineIndicatorStyle, shouldKeyboardOffsetBottomSafeAreaPadding = _a.shouldKeyboardOffsetBottomSafeAreaPadding, enableEdgeToEdgeBottomSafeAreaPadding = _a.enableEdgeToEdgeBottomSafeAreaPadding;
    var styles = (0, useThemeStyles_1.default)();
    return (<ScreenWrapper_1.default ref={ref} testID={wrapperID} includeSafeAreaPaddingBottom enableEdgeToEdgeBottomSafeAreaPadding={enableEdgeToEdgeBottomSafeAreaPadding} shouldEnablePickerAvoiding={shouldEnablePickerAvoiding} shouldEnableMaxHeight={shouldEnableMaxHeight} shouldShowOfflineIndicator={shouldShowOfflineIndicator} offlineIndicatorStyle={offlineIndicatorStyle} shouldKeyboardOffsetBottomSafeAreaPadding={shouldKeyboardOffsetBottomSafeAreaPadding}>
            <HeaderWithBackButton_1.default title={headerTitle} subtitle={headerSubtitle} onBackButtonPress={handleBackButtonPress}/>
            {!!stepNames && (<react_native_1.View style={[styles.ph5, styles.mb5, styles.mt3, { height: CONST_1.default.BANK_ACCOUNT.STEPS_HEADER_HEIGHT }]}>
                    <InteractiveStepSubHeader_1.default startStepIndex={startStepIndex} stepNames={stepNames}/>
                </react_native_1.View>)}
            {children}
        </ScreenWrapper_1.default>);
}
InteractiveStepWrapper.displayName = 'InteractiveStepWrapper';
exports.default = (0, react_1.forwardRef)(InteractiveStepWrapper);
