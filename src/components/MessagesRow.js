"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var DotIndicatorMessage_1 = require("./DotIndicatorMessage");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PressableWithoutFeedback_1 = require("./Pressable/PressableWithoutFeedback");
var Tooltip_1 = require("./Tooltip");
function MessagesRow(_a) {
    var _b = _a.messages, messages = _b === void 0 ? {} : _b, type = _a.type, _c = _a.onClose, onClose = _c === void 0 ? function () { } : _c, containerStyles = _a.containerStyles, _d = _a.canDismiss, canDismiss = _d === void 0 ? true : _d, _e = _a.dismissError, dismissError = _e === void 0 ? function () { } : _e;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    if ((0, EmptyObject_1.isEmptyObject)(messages)) {
        return null;
    }
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, containerStyles]}>
            <DotIndicatorMessage_1.default dismissError={dismissError} style={styles.flex1} messages={messages} type={type}/>
            {canDismiss && (<Tooltip_1.default text={translate('common.close')}>
                    <PressableWithoutFeedback_1.default onPress={onClose} style={[styles.touchableButtonImage]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.close')}>
                        <Icon_1.default fill={theme.icon} src={Expensicons.Close}/>
                    </PressableWithoutFeedback_1.default>
                </Tooltip_1.default>)}
        </react_native_1.View>);
}
MessagesRow.displayName = 'MessagesRow';
exports.default = MessagesRow;
