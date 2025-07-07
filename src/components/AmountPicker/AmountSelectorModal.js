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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AmountForm_1 = require("@components/AmountForm");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function AmountSelectorModal(_a) {
    var value = _a.value, _b = _a.description, description = _b === void 0 ? '' : _b, onValueSelected = _a.onValueSelected, isVisible = _a.isVisible, onClose = _a.onClose, rest = __rest(_a, ["value", "description", "onValueSelected", "isVisible", "onClose"]);
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useState)(value), currentValue = _c[0], setValue = _c[1];
    var inputRef = (0, react_1.useRef)(null);
    var focusTimeoutRef = (0, react_1.useRef)(null);
    var inputCallbackRef = function (ref) {
        inputRef.current = ref;
    };
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        focusTimeoutRef.current = setTimeout(function () {
            if (inputRef.current && isVisible) {
                inputRef.current.focus();
            }
            return function () {
                if (!focusTimeoutRef.current || !isVisible) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, CONST_1.default.ANIMATED_TRANSITION);
    }, [isVisible, inputRef]));
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={onClose} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding includePaddingTop={false} testID={AmountSelectorModal.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={description} onBackButtonPress={onClose}/>
                <ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.mb5]} addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.flex1}>
                        <AmountForm_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} value={currentValue} onInputChange={setValue} ref={function (ref) { return inputCallbackRef(ref); }}/>
                        <Button_1.default success large pressOnEnter text={translate('common.save')} onPress={function () { return onValueSelected === null || onValueSelected === void 0 ? void 0 : onValueSelected(currentValue !== null && currentValue !== void 0 ? currentValue : ''); }} style={styles.mh5}/>
                    </react_native_1.View>
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
AmountSelectorModal.displayName = 'AmountSelectorModal';
exports.default = AmountSelectorModal;
