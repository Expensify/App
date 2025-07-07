"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
function PublicDomainErrorPage(_a) {
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<ScreenWrapper_1.default shouldEnableMaxHeight testID={PublicDomainErrorPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('travel.header')} onBackButtonPress={function () { return Navigation_1.default.goBack(route.params.backTo); }}/>
            <react_native_1.View style={[styles.flex1]}>
                <react_native_1.View style={[styles.mt3, styles.mr5, styles.ml5]}>
                    <Text_1.default style={styles.headerAnonymousFooter}>{"".concat(translate('travel.publicDomainError.title'))}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={[styles.mt3, styles.mr5, styles.mb5, styles.ml5]}>
                    <Text_1.default>{translate('travel.publicDomainError.message')}</Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
            <FixedFooter_1.default>
                <Button_1.default success large style={[styles.w100]} onPress={function () { return Navigation_1.default.closeRHPFlow(); }} text={translate('common.buttonConfirm')}/>
            </FixedFooter_1.default>
        </ScreenWrapper_1.default>);
}
PublicDomainErrorPage.displayName = 'PublicDomainErrorPage';
exports.default = PublicDomainErrorPage;
