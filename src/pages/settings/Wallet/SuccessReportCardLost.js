"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var Illustrations_1 = require("@components/Icon/Illustrations");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function SuccessReportCardLost(_a) {
    var cardID = _a.cardID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<ConfirmationPage_1.default heading={translate('reportCardLostOrDamaged.successTitle')} description={translate('reportCardLostOrDamaged.successDescription')} illustration={Illustrations_1.CardReplacementSuccess} shouldShowButton onButtonPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
        }} buttonText={translate('common.buttonConfirm')} containerStyle={styles.h100} illustrationStyle={[styles.w100, StyleUtils.getSuccessReportCardLostIllustrationStyle()]} innerContainerStyle={styles.ph0} descriptionStyle={[styles.ph4, styles.textSupporting]}/>);
}
SuccessReportCardLost.displayName = 'SuccessReportCardLost';
exports.default = SuccessReportCardLost;
