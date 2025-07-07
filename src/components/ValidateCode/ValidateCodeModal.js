"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ExpensifyWordmark_1 = require("@components/ExpensifyWordmark");
var Icon_1 = require("@components/Icon");
var Illustrations_1 = require("@components/Icon/Illustrations");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session_1 = require("@libs/actions/Session");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var variables_1 = require("@styles/variables");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ValidateCodeModal(_a) {
    var code = _a.code, accountID = _a.accountID;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION)[0];
    var signInHere = (0, react_1.useCallback)(function () { return (0, Session_1.signInWithValidateCode)(accountID, code); }, [accountID, code]);
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<FullPageNotFoundView_1.default testID="validate-code-not-found" shouldShow={!(0, ValidationUtils_1.isValidValidateCode)(code)} shouldShowBackButton={shouldUseNarrowLayout} onLinkPress={function () {
            Navigation_1.default.goBack();
        }}>
            <react_native_1.View style={styles.deeplinkWrapperContainer} testID="validate-code">
                <react_native_1.View style={styles.deeplinkWrapperMessage}>
                    <react_native_1.View style={styles.mb2}>
                        <Icon_1.default width={variables_1.default.modalTopIconWidth} height={variables_1.default.modalTopIconHeight} src={Illustrations_1.MagicCode}/>
                    </react_native_1.View>
                    <Text_1.default style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>{translate('validateCodeModal.title')}</Text_1.default>
                    <react_native_1.View style={[styles.mt2, styles.mb2]}>
                        <Text_1.default style={styles.textAlignCenter}>
                            {translate('validateCodeModal.description')}
                            {!(session === null || session === void 0 ? void 0 : session.authToken) && (<>
                                    {translate('validateCodeModal.or')} <TextLink_1.default onPress={signInHere}>{translate('validateCodeModal.signInHere')}</TextLink_1.default>
                                </>)}
                            .
                        </Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={styles.mt6}>
                        <Text_1.default style={styles.validateCodeDigits}>{code}</Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.mt6]}>
                        <Text_1.default style={styles.textAlignCenter}>{translate('validateCodeModal.doNotShare')}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>
                <react_native_1.View style={styles.deeplinkWrapperFooter}>
                    <Icon_1.default width={variables_1.default.modalWordmarkWidth} height={variables_1.default.modalWordmarkHeight} fill={theme.success} src={ExpensifyWordmark_1.default}/>
                </react_native_1.View>
            </react_native_1.View>
        </FullPageNotFoundView_1.default>);
}
ValidateCodeModal.displayName = 'ValidateCodeModal';
exports.default = ValidateCodeModal;
