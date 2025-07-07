"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function Confirmation(_a) {
    var onNext = _a.onNext;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
            <ConfirmationPage_1.default heading={translate('addPersonalBankAccountPage.successTitle')} description={translate('addPersonalBankAccountPage.successMessage')} shouldShowButton buttonText={translate('common.continue')} onButtonPress={onNext} containerStyle={styles.h100}/>
        </ScrollView_1.default>);
}
Confirmation.displayName = 'Confirmation';
exports.default = Confirmation;
