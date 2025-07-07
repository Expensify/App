"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var CopyTextToClipboard_1 = require("@components/CopyTextToClipboard");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var LockedAccountModalProvider_1 = require("@components/LockedAccountModalProvider");
var MenuItem_1 = require("@components/MenuItem");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function ContactMethodsPage(_a) {
    var _b;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, useLocalize_1.default)(), formatPhoneNumber = _c.formatPhoneNumber, translate = _c.translate;
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: false })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var loginNames = Object.keys(loginList !== null && loginList !== void 0 ? loginList : {});
    var navigateBackTo = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.backTo;
    var _d = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _d.isActingAsDelegate, showDelegateNoAccessModal = _d.showDelegateNoAccessModal;
    var isUserValidated = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { return account === null || account === void 0 ? void 0 : account.validated; }, canBeMissing: false })[0];
    var _e = (0, react_1.useContext)(LockedAccountModalProvider_1.LockedAccountContext), isAccountLocked = _e.isAccountLocked, showLockedAccountModal = _e.showLockedAccountModal;
    // Sort the login names by placing the one corresponding to the default contact method as the first item before displaying the contact methods.
    // The default contact method is determined by checking against the session email (the current login).
    var sortedLoginNames = loginNames.sort(function (loginName) { return ((loginList === null || loginList === void 0 ? void 0 : loginList[loginName].partnerUserID) === (session === null || session === void 0 ? void 0 : session.email) ? -1 : 1); });
    var loginMenuItems = sortedLoginNames.map(function (loginName) {
        var _a, _b, _c, _d, _e, _f;
        var login = loginList === null || loginList === void 0 ? void 0 : loginList[loginName];
        var isDefaultContactMethod = (session === null || session === void 0 ? void 0 : session.email) === (login === null || login === void 0 ? void 0 : login.partnerUserID);
        var pendingAction = (_d = (_b = (_a = login === null || login === void 0 ? void 0 : login.pendingFields) === null || _a === void 0 ? void 0 : _a.deletedLogin) !== null && _b !== void 0 ? _b : (_c = login === null || login === void 0 ? void 0 : login.pendingFields) === null || _c === void 0 ? void 0 : _c.addedLogin) !== null && _d !== void 0 ? _d : undefined;
        if (!(login === null || login === void 0 ? void 0 : login.partnerUserID) && !pendingAction) {
            return null;
        }
        var description = '';
        if ((session === null || session === void 0 ? void 0 : session.email) === (login === null || login === void 0 ? void 0 : login.partnerUserID)) {
            description = translate('contacts.getInTouch');
        }
        else if ((_e = login === null || login === void 0 ? void 0 : login.errorFields) === null || _e === void 0 ? void 0 : _e.addedLogin) {
            description = translate('contacts.failedNewContact');
        }
        else if (!(login === null || login === void 0 ? void 0 : login.validatedDate)) {
            description = translate('contacts.pleaseVerify');
        }
        var indicator;
        if (Object.values((_f = login === null || login === void 0 ? void 0 : login.errorFields) !== null && _f !== void 0 ? _f : {}).some(function (errorField) { return !(0, EmptyObject_1.isEmptyObject)(errorField); })) {
            indicator = CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        }
        else if (!(login === null || login === void 0 ? void 0 : login.validatedDate) && !isDefaultContactMethod) {
            indicator = CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.INFO;
        }
        else if (!(login === null || login === void 0 ? void 0 : login.validatedDate) && isDefaultContactMethod && loginNames.length > 1) {
            indicator = CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.INFO;
        }
        // Default to using login key if we deleted login.partnerUserID optimistically
        // but still need to show the pending login being deleted while offline.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var partnerUserID = (login === null || login === void 0 ? void 0 : login.partnerUserID) || loginName;
        var menuItemTitle = expensify_common_1.Str.isSMSLogin(partnerUserID) ? formatPhoneNumber(partnerUserID) : partnerUserID;
        return (<OfflineWithFeedback_1.default pendingAction={pendingAction} key={partnerUserID}>
                <MenuItem_1.default title={menuItemTitle} description={description} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONTACT_METHOD_DETAILS.getRoute(partnerUserID, navigateBackTo)); }} brickRoadIndicator={indicator} shouldShowBasicTitle shouldShowRightIcon disabled={!!pendingAction}/>
            </OfflineWithFeedback_1.default>);
    });
    var onNewContactMethodButtonPress = (0, react_1.useCallback)(function () {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (!isUserValidated) {
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation_1.default.getActiveRoute(), ROUTES_1.default.SETTINGS_NEW_CONTACT_METHOD.getRoute(navigateBackTo)));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_NEW_CONTACT_METHOD.getRoute(navigateBackTo));
    }, [navigateBackTo, isActingAsDelegate, showDelegateNoAccessModal, isAccountLocked, isUserValidated, showLockedAccountModal]);
    return (<ScreenWrapper_1.default shouldEnableKeyboardAvoidingView={false} testID={ContactMethodsPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('contacts.contactMethods')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
                <react_native_1.View style={[styles.ph5, styles.mv3, styles.flexRow, styles.flexWrap]}>
                    <Text_1.default>
                        {translate('contacts.helpTextBeforeEmail')}
                        <CopyTextToClipboard_1.default text={CONST_1.default.EMAIL.RECEIPTS} textStyles={[styles.textBlue]}/>
                        <Text_1.default>{translate('contacts.helpTextAfterEmail')}</Text_1.default>
                    </Text_1.default>
                </react_native_1.View>
                {loginMenuItems}
                <FixedFooter_1.default style={[styles.mtAuto, styles.pt5]}>
                    <Button_1.default large success text={translate('contacts.newContactMethod')} onPress={onNewContactMethodButtonPress} pressOnEnter/>
                </FixedFooter_1.default>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
ContactMethodsPage.displayName = 'ContactMethodsPage';
exports.default = ContactMethodsPage;
