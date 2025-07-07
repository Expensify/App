"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var CONST_1 = require("@src/CONST");
var HeaderWithBackButton_1 = require("./HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("./MenuItemWithTopDescription");
var Modal_1 = require("./Modal");
var ScreenWrapper_1 = require("./ScreenWrapper");
var TimePicker_1 = require("./TimePicker/TimePicker");
function TimeModalPicker(_a, ref) {
    var value = _a.value, errorText = _a.errorText, label = _a.label, _b = _a.onInputChange, onInputChange = _b === void 0 ? function () { } : _b;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useState)(false), isPickerVisible = _c[0], setIsPickerVisible = _c[1];
    var currentTime = value ? DateUtils_1.default.extractTime12Hour(value) : undefined;
    var hidePickerModal = function () {
        setIsPickerVisible(false);
    };
    var updateInput = function (time) {
        var newTime = DateUtils_1.default.combineDateAndTime(time, value !== null && value !== void 0 ? value : '');
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(newTime);
        hidePickerModal();
    };
    return (<>
            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={currentTime} description={label} onPress={function () { return setIsPickerVisible(true); }} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText} ref={ref}/>
            <Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isPickerVisible} onClose={hidePickerModal} onModalHide={hidePickerModal} hideModalContentWhileAnimating useNativeDriver enableEdgeToEdgeBottomSafeAreaPadding>
                <ScreenWrapper_1.default style={styles.pb0} includePaddingTop={false} includeSafeAreaPaddingBottom testID={TimeModalPicker.displayName}>
                    <HeaderWithBackButton_1.default title={label} onBackButtonPress={hidePickerModal}/>
                    <react_native_1.View style={styles.flex1}>
                        <TimePicker_1.default defaultValue={value} onSubmit={updateInput} shouldValidateFutureTime={false}/>
                    </react_native_1.View>
                </ScreenWrapper_1.default>
            </Modal_1.default>
        </>);
}
TimeModalPicker.displayName = 'TimeModalPicker';
exports.default = (0, react_1.forwardRef)(TimeModalPicker);
