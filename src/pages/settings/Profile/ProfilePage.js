"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AvatarSkeleton_1 = require("@components/AvatarSkeleton");
var AvatarWithImagePicker_1 = require("@components/AvatarWithImagePicker");
var Button_1 = require("@components/Button");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var MenuItemGroup_1 = require("@components/MenuItemGroup");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useScrollEnabled_1 = require("@hooks/useScrollEnabled");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var UserUtils_1 = require("@libs/UserUtils");
var PersonalDetails_1 = require("@userActions/PersonalDetails");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function ProfilePage() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var safeAreaPaddingBottomStyle = (0, useSafeAreaPaddings_1.default)().safeAreaPaddingBottomStyle;
    var scrollEnabled = (0, useScrollEnabled_1.default)();
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: true })[0];
    var privatePersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS, { canBeMissing: false })[0];
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var route = (0, native_1.useRoute)();
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: false })[0];
    var getPronouns = function () {
        var _a, _b;
        var pronounsKey = (_b = (_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.pronouns) === null || _a === void 0 ? void 0 : _a.replace(CONST_1.default.PRONOUNS.PREFIX, '')) !== null && _b !== void 0 ? _b : '';
        return pronounsKey ? translate("pronouns.".concat(pronounsKey)) : translate('profilePage.selectYourPronouns');
    };
    var avatarURL = (_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.avatar) !== null && _a !== void 0 ? _a : '';
    var accountID = (_b = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var contactMethodBrickRoadIndicator = (0, UserUtils_1.getLoginListBrickRoadIndicator)(loginList);
    var emojiCode = (_d = (_c = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.status) === null || _c === void 0 ? void 0 : _c.emojiCode) !== null && _d !== void 0 ? _d : '';
    var privateDetails = privatePersonalDetails !== null && privatePersonalDetails !== void 0 ? privatePersonalDetails : {};
    var legalName = "".concat((_e = privateDetails.legalFirstName) !== null && _e !== void 0 ? _e : '', " ").concat((_f = privateDetails.legalLastName) !== null && _f !== void 0 ? _f : '').trim();
    var _w = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _w.isActingAsDelegate, showDelegateNoAccessModal = _w.showDelegateNoAccessModal;
    var publicOptions = [
        {
            description: translate('displayNamePage.headerTitle'),
            title: (_g = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.displayName) !== null && _g !== void 0 ? _g : '',
            pageRoute: ROUTES_1.default.SETTINGS_DISPLAY_NAME,
        },
        {
            description: translate('contacts.contactMethod'),
            title: (0, LocalePhoneNumber_1.formatPhoneNumber)((_h = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.login) !== null && _h !== void 0 ? _h : ''),
            pageRoute: ROUTES_1.default.SETTINGS_CONTACT_METHODS.route,
            brickRoadIndicator: contactMethodBrickRoadIndicator,
        },
        {
            description: translate('statusPage.status'),
            title: emojiCode ? "".concat(emojiCode, " ").concat((_k = (_j = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.status) === null || _j === void 0 ? void 0 : _j.text) !== null && _k !== void 0 ? _k : '') : '',
            pageRoute: ROUTES_1.default.SETTINGS_STATUS,
        },
        {
            description: translate('pronounsPage.pronouns'),
            title: getPronouns(),
            pageRoute: ROUTES_1.default.SETTINGS_PRONOUNS,
        },
        {
            description: translate('timezonePage.timezone'),
            title: (_m = (_l = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.timezone) === null || _l === void 0 ? void 0 : _l.selected) !== null && _m !== void 0 ? _m : '',
            pageRoute: ROUTES_1.default.SETTINGS_TIMEZONE,
        },
    ];
    var privateOptions = [
        {
            description: translate('privatePersonalDetails.legalName'),
            title: legalName,
            action: function () {
                if (isActingAsDelegate) {
                    showDelegateNoAccessModal();
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_LEGAL_NAME);
            },
        },
        {
            description: translate('common.dob'),
            title: (_o = privateDetails.dob) !== null && _o !== void 0 ? _o : '',
            action: function () {
                if (isActingAsDelegate) {
                    showDelegateNoAccessModal();
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_DATE_OF_BIRTH);
            },
        },
        {
            description: translate('common.phoneNumber'),
            title: (_p = privateDetails.phoneNumber) !== null && _p !== void 0 ? _p : '',
            action: function () {
                if (isActingAsDelegate) {
                    showDelegateNoAccessModal();
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_PHONE_NUMBER);
            },
            brickRoadIndicator: ((_q = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.errorFields) === null || _q === void 0 ? void 0 : _q.phoneNumber) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            description: translate('privatePersonalDetails.address'),
            title: (0, PersonalDetailsUtils_1.getFormattedAddress)(privateDetails),
            action: function () {
                if (isActingAsDelegate) {
                    showDelegateNoAccessModal();
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ADDRESS);
            },
        },
    ];
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={ProfilePage.displayName} shouldShowOfflineIndicatorInWideScreen>
            <HeaderWithBackButton_1.default title={translate('common.profile')} onBackButtonPress={function () {
            var _a;
            if (Navigation_1.default.getShouldPopToSidebar()) {
                Navigation_1.default.popToSidebar();
                return;
            }
            Navigation_1.default.goBack((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo);
        }} shouldShowBackButton={shouldUseNarrowLayout} shouldDisplaySearchRouter icon={Illustrations.Profile} shouldUseHeadlineHeader/>
            <ScrollView_1.default style={styles.pt3} contentContainerStyle={safeAreaPaddingBottomStyle} scrollEnabled={scrollEnabled}>
                <MenuItemGroup_1.default>
                    <react_native_1.View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section_1.default title={translate('profilePage.publicSection.title')} subtitle={translate('profilePage.publicSection.subtitle')} isCentralPane subtitleMuted childrenStyles={styles.pt5} titleStyles={styles.accountSettingsSectionTitle}>
                            <react_native_1.View style={[styles.pt3, styles.pb6, styles.alignSelfStart, styles.w100]}>
                                {(0, EmptyObject_1.isEmptyObject)(currentUserPersonalDetails) || accountID === -1 || !avatarURL ? (<AvatarSkeleton_1.default size={CONST_1.default.AVATAR_SIZE.X_LARGE}/>) : (<MenuItemGroup_1.default shouldUseSingleExecution={false}>
                                        <AvatarWithImagePicker_1.default isUsingDefaultAvatar={(0, UserUtils_1.isDefaultAvatar)((_r = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.avatar) !== null && _r !== void 0 ? _r : '')} source={avatarURL} avatarID={accountID} onImageSelected={PersonalDetails_1.updateAvatar} onImageRemoved={PersonalDetails_1.deleteAvatar} size={CONST_1.default.AVATAR_SIZE.X_LARGE} avatarStyle={[styles.avatarXLarge, styles.alignSelfStart]} pendingAction={(_t = (_s = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.pendingFields) === null || _s === void 0 ? void 0 : _s.avatar) !== null && _t !== void 0 ? _t : undefined} errors={(_v = (_u = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.errorFields) === null || _u === void 0 ? void 0 : _u.avatar) !== null && _v !== void 0 ? _v : null} errorRowStyles={styles.mt6} onErrorClose={PersonalDetails_1.clearAvatarErrors} onViewPhotoPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.PROFILE_AVATAR.getRoute(accountID)); }} previewSource={(0, UserUtils_1.getFullSizeAvatar)(avatarURL, accountID)} originalFileName={currentUserPersonalDetails.originalFileName} headerTitle={translate('profilePage.profileAvatar')} fallbackIcon={currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.fallbackIcon} editIconStyle={styles.profilePageAvatar}/>
                                    </MenuItemGroup_1.default>)}
                            </react_native_1.View>
                            {publicOptions.map(function (detail, index) { return (<MenuItemWithTopDescription_1.default 
        // eslint-disable-next-line react/no-array-index-key
        key={"".concat(detail.title, "_").concat(index)} shouldShowRightIcon title={detail.title} description={detail.description} wrapperStyle={styles.sectionMenuItemTopDescription} onPress={function () { return Navigation_1.default.navigate(detail.pageRoute); }} brickRoadIndicator={detail.brickRoadIndicator}/>); })}
                            <Button_1.default accessibilityLabel={translate('common.shareCode')} text={translate('common.share')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SHARE_CODE); }} icon={Expensicons.QrCode} style={[styles.alignSelfStart, styles.mt6]}/>
                        </Section_1.default>
                        <Section_1.default title={translate('profilePage.privateSection.title')} subtitle={translate('profilePage.privateSection.subtitle')} isCentralPane subtitleMuted childrenStyles={styles.pt3} titleStyles={styles.accountSettingsSectionTitle}>
                            {isLoadingApp ? (<FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative, StyleUtils.getBackgroundColorStyle(theme.cardBG)]}/>) : (<MenuItemGroup_1.default shouldUseSingleExecution={!isActingAsDelegate}>
                                    {privateOptions.map(function (detail, index) { return (<MenuItemWithTopDescription_1.default 
            // eslint-disable-next-line react/no-array-index-key
            key={"".concat(detail.title, "_").concat(index)} shouldShowRightIcon title={detail.title} description={detail.description} wrapperStyle={styles.sectionMenuItemTopDescription} onPress={detail.action} brickRoadIndicator={detail.brickRoadIndicator}/>); })}
                                </MenuItemGroup_1.default>)}
                        </Section_1.default>
                    </react_native_1.View>
                </MenuItemGroup_1.default>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
ProfilePage.displayName = 'ProfilePage';
exports.default = ProfilePage;
