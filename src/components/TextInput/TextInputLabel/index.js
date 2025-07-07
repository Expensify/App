"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var textRef_1 = require("@src/types/utils/textRef");
function TextInputLabel(_a) {
    var _b = _a.for, inputId = _b === void 0 ? '' : _b, label = _a.label, labelTranslateY = _a.labelTranslateY, labelScale = _a.labelScale;
    var styles = (0, useThemeStyles_1.default)();
    var labelRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (!inputId || !labelRef.current || !('setAttribute' in labelRef.current)) {
            return;
        }
        labelRef.current.setAttribute('for', inputId);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return styles.textInputLabelTransformation(labelTranslateY, labelScale); });
    return (<react_native_reanimated_1.default.Text 
    // eslint-disable-next-line react-compiler/react-compiler
    ref={(0, textRef_1.default)(labelRef)} role={CONST_1.default.ROLE.PRESENTATION} style={[styles.textInputLabelContainer, styles.textInputLabel, animatedStyle, styles.pointerEventsNone]}>
            {label}
        </react_native_reanimated_1.default.Text>);
}
TextInputLabel.displayName = 'TextInputLabel';
exports.default = react_1.default.memo(TextInputLabel);
