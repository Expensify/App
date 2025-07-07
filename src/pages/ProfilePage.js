"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AutoUpdateTime_1 = require("@components/AutoUpdateTime");
var Avatar_1 = require("@components/Avatar");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var PressableWithoutFocus_1 = require("@components/Pressable/PressableWithoutFocus");
var PromotedActionsBar_1 = require("@components/PromotedActionsBar");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var UserUtils_1 = require("@libs/UserUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Link_1 = require("@userActions/Link");
var PersonalDetails_1 = require("@userActions/PersonalDetails");
var Report_1 = require("@userActions/Report");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var mapOnyxCollectionItems_1 = require("@src/utils/mapOnyxCollectionItems");
/**
 * This function narrows down the data from Onyx to just the properties that we want to trigger a re-render of the component. This helps minimize re-rendering
 * and makes the entire component more performant because it's not re-rendering when a bunch of properties change which aren't ever used in the UI.
 */
var chatReportSelector = function (report) {
    return report && {
        reportID: report.reportID,
        participants: report.participants,
        parentReportID: report.parentReportID,
        parentReportActionID: report.parentReportActionID,
        type: report.type,
        chatType: report.chatType,
    };
};
function ProfilePage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    var route = _a.route;
    var reports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { selector: function (c) { return (0, mapOnyxCollectionItems_1.default)(c, chatReportSelector); }, canBeMissing: true })[0];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: true })[0];
    var personalDetailsMetadata = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_METADATA, { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var isDebugModeEnabled = !!(account === null || account === void 0 ? void 0 : account.isDebugModeEnabled);
    var guideCalendarLink = (_c = (_b = account === null || account === void 0 ? void 0 : account.guideDetails) === null || _b === void 0 ? void 0 : _b.calendarLink) !== null && _c !== void 0 ? _c : '';
    var accountID = Number((_e = (_d = route.params) === null || _d === void 0 ? void 0 : _d.accountID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID);
    var isCurrentUser = (session === null || session === void 0 ? void 0 : session.accountID) === accountID;
    var reportKey = (0, react_1.useMemo)(function () {
        var _a;
        var reportID = isCurrentUser ? (0, ReportUtils_1.findSelfDMReportID)() : (_a = (0, ReportUtils_1.getChatByParticipants)((session === null || session === void 0 ? void 0 : session.accountID) ? [accountID, session.accountID] : [], reports)) === null || _a === void 0 ? void 0 : _a.reportID;
        if ((0, Session_1.isAnonymousUser)() || !reportID) {
            return "".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "0");
        }
        return "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID);
    }, [accountID, isCurrentUser, reports, session]);
    var report = (0, useOnyx_1.default)(reportKey, { canBeMissing: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var _t = (0, useLocalize_1.default)(), translate = _t.translate, formatPhoneNumber = _t.formatPhoneNumber;
    var isValidAccountID = (0, ValidationUtils_1.isValidAccountRoute)(accountID);
    var loginParams = (_f = route.params) === null || _f === void 0 ? void 0 : _f.login;
    var details = (0, react_1.useMemo)(function () {
        var _a;
        // Check if we have the personal details already in Onyx
        if (personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) {
            return (_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) !== null && _a !== void 0 ? _a : undefined;
        }
        // Check if we have the login param
        if (!loginParams) {
            return isValidAccountID ? undefined : { accountID: 0 };
        }
        // Look up the personal details by login
        var foundDetails = Object.values(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {}).find(function (personalDetail) { return (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) === (loginParams === null || loginParams === void 0 ? void 0 : loginParams.toLowerCase()); });
        if (foundDetails) {
            return foundDetails;
        }
        // If we don't have the personal details in Onyx, we can create an optimistic account
        var optimisticAccountID = (0, UserUtils_1.generateAccountID)(loginParams);
        return { accountID: optimisticAccountID, login: loginParams, displayName: loginParams };
    }, [personalDetails, accountID, loginParams, isValidAccountID]);
    var displayName = formatPhoneNumber((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(details, undefined, undefined, isCurrentUser, translate('common.you').toLowerCase()));
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var fallbackIcon = (_g = details === null || details === void 0 ? void 0 : details.fallbackIcon) !== null && _g !== void 0 ? _g : '';
    var login = (_h = details === null || details === void 0 ? void 0 : details.login) !== null && _h !== void 0 ? _h : '';
    var timezone = details === null || details === void 0 ? void 0 : details.timezone;
    var reportRecipient = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
    var isParticipantValidated = (_j = reportRecipient === null || reportRecipient === void 0 ? void 0 : reportRecipient.validated) !== null && _j !== void 0 ? _j : false;
    // If we have a reportID param this means that we
    // arrived here via the ParticipantsPage and should be allowed to navigate back to it
    var shouldShowLocalTime = !(0, ReportUtils_1.hasAutomatedExpensifyAccountIDs)([accountID]) && !(0, EmptyObject_1.isEmptyObject)(timezone) && isParticipantValidated;
    var pronouns = (_k = details === null || details === void 0 ? void 0 : details.pronouns) !== null && _k !== void 0 ? _k : '';
    if (pronouns === null || pronouns === void 0 ? void 0 : pronouns.startsWith(CONST_1.default.PRONOUNS.PREFIX)) {
        var localeKey = pronouns.replace(CONST_1.default.PRONOUNS.PREFIX, '');
        pronouns = translate("pronouns.".concat(localeKey));
    }
    var isSMSLogin = expensify_common_1.Str.isSMSLogin(login);
    var phoneNumber = (0, PersonalDetailsUtils_1.getPhoneNumber)(details);
    var hasAvatar = !!(details === null || details === void 0 ? void 0 : details.avatar);
    var isLoading = !!((_l = personalDetailsMetadata === null || personalDetailsMetadata === void 0 ? void 0 : personalDetailsMetadata[accountID]) === null || _l === void 0 ? void 0 : _l.isLoading) || (0, EmptyObject_1.isEmptyObject)(details);
    var shouldShowBlockingView = (!isValidAccountID && !isLoading) || CONST_1.default.RESTRICTED_ACCOUNT_IDS.includes(accountID);
    var statusEmojiCode = (_o = (_m = details === null || details === void 0 ? void 0 : details.status) === null || _m === void 0 ? void 0 : _m.emojiCode) !== null && _o !== void 0 ? _o : '';
    var statusText = (_q = (_p = details === null || details === void 0 ? void 0 : details.status) === null || _p === void 0 ? void 0 : _p.text) !== null && _q !== void 0 ? _q : '';
    var hasStatus = !!statusEmojiCode;
    var statusContent = "".concat(statusEmojiCode, "  ").concat(statusText);
    var navigateBackTo = (_r = route === null || route === void 0 ? void 0 : route.params) === null || _r === void 0 ? void 0 : _r.backTo;
    var notificationPreferenceValue = (0, ReportUtils_1.getReportNotificationPreference)(report);
    var shouldShowNotificationPreference = !(0, EmptyObject_1.isEmptyObject)(report) && !isCurrentUser && !(0, ReportUtils_1.isHiddenForCurrentUser)(notificationPreferenceValue);
    var notificationPreference = shouldShowNotificationPreference
        ? translate("notificationPreferencesPage.notificationPreferences.".concat(notificationPreferenceValue))
        : '';
    var isConcierge = (0, ReportUtils_1.isConciergeChatReport)(report);
    // eslint-disable-next-line rulesdir/prefer-early-return
    (0, react_1.useEffect)(function () {
        // Concierge's profile page information is already available in CONST.ts
        if ((0, ValidationUtils_1.isValidAccountRoute)(accountID) && !loginParams && !isConcierge) {
            (0, PersonalDetails_1.openPublicProfilePage)(accountID);
        }
    }, [accountID, loginParams, isConcierge]);
    var promotedActions = (0, react_1.useMemo)(function () {
        var result = [];
        if (report) {
            result.push(PromotedActionsBar_1.PromotedActions.pin(report));
        }
        // If it's a self DM, we only want to show the Message button if the self DM report exists because we don't want to optimistically create a report for self DM
        if ((!isCurrentUser || report) && !(0, Session_1.isAnonymousUser)()) {
            result.push(PromotedActionsBar_1.PromotedActions.message({ reportID: report === null || report === void 0 ? void 0 : report.reportID, accountID: accountID, login: loginParams }));
        }
        return result;
    }, [accountID, isCurrentUser, loginParams, report]);
    return (<ScreenWrapper_1.default testID={ProfilePage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={shouldShowBlockingView}>
                <HeaderWithBackButton_1.default title={translate('common.profile')} onBackButtonPress={function () { return Navigation_1.default.goBack(navigateBackTo); }}/>
                <react_native_1.View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <ScrollView_1.default>
                        <react_native_1.View style={[styles.avatarSectionWrapper, styles.pb0]}>
                            <PressableWithoutFocus_1.default style={[styles.noOutline, styles.mb4]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.PROFILE_AVATAR.getRoute(accountID, Navigation_1.default.getActiveRoute())); }} accessibilityLabel={translate('common.profile')} accessibilityRole={CONST_1.default.ROLE.BUTTON} disabled={!hasAvatar}>
                                <OfflineWithFeedback_1.default pendingAction={(_s = details === null || details === void 0 ? void 0 : details.pendingFields) === null || _s === void 0 ? void 0 : _s.avatar}>
                                    <Avatar_1.default containerStyles={[styles.avatarXLarge]} imageStyles={[styles.avatarXLarge]} source={details === null || details === void 0 ? void 0 : details.avatar} avatarID={accountID} type={CONST_1.default.ICON_TYPE_AVATAR} size={CONST_1.default.AVATAR_SIZE.X_LARGE} fallbackIcon={fallbackIcon}/>
                                </OfflineWithFeedback_1.default>
                            </PressableWithoutFocus_1.default>
                            {!!displayName && (<Text_1.default style={[styles.textHeadline, styles.pre, styles.mb8, styles.w100, styles.textAlignCenter]} numberOfLines={1}>
                                    {displayName}
                                </Text_1.default>)}
                            <PromotedActionsBar_1.default promotedActions={promotedActions} containerStyle={[styles.ph0, styles.mb8]}/>
                            {hasStatus && (<react_native_1.View style={[styles.detailsPageSectionContainer, styles.w100]}>
                                    <MenuItemWithTopDescription_1.default style={[styles.ph0]} title={statusContent} description={translate('statusPage.status')} interactive={false}/>
                                </react_native_1.View>)}

                            {/* Don't display email if current user is anonymous */}
                            {!(isCurrentUser && (0, Session_1.isAnonymousUser)()) && login ? (<react_native_1.View style={[styles.w100, styles.detailsPageSectionContainer]}>
                                    <MenuItemWithTopDescription_1.default style={[styles.ph0]} title={isSMSLogin ? formatPhoneNumber(phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : '') : login} copyValue={isSMSLogin ? formatPhoneNumber(phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : '') : login} description={translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')} interactive={false}/>
                                </react_native_1.View>) : null}
                            {pronouns ? (<react_native_1.View style={[styles.w100, styles.detailsPageSectionContainer]}>
                                    <MenuItemWithTopDescription_1.default style={[styles.ph0]} title={pronouns} description={translate('profilePage.preferredPronouns')} interactive={false}/>
                                </react_native_1.View>) : null}
                            {shouldShowLocalTime && <AutoUpdateTime_1.default timezone={timezone}/>}
                        </react_native_1.View>
                        {isCurrentUser && (<MenuItem_1.default shouldShowRightIcon title={translate('common.editYourProfile')} icon={Expensicons.Pencil} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_PROFILE.getRoute(Navigation_1.default.getActiveRoute())); }}/>)}
                        {shouldShowNotificationPreference && (<MenuItemWithTopDescription_1.default shouldShowRightIcon title={notificationPreference} description={translate('notificationPreferencesPage.label')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_SETTINGS_NOTIFICATION_PREFERENCES.getRoute(report.reportID, navigateBackTo)); }}/>)}
                        {!(0, EmptyObject_1.isEmptyObject)(report) && !!report.reportID && !isCurrentUser && (<MenuItem_1.default title={"".concat(translate('privateNotes.title'))} titleStyle={styles.flex1} icon={Expensicons.Pencil} onPress={function () { return (0, ReportUtils_1.navigateToPrivateNotes)(report, session, navigateBackTo); }} wrapperStyle={styles.breakAll} shouldShowRightIcon brickRoadIndicator={(0, Report_1.hasErrorInPrivateNotes)(report) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>)}
                        {isConcierge && !!guideCalendarLink && (<MenuItem_1.default title={translate('videoChatButtonAndMenu.tooltip')} icon={Expensicons.Phone} isAnonymousAction={false} onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function () {
                (0, Link_1.openExternalLink)(guideCalendarLink);
            })}/>)}
                        {!!(report === null || report === void 0 ? void 0 : report.reportID) && !!isDebugModeEnabled && (<MenuItem_1.default title={translate('debug.debug')} icon={Expensicons.Bug} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.DEBUG_REPORT.getRoute(report.reportID)); }}/>)}
                    </ScrollView_1.default>
                    {!hasAvatar && isLoading && <FullscreenLoadingIndicator_1.default style={styles.flex1}/>}
                </react_native_1.View>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
ProfilePage.displayName = 'ProfilePage';
exports.default = ProfilePage;
