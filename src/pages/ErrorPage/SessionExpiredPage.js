"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_hybrid_app_1 = require("@expensify/react-native-hybrid-app");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Session_1 = require("@userActions/Session");
var CONFIG_1 = require("@src/CONFIG");
function SessionExpiredPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    return (<react_native_1.View style={styles.deeplinkWrapperContainer}>
            <react_native_1.View style={styles.deeplinkWrapperMessage}>
                <react_native_1.View style={styles.mb2}>
                    <Icon_1.default width={200} height={164} src={Illustrations.RocketBlue}/>
                </react_native_1.View>
                <Text_1.default style={[styles.textHeadline, styles.textXXLarge]}>{translate('deeplinkWrapper.launching')}</Text_1.default>
                <react_native_1.View style={styles.mt2}>
                    <Text_1.default style={styles.textAlignCenter}>
                        {translate('deeplinkWrapper.expired')}{' '}
                        <TextLink_1.default onPress={function () {
            if (!CONFIG_1.default.IS_HYBRID_APP) {
                (0, Session_1.clearSignInData)();
                Navigation_1.default.goBack();
                return;
            }
            react_native_hybrid_app_1.default.closeReactNativeApp({ shouldSignOut: true, shouldSetNVP: false });
        }}>
                            {translate('deeplinkWrapper.signIn')}
                        </TextLink_1.default>
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={styles.deeplinkWrapperFooter}>
                <Icon_1.default width={154} height={34} fill={theme.success} src={Expensicons.ExpensifyWordmark}/>
            </react_native_1.View>
        </react_native_1.View>);
}
SessionExpiredPage.displayName = 'SessionExpiredPage';
exports.default = SessionExpiredPage;
