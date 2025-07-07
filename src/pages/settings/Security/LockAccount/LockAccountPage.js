"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderPageLayout_1 = require("@components/HeaderPageLayout");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function LockAccountPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var _a = (0, react_1.useState)(false), isConfirmModalVisible = _a[0], setIsConfirmModalVisible = _a[1];
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _b = (0, react_1.useState)(false), isLoading = _b[0], setIsLoading = _b[1];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var lockAccountButton = (<Button_1.default danger isLoading={isLoading} isDisabled={isOffline} large text={translate('lockAccountPage.reportSuspiciousActivity')} style={styles.mt6} pressOnEnter onPress={function () {
            setIsConfirmModalVisible(true);
        }}/>);
    return (<>
            <HeaderPageLayout_1.default onBackButtonPress={function () { return Navigation_1.default.goBack(); }} title={translate('lockAccountPage.reportSuspiciousActivity')} testID={LockAccountPage.displayName} footer={lockAccountButton} childrenContainerStyles={[styles.pt3, styles.gap6]}>
                <react_native_1.View style={[styles.flex1, styles.gap4, styles.mh5]}>
                    <Text_1.default>{translate('lockAccountPage.compromisedDescription')}</Text_1.default>
                    <Text_1.default>{translate('lockAccountPage.domainAdminsDescription')}</Text_1.default>
                </react_native_1.View>
            </HeaderPageLayout_1.default>
            <ConfirmModal_1.default danger title={translate('lockAccountPage.reportSuspiciousActivity')} onConfirm={function () {
            // If there is no user accountID yet (because the app isn't fully setup yet), so return early
            if ((session === null || session === void 0 ? void 0 : session.accountID) === -1) {
                return;
            }
            setIsConfirmModalVisible(false);
            setIsLoading(true);
            (0, User_1.lockAccount)().then(function (response) {
                setIsLoading(false);
                if (!(response === null || response === void 0 ? void 0 : response.jsonCode)) {
                    return;
                }
                if (response.jsonCode === CONST_1.default.JSON_CODE.SUCCESS) {
                    Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_UNLOCK_ACCOUNT);
                }
                else {
                    Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_FAILED_TO_LOCK_ACCOUNT);
                }
            });
        }} onCancel={function () { return setIsConfirmModalVisible(false); }} isVisible={isConfirmModalVisible} prompt={<>
                        <Text_1.default style={[styles.mb5]}>{translate('lockAccountPage.areYouSure')}</Text_1.default>
                        <Text_1.default style={[styles.mb5]}>{translate('lockAccountPage.ourTeamWill')}</Text_1.default>
                    </>} confirmText={translate('lockAccountPage.lockAccount')} cancelText={translate('common.cancel')} shouldDisableConfirmButtonWhenOffline shouldShowCancelButton/>
        </>);
}
LockAccountPage.displayName = 'LockAccountPage';
exports.default = LockAccountPage;
