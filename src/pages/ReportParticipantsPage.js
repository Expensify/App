"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Badge_1 = require("@components/Badge");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var Button_1 = require("@components/Button");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TableListItem_1 = require("@components/SelectionList/TableListItem");
var SelectionListWithModal_1 = require("@components/SelectionListWithModal");
var Text_1 = require("@components/Text");
var useFilteredSelection_1 = require("@hooks/useFilteredSelection");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSearchBackPress_1 = require("@hooks/useSearchBackPress");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var Report_1 = require("@libs/actions/Report");
var RoomMembersUserSearchPhrase_1 = require("@libs/actions/RoomMembersUserSearchPhrase");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var StringUtils_1 = require("@libs/StringUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var withReportOrNotFound_1 = require("./home/report/withReportOrNotFound");
function ReportParticipantsPage(_a) {
    var _b, _c;
    var report = _a.report, route = _a.route;
    var backTo = route.params.backTo;
    var _d = (0, react_1.useState)(false), removeMembersConfirmModalVisible = _d[0], setRemoveMembersConfirmModalVisible = _d[1];
    var _e = (0, useLocalize_1.default)(), translate = _e.translate, formatPhoneNumber = _e.formatPhoneNumber;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the selection mode only on small screens
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _f = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _f.shouldUseNarrowLayout, isSmallScreenWidth = _f.isSmallScreenWidth;
    var selectionListRef = (0, react_1.useRef)(null);
    var textInputRef = (0, react_1.useRef)(null);
    var userSearchPhrase = (0, useOnyx_1.default)(ONYXKEYS_1.default.ROOM_MEMBERS_USER_SEARCH_PHRASE, { canBeMissing: true })[0];
    var isReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var reportMetadata = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID), { canBeMissing: false })[0];
    var reportAttributes = (0, useOnyx_1.default)(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES, { selector: function (attributes) { return attributes === null || attributes === void 0 ? void 0 : attributes.reports; }, canBeMissing: false })[0];
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var currentUserAccountID = Number(session === null || session === void 0 ? void 0 : session.accountID);
    var isCurrentUserAdmin = (0, ReportUtils_1.isGroupChatAdmin)(report, currentUserAccountID);
    var isGroupChat = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isGroupChat)(report); }, [report]);
    var isFocused = (0, native_1.useIsFocused)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var canSelectMultiple = isGroupChat && isCurrentUserAdmin && (isSmallScreenWidth ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : true);
    var _g = (0, react_1.useState)(''), searchValue = _g[0], setSearchValue = _g[1];
    var _h = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.getReportPersonalDetailsParticipants)(report, personalDetails, reportMetadata); }, [report, personalDetails, reportMetadata]), chatParticipants = _h.chatParticipants, personalDetailsParticipants = _h.personalDetailsParticipants;
    var filterParticipants = (0, react_1.useCallback)(function (participant) {
        var _a;
        if (!participant) {
            return false;
        }
        var isInParticipants = chatParticipants.includes(participant.accountID);
        var pendingChatMember = (_a = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) === null || _a === void 0 ? void 0 : _a.find(function (member) { return member.accountID === participant.accountID.toString(); });
        var isPendingDelete = (pendingChatMember === null || pendingChatMember === void 0 ? void 0 : pendingChatMember.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        return isInParticipants && !isPendingDelete;
    }, [chatParticipants, reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers]);
    var _j = (0, useFilteredSelection_1.default)(personalDetailsParticipants, filterParticipants), selectedMembers = _j[0], setSelectedMembers = _j[1];
    var pendingChatMembers = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers;
    var reportParticipants = report === null || report === void 0 ? void 0 : report.participants;
    // Get the active chat members by filtering out the pending members with delete action
    var activeParticipants = chatParticipants.filter(function (accountID) {
        var pendingMember = pendingChatMembers === null || pendingChatMembers === void 0 ? void 0 : pendingChatMembers.findLast(function (member) { return member.accountID === accountID.toString(); });
        if (!(personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID])) {
            return false;
        }
        // When offline, we want to include the pending members with delete action as they are displayed in the list as well
        return !pendingMember || isOffline || pendingMember.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    });
    // Include the search bar when there are 8 or more active members in the selection list
    var shouldShowTextInput = activeParticipants.length >= CONST_1.default.STANDARD_LIST_ITEM_LIMIT;
    (0, react_1.useEffect)(function () {
        if (!isFocused) {
            return;
        }
        if (shouldShowTextInput) {
            setSearchValue(userSearchPhrase !== null && userSearchPhrase !== void 0 ? userSearchPhrase : '');
        }
        else {
            (0, RoomMembersUserSearchPhrase_1.clearUserSearchPhrase)();
            setSearchValue('');
        }
    }, [isFocused, setSearchValue, shouldShowTextInput, userSearchPhrase]);
    (0, useSearchBackPress_1.default)({
        onClearSelection: function () { return setSelectedMembers([]); },
        onNavigationCallBack: function () {
            if (!report) {
                return;
            }
            setSearchValue('');
            Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
        },
    });
    var getParticipants = function () {
        var result = [];
        chatParticipants.forEach(function (accountID) {
            var _a, _b, _c, _d, _e;
            var role = reportParticipants === null || reportParticipants === void 0 ? void 0 : reportParticipants[accountID].role;
            var details = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
            // If search value is provided, filter out members that don't match the search value
            if (!details || (searchValue.trim() && !(0, OptionsListUtils_1.isSearchStringMatchUserDetails)(details, searchValue))) {
                return;
            }
            var pendingChatMember = pendingChatMembers === null || pendingChatMembers === void 0 ? void 0 : pendingChatMembers.findLast(function (member) { return member.accountID === accountID.toString(); });
            var isSelected = selectedMembers.includes(accountID) && canSelectMultiple;
            var isAdmin = role === CONST_1.default.REPORT.ROLE.ADMIN;
            var roleBadge = null;
            if (isAdmin) {
                roleBadge = <Badge_1.default text={translate('common.admin')}/>;
            }
            var pendingAction = (_a = pendingChatMember === null || pendingChatMember === void 0 ? void 0 : pendingChatMember.pendingAction) !== null && _a !== void 0 ? _a : (_b = reportParticipants === null || reportParticipants === void 0 ? void 0 : reportParticipants[accountID]) === null || _b === void 0 ? void 0 : _b.pendingAction;
            result.push({
                keyForList: "".concat(accountID),
                accountID: accountID,
                isSelected: isSelected,
                isDisabledCheckbox: accountID === currentUserAccountID,
                isDisabled: (pendingChatMember === null || pendingChatMember === void 0 ? void 0 : pendingChatMember.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || (details === null || details === void 0 ? void 0 : details.isOptimisticPersonalDetail),
                text: formatPhoneNumber((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(details)),
                alternateText: formatPhoneNumber((_c = details === null || details === void 0 ? void 0 : details.login) !== null && _c !== void 0 ? _c : ''),
                rightElement: roleBadge,
                pendingAction: pendingAction,
                icons: [
                    {
                        source: (_d = details === null || details === void 0 ? void 0 : details.avatar) !== null && _d !== void 0 ? _d : Expensicons_1.FallbackAvatar,
                        name: formatPhoneNumber((_e = details === null || details === void 0 ? void 0 : details.login) !== null && _e !== void 0 ? _e : ''),
                        type: CONST_1.default.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
            });
        });
        result = result.sort(function (a, b) { var _a, _b; return ((_a = a.text) !== null && _a !== void 0 ? _a : '').toLowerCase().localeCompare(((_b = b.text) !== null && _b !== void 0 ? _b : '').toLowerCase()); });
        return result;
    };
    var participants = getParticipants();
    /**
     * Add user from the selectedMembers list
     */
    var addUser = (0, react_1.useCallback)(function (accountID) { return setSelectedMembers(function (prevSelected) { return __spreadArray(__spreadArray([], prevSelected, true), [accountID], false); }); }, [setSelectedMembers]);
    /**
     * Add or remove all users passed from the selectedEmployees list
     */
    var toggleAllUsers = function (memberList) {
        var enabledAccounts = memberList.filter(function (member) { return !member.isDisabled && !member.isDisabledCheckbox; });
        var someSelected = enabledAccounts.some(function (member) { return selectedMembers.includes(member.accountID); });
        if (someSelected) {
            setSelectedMembers([]);
        }
        else {
            var everyAccountId = enabledAccounts.map(function (member) { return member.accountID; });
            setSelectedMembers(everyAccountId);
        }
    };
    /**
     * Remove user from the selectedMembers list
     */
    var removeUser = (0, react_1.useCallback)(function (accountID) {
        setSelectedMembers(function (prevSelected) { return prevSelected.filter(function (id) { return id !== accountID; }); });
    }, [setSelectedMembers]);
    /**
     * Open the modal to invite a user
     */
    var inviteUser = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_PARTICIPANTS_INVITE.getRoute(report.reportID, backTo));
    }, [report, backTo]);
    /**
     * Remove selected users from the workspace
     * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
     */
    var removeUsers = function () {
        // Remove the admin from the list
        var accountIDsToRemove = selectedMembers.filter(function (id) { return id !== currentUserAccountID; });
        (0, Report_1.removeFromGroupChat)(report.reportID, accountIDsToRemove);
        setSearchValue('');
        setRemoveMembersConfirmModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            setSelectedMembers([]);
            (0, RoomMembersUserSearchPhrase_1.clearUserSearchPhrase)();
        });
    };
    var changeUserRole = (0, react_1.useCallback)(function (role) {
        var accountIDsToUpdate = selectedMembers.filter(function (id) { var _a; return ((_a = report.participants) === null || _a === void 0 ? void 0 : _a[id].role) !== role; });
        (0, Report_1.updateGroupChatMemberRoles)(report.reportID, accountIDsToUpdate, role);
        setSelectedMembers([]);
    }, [report, selectedMembers, setSelectedMembers]);
    /**
     * Toggle user from the selectedMembers list
     */
    var toggleUser = (0, react_1.useCallback)(function (user) {
        if (user.accountID === currentUserAccountID) {
            return;
        }
        // Add or remove the user if the checkbox is enabled
        if (selectedMembers.includes(user.accountID)) {
            removeUser(user.accountID);
        }
        else {
            addUser(user.accountID);
        }
    }, [selectedMembers, addUser, removeUser, currentUserAccountID]);
    var customListHeader = (0, react_1.useMemo)(function () {
        var header = (<react_native_1.View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween]}>
                <react_native_1.View>
                    <Text_1.default style={[styles.textMicroSupporting, canSelectMultiple ? styles.ml3 : styles.ml0]}>{translate('common.member')}</Text_1.default>
                </react_native_1.View>
                {isGroupChat && (<react_native_1.View style={[StyleUtils.getMinimumWidth(60)]}>
                        <Text_1.default style={[styles.textMicroSupporting, styles.textAlignCenter]}>{translate('common.role')}</Text_1.default>
                    </react_native_1.View>)}
            </react_native_1.View>);
        if (canSelectMultiple) {
            return header;
        }
        return <react_native_1.View style={[styles.peopleRow, styles.userSelectNone, styles.ph9, styles.pb5, shouldShowTextInput ? styles.mt3 : styles.mt0]}>{header}</react_native_1.View>;
    }, [styles, translate, isGroupChat, shouldShowTextInput, StyleUtils, canSelectMultiple]);
    var bulkActionsButtonOptions = (0, react_1.useMemo)(function () {
        var options = [
            {
                text: translate('workspace.people.removeMembersTitle', { count: selectedMembers.length }),
                value: CONST_1.default.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
                icon: Expensicons_1.RemoveMembers,
                onSelected: function () { return setRemoveMembersConfirmModalVisible(true); },
            },
        ];
        var isAtLeastOneAdminSelected = selectedMembers.some(function (accountId) { var _a, _b; return ((_b = (_a = report.participants) === null || _a === void 0 ? void 0 : _a[accountId]) === null || _b === void 0 ? void 0 : _b.role) === CONST_1.default.REPORT.ROLE.ADMIN; });
        if (isAtLeastOneAdminSelected) {
            options.push({
                text: translate('workspace.people.makeMember'),
                value: CONST_1.default.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_MEMBER,
                icon: Expensicons_1.User,
                onSelected: function () { return changeUserRole(CONST_1.default.REPORT.ROLE.MEMBER); },
            });
        }
        var isAtLeastOneMemberSelected = selectedMembers.some(function (accountId) { var _a, _b; return ((_b = (_a = report.participants) === null || _a === void 0 ? void 0 : _a[accountId]) === null || _b === void 0 ? void 0 : _b.role) === CONST_1.default.REPORT.ROLE.MEMBER; });
        if (isAtLeastOneMemberSelected) {
            options.push({
                text: translate('workspace.people.makeAdmin'),
                value: CONST_1.default.POLICY.MEMBERS_BULK_ACTION_TYPES.MAKE_ADMIN,
                icon: Expensicons_1.MakeAdmin,
                onSelected: function () { return changeUserRole(CONST_1.default.REPORT.ROLE.ADMIN); },
            });
        }
        return options;
    }, [changeUserRole, translate, setRemoveMembersConfirmModalVisible, selectedMembers, report.participants]);
    var headerButtons = (0, react_1.useMemo)(function () {
        if (!isGroupChat) {
            return;
        }
        return (<react_native_1.View style={styles.w100}>
                {(isSmallScreenWidth ? canSelectMultiple : selectedMembers.length > 0) ? (<ButtonWithDropdownMenu_1.default shouldAlwaysShowDropdownMenu pressOnEnter customText={translate('workspace.common.selected', { count: selectedMembers.length })} buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} onPress={function () { return null; }} isSplitButton={false} options={bulkActionsButtonOptions} style={[shouldUseNarrowLayout && styles.flexGrow1]} isDisabled={!selectedMembers.length}/>) : (<Button_1.default success onPress={inviteUser} text={translate('workspace.invite.member')} icon={Expensicons_1.Plus} innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]} style={[shouldUseNarrowLayout && styles.flexGrow1]}/>)}
            </react_native_1.View>);
    }, [bulkActionsButtonOptions, inviteUser, isSmallScreenWidth, selectedMembers, styles, translate, isGroupChat, canSelectMultiple, shouldUseNarrowLayout]);
    /** Opens the member details page */
    var openMemberDetails = (0, react_1.useCallback)(function (item) {
        if (isGroupChat && isCurrentUserAdmin) {
            Navigation_1.default.navigate(ROUTES_1.default.REPORT_PARTICIPANTS_DETAILS.getRoute(report.reportID, item.accountID, backTo));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(item.accountID, Navigation_1.default.getActiveRoute()));
    }, [report, isCurrentUserAdmin, isGroupChat, backTo]);
    var headerTitle = (0, react_1.useMemo)(function () {
        if ((0, ReportUtils_1.isChatRoom)(report) || (0, ReportUtils_1.isPolicyExpenseChat)(report) || (0, ReportUtils_1.isChatThread)(report) || (0, ReportUtils_1.isTaskReport)(report) || (0, ReportUtils_1.isMoneyRequestReport)(report) || isGroupChat) {
            return translate('common.members');
        }
        return translate('common.details');
    }, [report, translate, isGroupChat]);
    var selectionModeHeader = (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && isSmallScreenWidth;
    // eslint-disable-next-line rulesdir/no-negated-variables
    var memberNotFoundMessage = isGroupChat
        ? "".concat(translate('roomMembersPage.memberNotFound'), " ").concat(translate('roomMembersPage.useInviteButton'))
        : translate('roomMembersPage.memberNotFound');
    var headerMessage = searchValue.trim() && !participants.length ? memberNotFoundMessage : '';
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} style={[styles.defaultModalContainer]} testID={ReportParticipantsPage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={!report || (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived) || (0, ReportUtils_1.isSelfDM)(report)}>
                <HeaderWithBackButton_1.default title={selectionModeHeader ? translate('common.selectMultiple') : headerTitle} onBackButtonPress={function () {
            if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                setSelectedMembers([]);
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
                return;
            }
            if (report) {
                setSearchValue('');
                Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
            }
        }} subtitle={StringUtils_1.default.lineBreaksToSpaces((0, ReportUtils_1.getReportName)(report, undefined, undefined, undefined, undefined, reportAttributes))}/>
                <react_native_1.View style={[styles.pl5, styles.pr5]}>{headerButtons}</react_native_1.View>
                <ConfirmModal_1.default danger title={translate('workspace.people.removeMembersTitle', { count: selectedMembers.length })} isVisible={removeMembersConfirmModalVisible} onConfirm={removeUsers} onCancel={function () { return setRemoveMembersConfirmModalVisible(false); }} prompt={translate('workspace.people.removeMembersPrompt', {
            count: selectedMembers.length,
            memberName: formatPhoneNumber((_c = (_b = (0, PersonalDetailsUtils_1.getPersonalDetailsByIDs)({ accountIDs: selectedMembers, currentUserAccountID: currentUserAccountID }).at(0)) === null || _b === void 0 ? void 0 : _b.displayName) !== null && _c !== void 0 ? _c : ''),
        })} confirmText={translate('common.remove')} cancelText={translate('common.cancel')} onModalHide={function () {
            react_native_1.InteractionManager.runAfterInteractions(function () {
                if (!textInputRef.current) {
                    return;
                }
                textInputRef.current.focus();
            });
        }}/>
                <react_native_1.View style={[styles.w100, isGroupChat ? styles.mt3 : styles.mt0, styles.flex1]}>
                    <SelectionListWithModal_1.default ref={selectionListRef} canSelectMultiple={canSelectMultiple} turnOnSelectionModeOnLongPress={isCurrentUserAdmin && isGroupChat} onTurnOnSelectionMode={function (item) { return item && toggleUser(item); }} sections={[{ data: participants }]} shouldShowTextInput={shouldShowTextInput} textInputLabel={translate('selectionList.findMember')} textInputValue={searchValue} onChangeText={setSearchValue} headerMessage={headerMessage} ListItem={TableListItem_1.default} onSelectRow={openMemberDetails} shouldSingleExecuteRowSelect={!(isGroupChat && isCurrentUserAdmin)} onCheckboxPress={function (item) { return toggleUser(item); }} onSelectAll={function () { return toggleAllUsers(participants); }} showScrollIndicator textInputRef={textInputRef} customListHeader={customListHeader} listHeaderWrapperStyle={[styles.ph9, styles.mt3]}/>
                </react_native_1.View>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
ReportParticipantsPage.displayName = 'ReportParticipantsPage';
exports.default = (0, withReportOrNotFound_1.default)()(ReportParticipantsPage);
