"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Provider_1 = require("@components/DragAndDrop/Provider");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var usePermissions_1 = require("@hooks/usePermissions");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var CONST_1 = require("@src/CONST");
var callOrReturn_1 = require("@src/types/utils/callOrReturn");
function StepScreenDragAndDropWrapper(_a) {
    var testID = _a.testID, headerTitle = _a.headerTitle, onBackButtonPress = _a.onBackButtonPress, onEntryTransitionEnd = _a.onEntryTransitionEnd, children = _a.children, shouldShowWrapper = _a.shouldShowWrapper;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(false), isDraggingOver = _b[0], setIsDraggingOver = _b[1];
    // TODO: remove beta check after the feature is enabled
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    if (!shouldShowWrapper) {
        return (0, callOrReturn_1.default)(children, false);
    }
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnableKeyboardAvoidingView={false} onEntryTransitionEnd={onEntryTransitionEnd} testID={testID} shouldEnableMaxHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} headerGapStyles={isDraggingOver ? [isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) ? styles.dropWrapper : styles.isDraggingOver] : []}>
            {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return (<Provider_1.default setIsDraggingOver={setIsDraggingOver}>
                    <react_native_1.View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton_1.default title={headerTitle} onBackButtonPress={onBackButtonPress}/>
                        {(0, callOrReturn_1.default)(children, isDraggingOver)}
                    </react_native_1.View>
                </Provider_1.default>);
        }}
        </ScreenWrapper_1.default>);
}
StepScreenDragAndDropWrapper.displayName = 'StepScreenDragAndDropWrapper';
exports.default = StepScreenDragAndDropWrapper;
