"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Button_1 = require("@components/Button");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report = require("@libs/actions/Report");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var ReportUtils = require("@libs/ReportUtils");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NotFoundPage_1 = require("./ErrorPage/NotFoundPage");
var withReportOrNotFound_1 = require("./home/report/withReportOrNotFound");
function ReportParticipantDetails(_a) {
    var _b, _c, _d, _e, _f, _g;
    var report = _a.report, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var _h = (0, useLocalize_1.default)(), formatPhoneNumber = _h.formatPhoneNumber, translate = _h.translate;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST)[0];
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var _j = react_1.default.useState(false), isRemoveMemberConfirmModalVisible = _j[0], setIsRemoveMemberConfirmModalVisible = _j[1];
    var accountID = Number(route.params.accountID);
    var backTo = ROUTES_1.default.REPORT_PARTICIPANTS.getRoute((_b = report === null || report === void 0 ? void 0 : report.reportID) !== null && _b !== void 0 ? _b : '-1', route.params.backTo);
    var member = (_c = report === null || report === void 0 ? void 0 : report.participants) === null || _c === void 0 ? void 0 : _c[accountID];
    var details = (_d = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) !== null && _d !== void 0 ? _d : {};
    var fallbackIcon = (_e = details.fallbackIcon) !== null && _e !== void 0 ? _e : '';
    var displayName = formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details));
    var isCurrentUserAdmin = ReportUtils.isGroupChatAdmin(report, currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID);
    var isSelectedMemberCurrentUser = accountID === (currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID);
    var removeUser = (0, react_1.useCallback)(function () {
        setIsRemoveMemberConfirmModalVisible(false);
        Report.removeFromGroupChat(report === null || report === void 0 ? void 0 : report.reportID, [accountID]);
        Navigation_1.default.goBack(backTo);
    }, [backTo, report, accountID]);
    var navigateToProfile = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(accountID, Navigation_1.default.getActiveRoute()));
    }, [accountID]);
    var openRoleSelectionModal = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_PARTICIPANTS_ROLE_SELECTION.getRoute(report.reportID, accountID, route.params.backTo));
    }, [accountID, report.reportID, route.params.backTo]);
    if (!member) {
        return <NotFoundPage_1.default />;
    }
    return (<ScreenWrapper_1.default testID={ReportParticipantDetails.displayName}>
            <HeaderWithBackButton_1.default title={displayName} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
            <react_native_1.View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone, styles.justifyContentStart]}>
                <react_native_1.View style={[styles.avatarSectionWrapper, styles.pb0]}>
                    <Avatar_1.default containerStyles={[styles.avatarXLarge, styles.mv5, styles.noOutline]} imageStyles={[styles.avatarXLarge]} source={details.avatar} avatarID={accountID} type={CONST_1.default.ICON_TYPE_AVATAR} size={CONST_1.default.AVATAR_SIZE.X_LARGE} fallbackIcon={fallbackIcon}/>
                    {!!(displayName !== null && displayName !== void 0 ? displayName : '') && (<Text_1.default style={[styles.textHeadline, styles.pre, styles.mb6, styles.w100, styles.textAlignCenter]} numberOfLines={1}>
                            {displayName}
                        </Text_1.default>)}
                    {isCurrentUserAdmin && (<>
                            <Button_1.default text={translate('workspace.people.removeGroupMemberButtonTitle')} onPress={function () { return setIsRemoveMemberConfirmModalVisible(true); }} isDisabled={isSelectedMemberCurrentUser} icon={Expensicons.RemoveMembers} iconStyles={StyleUtils.getTransformScaleStyle(0.8)} style={styles.mv5}/>
                            <ConfirmModal_1.default danger title={translate('workspace.people.removeGroupMemberButtonTitle')} isVisible={isRemoveMemberConfirmModalVisible} onConfirm={removeUser} onCancel={function () { return setIsRemoveMemberConfirmModalVisible(false); }} prompt={translate('workspace.people.removeMemberPrompt', { memberName: displayName })} confirmText={translate('common.remove')} cancelText={translate('common.cancel')}/>
                        </>)}
                </react_native_1.View>
                <react_native_1.View style={styles.w100}>
                    {isCurrentUserAdmin && (<OfflineWithFeedback_1.default pendingAction={(_g = (_f = member === null || member === void 0 ? void 0 : member.pendingFields) === null || _f === void 0 ? void 0 : _f.role) !== null && _g !== void 0 ? _g : null}>
                            <MenuItemWithTopDescription_1.default disabled={isSelectedMemberCurrentUser} title={(member === null || member === void 0 ? void 0 : member.role) === CONST_1.default.REPORT.ROLE.ADMIN ? translate('common.admin') : translate('common.member')} description={translate('common.role')} shouldShowRightIcon onPress={openRoleSelectionModal}/>
                        </OfflineWithFeedback_1.default>)}
                    <MenuItem_1.default title={translate('common.profile')} icon={Expensicons.Info} onPress={navigateToProfile} shouldShowRightIcon/>
                </react_native_1.View>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
ReportParticipantDetails.displayName = 'ReportParticipantDetails';
exports.default = (0, withReportOrNotFound_1.default)()(ReportParticipantDetails);
