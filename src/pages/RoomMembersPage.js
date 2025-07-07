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
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var Button_1 = require("@components/Button");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var OnyxProvider_1 = require("@components/OnyxProvider");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TableListItem_1 = require("@components/SelectionList/TableListItem");
var SelectionListWithModal_1 = require("@components/SelectionListWithModal");
var Text_1 = require("@components/Text");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useFilteredSelection_1 = require("@hooks/useFilteredSelection");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSearchBackPress_1 = require("@hooks/useSearchBackPress");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var RoomMembersUserSearchPhrase_1 = require("@libs/actions/RoomMembersUserSearchPhrase");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var StringUtils_1 = require("@libs/StringUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var withReportOrNotFound_1 = require("./home/report/withReportOrNotFound");
function RoomMembersPage(_a) {
    var _b, _c;
    var report = _a.report, policy = _a.policy;
    var route = (0, native_1.useRoute)();
    var styles = (0, useThemeStyles_1.default)();
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var reportMetadata = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID), { canBeMissing: false })[0];
    var currentUserAccountID = Number(session === null || session === void 0 ? void 0 : session.accountID);
    var _d = (0, useLocalize_1.default)(), formatPhoneNumber = _d.formatPhoneNumber, translate = _d.translate;
    var _e = (0, react_1.useState)(false), removeMembersConfirmModalVisible = _e[0], setRemoveMembersConfirmModalVisible = _e[1];
    var userSearchPhrase = (0, useOnyx_1.default)(ONYXKEYS_1.default.ROOM_MEMBERS_USER_SEARCH_PHRASE, { canBeMissing: true })[0];
    var _f = (0, react_1.useState)(''), searchValue = _f[0], setSearchValue = _f[1];
    var _g = (0, react_1.useState)(false), didLoadRoomMembers = _g[0], setDidLoadRoomMembers = _g[1];
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var isPolicyExpenseChat = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isPolicyExpenseChat)(report); }, [report]);
    var backTo = route.params.backTo;
    var _h = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.getReportPersonalDetailsParticipants)(report, personalDetails, reportMetadata, true); }, [report, personalDetails, reportMetadata]), participants = _h.chatParticipants, personalDetailsParticipants = _h.personalDetailsParticipants;
    var shouldIncludeMember = (0, react_1.useCallback)(function (participant) {
        var _a;
        if (!participant) {
            return false;
        }
        var isInParticipants = participants.includes(participant.accountID);
        var pendingChatMember = (_a = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) === null || _a === void 0 ? void 0 : _a.find(function (member) { return member.accountID === participant.accountID.toString(); });
        var isPendingDelete = (pendingChatMember === null || pendingChatMember === void 0 ? void 0 : pendingChatMember.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        // Keep the member only if they're still in the room and not pending removal
        return isInParticipants && !isPendingDelete;
    }, [participants, reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers]);
    var _j = (0, useFilteredSelection_1.default)(personalDetailsParticipants, shouldIncludeMember), selectedMembers = _j[0], setSelectedMembers = _j[1];
    var isFocusedScreen = (0, native_1.useIsFocused)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the selection mode only on small screens
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _k = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _k.shouldUseNarrowLayout, isSmallScreenWidth = _k.isSmallScreenWidth;
    var selectionMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.MOBILE_SELECTION_MODE, { canBeMissing: true })[0];
    var canSelectMultiple = isSmallScreenWidth ? selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled : true;
    /**
     * Get members for the current room
     */
    var getRoomMembers = (0, react_1.useCallback)(function () {
        if (!report) {
            return;
        }
        (0, Report_1.openRoomMembersPage)(report.reportID);
        setDidLoadRoomMembers(true);
    }, [report]);
    (0, react_1.useEffect)(function () {
        (0, RoomMembersUserSearchPhrase_1.clearUserSearchPhrase)();
        getRoomMembers();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    /**
     * Open the modal to invite a user
     */
    var inviteUser = (0, react_1.useCallback)(function () {
        if (!report) {
            return;
        }
        setSearchValue('');
        Navigation_1.default.navigate(ROUTES_1.default.ROOM_INVITE.getRoute(report.reportID, backTo));
    }, [report, setSearchValue, backTo]);
    /**
     * Remove selected users from the room
     * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
     */
    var removeUsers = function () {
        if (report) {
            (0, Report_1.removeFromRoom)(report.reportID, selectedMembers);
        }
        setSearchValue('');
        setRemoveMembersConfirmModalVisible(false);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            setSelectedMembers([]);
            (0, RoomMembersUserSearchPhrase_1.clearUserSearchPhrase)();
        });
    };
    /**
     * Add user from the selectedMembers list
     */
    var addUser = (0, react_1.useCallback)(function (accountID) {
        setSelectedMembers(function (prevSelected) { return __spreadArray(__spreadArray([], prevSelected, true), [accountID], false); });
    }, [setSelectedMembers]);
    /**
     * Remove user from the selectedEmployees list
     */
    var removeUser = (0, react_1.useCallback)(function (accountID) {
        setSelectedMembers(function (prevSelected) { return prevSelected.filter(function (id) { return id !== accountID; }); });
    }, [setSelectedMembers]);
    /** Toggle user from the selectedMembers list */
    var toggleUser = (0, react_1.useCallback)(function (_a) {
        var accountID = _a.accountID, pendingAction = _a.pendingAction;
        if (pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !accountID) {
            return;
        }
        // Add or remove the user if the checkbox is enabled
        if (selectedMembers.includes(accountID)) {
            removeUser(accountID);
        }
        else {
            addUser(accountID);
        }
    }, [selectedMembers, addUser, removeUser]);
    /** Add or remove all users passed from the selectedMembers list */
    var toggleAllUsers = function (memberList) {
        var enabledAccounts = memberList.filter(function (member) { return !member.isDisabled && !member.isDisabledCheckbox; });
        var someSelected = enabledAccounts.some(function (member) {
            if (!member.accountID) {
                return false;
            }
            return selectedMembers.includes(member.accountID);
        });
        if (someSelected) {
            setSelectedMembers([]);
        }
        else {
            var everyAccountId = enabledAccounts.map(function (member) { return member.accountID; }).filter(function (accountID) { return !!accountID; });
            setSelectedMembers(everyAccountId);
        }
    };
    /** Include the search bar when there are 8 or more active members in the selection list */
    var shouldShowTextInput = (0, react_1.useMemo)(function () {
        // Get the active chat members by filtering out the pending members with delete action
        var activeParticipants = participants.filter(function (accountID) {
            var _a;
            var pendingMember = (_a = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) === null || _a === void 0 ? void 0 : _a.findLast(function (member) { return member.accountID === accountID.toString(); });
            if (!(personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID])) {
                return false;
            }
            // When offline, we want to include the pending members with delete action as they are displayed in the list as well
            return !pendingMember || isOffline || pendingMember.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        });
        return activeParticipants.length >= CONST_1.default.STANDARD_LIST_ITEM_LIMIT;
    }, [participants, reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers, personalDetails, isOffline]);
    (0, react_1.useEffect)(function () {
        if (!isFocusedScreen || !shouldShowTextInput) {
            return;
        }
        setSearchValue(userSearchPhrase !== null && userSearchPhrase !== void 0 ? userSearchPhrase : '');
    }, [isFocusedScreen, shouldShowTextInput, userSearchPhrase]);
    (0, react_1.useEffect)(function () {
        (0, RoomMembersUserSearchPhrase_1.updateUserSearchPhrase)(searchValue);
    }, [searchValue]);
    (0, react_1.useEffect)(function () {
        if (!isFocusedScreen) {
            return;
        }
        if (shouldShowTextInput) {
            setSearchValue(userSearchPhrase !== null && userSearchPhrase !== void 0 ? userSearchPhrase : '');
        }
        else {
            (0, RoomMembersUserSearchPhrase_1.clearUserSearchPhrase)();
            setSearchValue('');
        }
    }, [isFocusedScreen, setSearchValue, shouldShowTextInput, userSearchPhrase]);
    (0, useSearchBackPress_1.default)({
        onClearSelection: function () { return setSelectedMembers([]); },
        onNavigationCallBack: function () {
            setSearchValue('');
            Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
        },
    });
    var data = (0, react_1.useMemo)(function () {
        var result = [];
        participants.forEach(function (accountID) {
            var _a, _b, _c;
            var details = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
            // If search value is provided, filter out members that don't match the search value
            if (!details || (searchValue.trim() && !(0, OptionsListUtils_1.isSearchStringMatchUserDetails)(details, searchValue))) {
                return;
            }
            var pendingChatMember = (_a = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) === null || _a === void 0 ? void 0 : _a.findLast(function (member) { return member.accountID === accountID.toString(); });
            var isAdmin = (0, PolicyUtils_1.isUserPolicyAdmin)(policy, details.login);
            var isDisabled = (pendingChatMember === null || pendingChatMember === void 0 ? void 0 : pendingChatMember.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || details.isOptimisticPersonalDetail;
            var isDisabledCheckbox = (isPolicyExpenseChat && isAdmin) ||
                accountID === (session === null || session === void 0 ? void 0 : session.accountID) ||
                (pendingChatMember === null || pendingChatMember === void 0 ? void 0 : pendingChatMember.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                details.accountID === report.ownerAccountID;
            result.push({
                keyForList: String(accountID),
                accountID: accountID,
                isSelected: selectedMembers.includes(accountID),
                isDisabled: isDisabled,
                isDisabledCheckbox: isDisabledCheckbox,
                text: formatPhoneNumber((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(details)),
                alternateText: (details === null || details === void 0 ? void 0 : details.login) ? formatPhoneNumber(details.login) : '',
                icons: [
                    {
                        source: (_b = details.avatar) !== null && _b !== void 0 ? _b : Expensicons_1.FallbackAvatar,
                        name: (_c = details.login) !== null && _c !== void 0 ? _c : '',
                        type: CONST_1.default.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                pendingAction: pendingChatMember === null || pendingChatMember === void 0 ? void 0 : pendingChatMember.pendingAction,
                errors: pendingChatMember === null || pendingChatMember === void 0 ? void 0 : pendingChatMember.errors,
            });
        });
        result = result.sort(function (value1, value2) { var _a, _b; return (0, LocaleCompare_1.default)((_a = value1.text) !== null && _a !== void 0 ? _a : '', (_b = value2.text) !== null && _b !== void 0 ? _b : ''); });
        return result;
    }, [
        formatPhoneNumber,
        isPolicyExpenseChat,
        participants,
        personalDetails,
        policy,
        report.ownerAccountID,
        reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers,
        searchValue,
        selectedMembers,
        session === null || session === void 0 ? void 0 : session.accountID,
    ]);
    var dismissError = (0, react_1.useCallback)(function (item) {
        (0, Report_1.clearAddRoomMemberError)(report.reportID, String(item.accountID));
    }, [report.reportID]);
    var isPolicyEmployee = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.isPolicyEmployee)(report.policyID, policy); }, [report === null || report === void 0 ? void 0 : report.policyID, policy]);
    var headerMessage = searchValue.trim() && !data.length ? "".concat(translate('roomMembersPage.memberNotFound'), " ").concat(translate('roomMembersPage.useInviteButton')) : '';
    var bulkActionsButtonOptions = (0, react_1.useMemo)(function () {
        var options = [
            {
                text: translate('workspace.people.removeMembersTitle', { count: selectedMembers.length }),
                value: CONST_1.default.POLICY.MEMBERS_BULK_ACTION_TYPES.REMOVE,
                icon: Expensicons_1.RemoveMembers,
                onSelected: function () { return setRemoveMembersConfirmModalVisible(true); },
            },
        ];
        return options;
    }, [translate, selectedMembers.length]);
    var headerButtons = (0, react_1.useMemo)(function () {
        return (<react_native_1.View style={styles.w100}>
                {(isSmallScreenWidth ? canSelectMultiple : selectedMembers.length > 0) ? (<ButtonWithDropdownMenu_1.default shouldAlwaysShowDropdownMenu pressOnEnter customText={translate('workspace.common.selected', { count: selectedMembers.length })} buttonSize={CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} onPress={function () { return null; }} options={bulkActionsButtonOptions} isSplitButton={false} style={[shouldUseNarrowLayout && styles.flexGrow1]} isDisabled={!selectedMembers.length}/>) : (<Button_1.default success onPress={inviteUser} text={translate('workspace.invite.member')} icon={Expensicons_1.Plus} innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]} style={[shouldUseNarrowLayout && styles.flexGrow1]}/>)}
            </react_native_1.View>);
    }, [bulkActionsButtonOptions, inviteUser, isSmallScreenWidth, selectedMembers, styles, translate, canSelectMultiple, shouldUseNarrowLayout]);
    /** Opens the room member details page */
    var openRoomMemberDetails = (0, react_1.useCallback)(function (item) {
        if (!(item === null || item === void 0 ? void 0 : item.accountID)) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.ROOM_MEMBER_DETAILS.getRoute(report.reportID, item === null || item === void 0 ? void 0 : item.accountID, backTo));
    }, [report, backTo]);
    var selectionModeHeader = (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && isSmallScreenWidth;
    var customListHeader = (0, react_1.useMemo)(function () {
        var header = (<react_native_1.View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween]}>
                <react_native_1.View>
                    <Text_1.default style={[styles.textMicroSupporting, canSelectMultiple ? styles.ml3 : styles.ml0]}>{translate('common.member')}</Text_1.default>
                </react_native_1.View>
            </react_native_1.View>);
        if (canSelectMultiple) {
            return header;
        }
        return <react_native_1.View style={[styles.peopleRow, styles.userSelectNone, styles.ph9, styles.pb5, styles.mt3]}>{header}</react_native_1.View>;
    }, [styles, translate, canSelectMultiple]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} style={[styles.defaultModalContainer]} testID={RoomMembersPage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={(0, EmptyObject_1.isEmptyObject)(report) || (!(0, ReportUtils_1.isChatThread)(report) && (((0, ReportUtils_1.isUserCreatedPolicyRoom)(report) && !isPolicyEmployee) || (0, ReportUtils_1.isDefaultRoom)(report)))} subtitleKey={(0, EmptyObject_1.isEmptyObject)(report) ? undefined : 'roomMembersPage.notAuthorized'} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
        }}>
                <HeaderWithBackButton_1.default title={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.common.members')} subtitle={StringUtils_1.default.lineBreaksToSpaces((0, ReportUtils_1.getReportName)(report))} onBackButtonPress={function () {
            if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                setSelectedMembers([]);
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
                return;
            }
            setSearchValue('');
            Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
        }}/>
                <react_native_1.View style={[styles.pl5, styles.pr5]}>{headerButtons}</react_native_1.View>
                <ConfirmModal_1.default danger title={translate('workspace.people.removeMembersTitle', { count: selectedMembers.length })} isVisible={removeMembersConfirmModalVisible} onConfirm={removeUsers} onCancel={function () { return setRemoveMembersConfirmModalVisible(false); }} prompt={translate('roomMembersPage.removeMembersPrompt', {
            count: selectedMembers.length,
            memberName: formatPhoneNumber((_c = (_b = (0, PersonalDetailsUtils_1.getPersonalDetailsByIDs)({ accountIDs: selectedMembers, currentUserAccountID: currentUserAccountID }).at(0)) === null || _b === void 0 ? void 0 : _b.displayName) !== null && _c !== void 0 ? _c : ''),
        })} confirmText={translate('common.remove')} cancelText={translate('common.cancel')}/>
                <react_native_1.View style={[styles.w100, styles.mt3, styles.flex1]}>
                    <SelectionListWithModal_1.default canSelectMultiple={canSelectMultiple} sections={[{ data: data, isDisabled: false }]} shouldShowTextInput={shouldShowTextInput} textInputLabel={translate('selectionList.findMember')} disableKeyboardShortcuts={removeMembersConfirmModalVisible} textInputValue={searchValue} onChangeText={setSearchValue} headerMessage={headerMessage} turnOnSelectionModeOnLongPress onTurnOnSelectionMode={function (item) { return item && toggleUser(item); }} onCheckboxPress={function (item) { return toggleUser(item); }} onSelectRow={openRoomMemberDetails} onSelectAll={function () { return toggleAllUsers(data); }} showLoadingPlaceholder={!(0, OptionsListUtils_1.isPersonalDetailsReady)(personalDetails) || !didLoadRoomMembers} showScrollIndicator shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} listHeaderWrapperStyle={[styles.ph9, styles.mt3]} customListHeader={customListHeader} ListItem={TableListItem_1.default} onDismissError={dismissError}/>
                </react_native_1.View>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
RoomMembersPage.displayName = 'RoomMembersPage';
exports.default = (0, withReportOrNotFound_1.default)()((0, withCurrentUserPersonalDetails_1.default)(RoomMembersPage));
