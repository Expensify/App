"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function UnlockAccountPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<ScreenWrapper_1.default testID={UnlockAccountPage.displayName} includeSafeAreaPaddingBottom>
            <HeaderWithBackButton_1.default onBackButtonPress={function () { return Navigation_1.default.dismissModal(); }} title={translate('unlockAccountPage.accountLocked')}/>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
                <ConfirmationPage_1.default illustration={Expensicons.EmptyStateSpyPigeon} heading={translate('unlockAccountPage.yourAccountIsLocked')} description={translate('unlockAccountPage.chatToConciergeToUnlock')} shouldShowButton descriptionStyle={styles.colorMuted} buttonText={translate('unlockAccountPage.chatWithConcierge')} onButtonPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.CONCIERGE); }} containerStyle={styles.h100}/>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
UnlockAccountPage.displayName = 'UnlockAccountPage';
exports.default = UnlockAccountPage;
