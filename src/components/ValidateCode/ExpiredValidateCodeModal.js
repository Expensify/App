"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var Session = require("@userActions/Session");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ExpiredValidateCodeModal() {
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var credentials = (0, useOnyx_1.default)(ONYXKEYS_1.default.CREDENTIALS)[0];
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={styles.deeplinkWrapperContainer}>
            <react_native_1.View style={styles.deeplinkWrapperMessage}>
                <react_native_1.View style={styles.mb2}>
                    <Icon_1.default width={variables_1.default.modalTopIconWidth} height={variables_1.default.modalTopIconHeight} src={Illustrations.ToddBehindCloud}/>
                </react_native_1.View>
                <Text_1.default style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>{translate('validateCodeModal.expiredCodeTitle')}</Text_1.default>
                <react_native_1.View style={[styles.mt2, styles.mb2]}>
                    {(credentials === null || credentials === void 0 ? void 0 : credentials.login) ? (<Text_1.default style={styles.textAlignCenter}>
                            {translate('validateCodeModal.expiredCodeDescription')}
                            {translate('validateCodeModal.or')}{' '}
                            <TextLink_1.default onPress={function () {
                var _a;
                Session.beginSignIn((_a = credentials === null || credentials === void 0 ? void 0 : credentials.login) !== null && _a !== void 0 ? _a : '');
                Navigation_1.default.setNavigationActionToMicrotaskQueue(Navigation_1.default.goBack);
            }}>
                                {translate('validateCodeModal.requestOneHere')}
                            </TextLink_1.default>
                        </Text_1.default>) : (<Text_1.default style={styles.textAlignCenter}>{translate('validateCodeModal.expiredCodeDescription')}.</Text_1.default>)}
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={styles.deeplinkWrapperFooter}>
                <Icon_1.default width={variables_1.default.modalWordmarkWidth} height={variables_1.default.modalWordmarkHeight} fill={theme.success} src={Expensicons.ExpensifyWordmark}/>
            </react_native_1.View>
        </react_native_1.View>);
}
ExpiredValidateCodeModal.displayName = 'ExpiredValidateCodeModal';
exports.default = ExpiredValidateCodeModal;
