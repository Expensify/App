"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var WorkspaceConfirmationForm_1 = require("@components/WorkspaceConfirmationForm");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var UpgradeConfirmation_1 = require("@pages/workspace/upgrade/UpgradeConfirmation");
var UpgradeIntro_1 = require("@pages/workspace/upgrade/UpgradeIntro");
var CONST_1 = require("@src/CONST");
var Policy_1 = require("@src/libs/actions/Policy/Policy");
function TravelUpgrade(_a) {
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var feature = CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.travel;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _b = (0, react_1.useState)(false), isUpgraded = _b[0], setIsUpgraded = _b[1];
    var _c = (0, react_1.useState)(false), shouldShowConfirmation = _c[0], setShouldShowConfirmation = _c[1];
    var onSubmit = function (params) {
        (0, Policy_1.createDraftWorkspace)('', false, params.name, params.policyID, params.currency, params.avatarFile);
        setShouldShowConfirmation(false);
        setIsUpgraded(true);
        (0, Policy_1.createWorkspace)('', false, params.name, params.policyID, undefined, params.currency, params.avatarFile);
    };
    var onClose = function () {
        setShouldShowConfirmation(false);
    };
    return (<ScreenWrapper_1.default shouldShowOfflineIndicator testID={TravelUpgrade.displayName} offlineIndicatorStyle={styles.mtAuto}>
            <HeaderWithBackButton_1.default title={translate('common.upgrade')} onBackButtonPress={function () { return Navigation_1.default.goBack(route.params.backTo); }}/>
            <Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={shouldShowConfirmation} onClose={onClose} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver onBackdropPress={Navigation_1.default.dismissModal} enableEdgeToEdgeBottomSafeAreaPadding>
                <ScreenWrapper_1.default style={[styles.pb0]} includePaddingTop={false} enableEdgeToEdgeBottomSafeAreaPadding shouldKeyboardOffsetBottomSafeAreaPadding testID={TravelUpgrade.displayName}>
                    <WorkspaceConfirmationForm_1.default onSubmit={onSubmit} onBackButtonPress={onClose}/>
                </ScreenWrapper_1.default>
            </Modal_1.default>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
                {isUpgraded ? (<UpgradeConfirmation_1.default onConfirmUpgrade={function () { return Navigation_1.default.goBack(); }} policyName="" isTravelUpgrade/>) : (<UpgradeIntro_1.default feature={feature} onUpgrade={function () { return setShouldShowConfirmation(true); }} buttonDisabled={isOffline} loading={false} isCategorizing/>)}
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
TravelUpgrade.displayName = 'TravelUpgrade';
exports.default = TravelUpgrade;
