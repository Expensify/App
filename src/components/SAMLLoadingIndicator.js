"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var Illustrations = require("./Icon/Illustrations");
var Text_1 = require("./Text");
function SAMLLoadingIndicator() {
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={[react_native_1.StyleSheet.absoluteFillObject, styles.deeplinkWrapperContainer]}>
            <react_native_1.View style={styles.deeplinkWrapperMessage}>
                <react_native_1.View style={styles.mb2}>
                    <Icon_1.default width={200} height={164} src={Illustrations.RocketBlue}/>
                </react_native_1.View>
                <Text_1.default style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>{translate('samlSignIn.launching')}</Text_1.default>
                <react_native_1.View style={[styles.mt2, styles.mh2, styles.textAlignCenter]}>
                    <Text_1.default style={[styles.textAlignCenter]} fontSize={variables_1.default.fontSizeNormal}>
                        {translate('samlSignIn.oneMoment')}
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={styles.deeplinkWrapperFooter}>
                <Icon_1.default width={154} height={34} fill={theme.success} src={Expensicons.ExpensifyWordmark}/>
            </react_native_1.View>
        </react_native_1.View>);
}
SAMLLoadingIndicator.displayName = 'SAMLLoadingIndicator';
exports.default = SAMLLoadingIndicator;
