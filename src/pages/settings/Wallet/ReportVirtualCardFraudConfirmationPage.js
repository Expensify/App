"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var ImageSVG_1 = require("@components/ImageSVG");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function ReportVirtualCardFraudConfirmationPage(_a) {
    var _b = _a.route.params.cardID, cardID = _b === void 0 ? '' : _b;
    var themeStyles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var close = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
    }, [cardID]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom includePaddingTop shouldEnableMaxHeight testID={ReportVirtualCardFraudConfirmationPage.displayName} offlineIndicatorStyle={themeStyles.mtAuto}>
            <HeaderWithBackButton_1.default title={translate('reportFraudConfirmationPage.title')} onBackButtonPress={close}/>

            <react_native_1.View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb5, themeStyles.flex1]}>
                <react_native_1.View style={[themeStyles.justifyContentCenter, themeStyles.flex1]}>
                    <ImageSVG_1.default contentFit="contain" src={Expensicons.MagnifyingGlassSpyMouthClosed} style={themeStyles.alignSelfCenter} width={184} height={290}/>

                    <Text_1.default style={[themeStyles.textHeadlineH1, themeStyles.alignSelfCenter, themeStyles.mt5]}>{translate('reportFraudConfirmationPage.title')}</Text_1.default>
                    <Text_1.default style={[themeStyles.textSupporting, themeStyles.alignSelfCenter, themeStyles.mt2, themeStyles.textAlignCenter]}>
                        {translate('reportFraudConfirmationPage.description')}
                    </Text_1.default>
                </react_native_1.View>

                <Button_1.default text={translate('reportFraudConfirmationPage.buttonText')} onPress={close} style={themeStyles.justifyContentEnd} success large/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
ReportVirtualCardFraudConfirmationPage.displayName = 'ReportVirtualCardFraudConfirmationPage';
exports.default = ReportVirtualCardFraudConfirmationPage;
