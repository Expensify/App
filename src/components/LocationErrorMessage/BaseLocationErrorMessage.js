"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var colors_1 = require("@styles/theme/colors");
var CONST_1 = require("@src/CONST");
function BaseLocationErrorMessage(_a) {
    var onClose = _a.onClose, onAllowLocationLinkPress = _a.onAllowLocationLinkPress, locationErrorCode = _a.locationErrorCode;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    if (!locationErrorCode) {
        return null;
    }
    var isPermissionDenied = locationErrorCode === 1;
    return (<react_native_1.View style={[styles.dotIndicatorMessage, styles.mt4]}>
            <react_native_1.View style={styles.offlineFeedback.errorDot}>
                <Icon_1.default src={Expensicons.DotIndicator} fill={colors_1.default.red}/>
            </react_native_1.View>
            <react_native_1.View style={styles.offlineFeedback.textContainer}>
                {isPermissionDenied ? (<Text_1.default>
                        <Text_1.default style={[StyleUtils.getDotIndicatorTextStyles()]}>{"".concat(translate('location.permissionDenied'), " ").concat(translate('location.please'))}</Text_1.default>
                        <TextLink_1.default onPress={onAllowLocationLinkPress} style={styles.locationErrorLinkText}>
                            {" ".concat(translate('location.allowPermission'), " ")}
                        </TextLink_1.default>
                        <Text_1.default style={[StyleUtils.getDotIndicatorTextStyles()]}>{translate('location.tryAgain')}</Text_1.default>
                    </Text_1.default>) : (<Text_1.default style={styles.offlineFeedback.text}>{translate('location.notFound')}</Text_1.default>)}
            </react_native_1.View>
            <react_native_1.View>
                <Tooltip_1.default text={translate('common.close')}>
                    <PressableWithoutFeedback_1.default onPress={onClose} onMouseDown={function (e) { return e.preventDefault(); }} style={[styles.touchableButtonImage]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.close')}>
                        <Icon_1.default fill={theme.icon} src={Expensicons.Close}/>
                    </PressableWithoutFeedback_1.default>
                </Tooltip_1.default>
            </react_native_1.View>
        </react_native_1.View>);
}
BaseLocationErrorMessage.displayName = 'BaseLocationErrorMessage';
exports.default = BaseLocationErrorMessage;
