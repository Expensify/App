"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Button_1 = require("./Button");
var Header_1 = require("./Header");
var Modal_1 = require("./Modal");
var Text_1 = require("./Text");
function DecisionModal(_a) {
    var title = _a.title, _b = _a.prompt, prompt = _b === void 0 ? '' : _b, firstOptionText = _a.firstOptionText, secondOptionText = _a.secondOptionText, onFirstOptionSubmit = _a.onFirstOptionSubmit, onSecondOptionSubmit = _a.onSecondOptionSubmit, isSmallScreenWidth = _a.isSmallScreenWidth, onClose = _a.onClose, isVisible = _a.isVisible;
    var styles = (0, useThemeStyles_1.default)();
    return (<Modal_1.default onClose={onClose} isVisible={isVisible} type={isSmallScreenWidth ? CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST_1.default.MODAL.MODAL_TYPE.CONFIRM} innerContainerStyle={styles.pv0}>
            <react_native_1.View style={[styles.m5]}>
                <react_native_1.View>
                    <react_native_1.View style={[styles.flexRow, styles.mb5]}>
                        <Header_1.default title={title} containerStyles={[styles.alignItemsCenter]}/>
                    </react_native_1.View>
                    <Text_1.default>{prompt}</Text_1.default>
                </react_native_1.View>
                {!!firstOptionText && (<Button_1.default success style={[styles.mt5]} onPress={onFirstOptionSubmit} pressOnEnter text={firstOptionText} large/>)}
                <Button_1.default style={[firstOptionText ? styles.mt3 : styles.mt5, styles.noSelect]} onPress={onSecondOptionSubmit} text={secondOptionText} large/>
            </react_native_1.View>
        </Modal_1.default>);
}
DecisionModal.displayName = 'DecisionModal';
exports.default = DecisionModal;
