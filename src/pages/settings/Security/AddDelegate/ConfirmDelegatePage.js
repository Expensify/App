"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Button_1 = require("@components/Button");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderPageLayout_1 = require("@components/HeaderPageLayout");
var Expensicons_1 = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Text_1 = require("@components/Text");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var customHistory_1 = require("@libs/Navigation/AppNavigator/customHistory");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var DelegateMagicCodeModal_1 = require("./DelegateMagicCodeModal");
function ConfirmDelegatePage(_a) {
    var _b, _c, _d;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var login = route.params.login;
    var role = route.params.role;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _e = (0, react_1.useState)(true), shouldDisableModalAnimation = _e[0], setShouldDisableModalAnimation = _e[1];
    var _f = (0, customHistory_1.useCustomHistoryParam)(), isValidateCodeActionModalVisible = _f[0], setIsValidateCodeActionModalVisible = _f[1];
    var _g = (0, react_1.useState)(isValidateCodeActionModalVisible !== null && isValidateCodeActionModalVisible !== void 0 ? isValidateCodeActionModalVisible : false), shouldShowLoading = _g[0], setShouldShowLoading = _g[1];
    var personalDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(login);
    var avatarIcon = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.avatar) !== null && _b !== void 0 ? _b : Expensicons_1.FallbackAvatar;
    var formattedLogin = (0, LocalePhoneNumber_1.formatPhoneNumber)(login !== null && login !== void 0 ? login : '');
    var displayName = (_c = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.displayName) !== null && _c !== void 0 ? _c : formattedLogin;
    (0, useBeforeRemove_1.default)(function () { return setIsValidateCodeActionModalVisible(false); });
    var submitButton = (<Button_1.default success isDisabled={isOffline} large text={translate('delegate.addCopilot')} style={styles.mt6} pressOnEnter onPress={function () {
            setShouldDisableModalAnimation(false);
            setIsValidateCodeActionModalVisible(true);
        }}/>);
    return (<>
            <HeaderPageLayout_1.default onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_DELEGATE_ROLE.getRoute(login, role)); }} title={translate('delegate.addCopilot')} testID={ConfirmDelegatePage.displayName} footer={submitButton} childrenContainerStyles={[styles.pt3, styles.gap6]} keyboardShouldPersistTaps="handled">
                <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                    <Text_1.default style={[styles.ph5]}>{translate('delegate.confirmCopilot')}</Text_1.default>
                    <MenuItem_1.default avatarID={(_d = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.accountID) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID} iconType={CONST_1.default.ICON_TYPE_AVATAR} icon={avatarIcon} title={displayName} description={formattedLogin} interactive={false}/>
                    <MenuItemWithTopDescription_1.default title={translate('delegate.role', { role: role })} description={translate('delegate.accessLevel')} helperText={translate('delegate.roleDescription', { role: role })} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_DELEGATE_ROLE.getRoute(login, role, ROUTES_1.default.SETTINGS_DELEGATE_CONFIRM.getRoute(login, role))); }} shouldShowRightIcon/>
                    <DelegateMagicCodeModal_1.default 
    // We should disable the animation initially and only enable it when the user manually opens the modal
    // to ensure it appears immediately when refreshing the page.
    disableAnimation={shouldDisableModalAnimation} login={login} role={role} onClose={function () {
            setShouldShowLoading(false);
            setIsValidateCodeActionModalVisible(false);
        }} isValidateCodeActionModalVisible={isValidateCodeActionModalVisible}/>
                </DelegateNoAccessWrapper_1.default>
            </HeaderPageLayout_1.default>
            {shouldShowLoading && <FullscreenLoadingIndicator_1.default />}
        </>);
}
ConfirmDelegatePage.displayName = 'ConfirmDelegatePage';
exports.default = ConfirmDelegatePage;
