"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser = require("@libs/Browser");
var DomUtils_1 = require("@libs/DomUtils");
var Visibility_1 = require("@libs/Visibility");
var BaseTextInput_1 = require("./BaseTextInput");
var styleConst = require("./styleConst");
function TextInput(props, ref) {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var textInputRef = (0, react_1.useRef)(null);
    var removeVisibilityListenerRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var _a, _b;
        var removeVisibilityListener = removeVisibilityListenerRef.current;
        if (props.disableKeyboard) {
            (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.setAttribute('inputmode', 'none');
        }
        if (props.name) {
            (_b = textInputRef.current) === null || _b === void 0 ? void 0 : _b.setAttribute('name', props.name);
        }
        removeVisibilityListener = Visibility_1.default.onVisibilityChange(function () {
            if (!Browser.isMobileChrome() || !Visibility_1.default.isVisible() || !textInputRef.current || DomUtils_1.default.getActiveElement() !== textInputRef.current) {
                return;
            }
            textInputRef.current.blur();
            textInputRef.current.focus();
        });
        return function () {
            if (!removeVisibilityListener) {
                return;
            }
            removeVisibilityListener();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var isLabeledMultiline = !!((_a = props.label) === null || _a === void 0 ? void 0 : _a.length) && props.multiline;
    var labelAnimationStyle = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '--active-label-translate-y': "".concat(styleConst.ACTIVE_LABEL_TRANSLATE_Y, "px"),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '--active-label-scale': "".concat(styleConst.ACTIVE_LABEL_SCALE),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '--label-transition-duration': "".concat(styleConst.LABEL_ANIMATION_DURATION, "ms"),
    };
    return (<BaseTextInput_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={function (element) {
            textInputRef.current = element;
            if (!ref) {
                return;
            }
            if (typeof ref === 'function') {
                ref(element);
                return;
            }
            // eslint-disable-next-line no-param-reassign
            ref.current = element;
        }} inputStyle={[styles.baseTextInput, styles.textInputDesktop, isLabeledMultiline ? styles.textInputMultiline : {}, props.inputStyle]} textInputContainerStyles={[labelAnimationStyle, props.textInputContainerStyles]}/>);
}
TextInput.displayName = 'TextInput';
exports.default = react_1.default.forwardRef(TextInput);
