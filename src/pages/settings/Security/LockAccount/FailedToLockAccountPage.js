"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function FailedToLockAccountPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<ScreenWrapper_1.default testID={FailedToLockAccountPage.displayName} includeSafeAreaPaddingBottom>
            <HeaderWithBackButton_1.default onBackButtonPress={function () { return Navigation_1.default.goBack(); }} title={translate('lockAccountPage.lockAccount')}/>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
                <ConfirmationPage_1.default illustration={Illustrations.LockOpen} heading={translate('failedToLockAccountPage.failedToLockAccount')} description={translate('failedToLockAccountPage.failedToLockAccountDescription')} shouldShowButton descriptionStyle={styles.colorMuted} buttonText={translate('failedToLockAccountPage.chatWithConcierge')} onButtonPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.CONCIERGE); }} containerStyle={styles.h100}/>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
FailedToLockAccountPage.displayName = 'FailedToLockAccountPage';
exports.default = FailedToLockAccountPage;
