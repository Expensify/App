"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AvatarWithImagePicker_1 = require("@components/AvatarWithImagePicker");
var Badge_1 = require("@components/Badge");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var InviteMemberListItem_1 = require("@components/SelectionList/InviteMemberListItem");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function navigateBack() {
    Navigation_1.default.goBack(ROUTES_1.default.NEW_CHAT);
}
function navigateToEditChatName() {
    Navigation_1.default.navigate(ROUTES_1.default.NEW_CHAT_EDIT_NAME);
}
function NewChatConfirmPage() {
    var optimisticReportID = (0, react_1.useRef)((0, ReportUtils_1.generateReportID)());
    var _a = (0, react_1.useState)(), avatarFile = _a[0], setAvatarFile = _a[1];
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var personalData = (0, useCurrentUserPersonalDetails_1.default)();
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.NEW_GROUP_CHAT_DRAFT), newGroupDraft = _b[0], newGroupDraftMetaData = _b[1];
    var allPersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST)[0];
    var selectedOptions = (0, react_1.useMemo)(function () {
        if (!(newGroupDraft === null || newGroupDraft === void 0 ? void 0 : newGroupDraft.participants)) {
            return [];
        }
        var options = newGroupDraft.participants.map(function (participant) {
            return (0, OptionsListUtils_1.getParticipantsOption)({ accountID: participant.accountID, login: participant === null || participant === void 0 ? void 0 : participant.login, reportID: '' }, allPersonalDetails);
        });
        return options;
    }, [allPersonalDetails, newGroupDraft === null || newGroupDraft === void 0 ? void 0 : newGroupDraft.participants]);
    var groupName = (newGroupDraft === null || newGroupDraft === void 0 ? void 0 : newGroupDraft.reportName) ? newGroupDraft === null || newGroupDraft === void 0 ? void 0 : newGroupDraft.reportName : (0, ReportUtils_1.getGroupChatName)(newGroupDraft === null || newGroupDraft === void 0 ? void 0 : newGroupDraft.participants);
    var sections = (0, react_1.useMemo)(function () {
        return selectedOptions
            .map(function (selectedOption) {
            var _a, _b, _c, _d;
            var accountID = selectedOption.accountID;
            var isAdmin = personalData.accountID === accountID;
            var section = {
                login: (_a = selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.login) !== null && _a !== void 0 ? _a : '',
                text: (_b = selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.text) !== null && _b !== void 0 ? _b : '',
                keyForList: (_c = selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.keyForList) !== null && _c !== void 0 ? _c : '',
                isSelected: !isAdmin,
                isDisabled: isAdmin,
                accountID: accountID,
                icons: selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.icons,
                alternateText: (_d = selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.login) !== null && _d !== void 0 ? _d : '',
                rightElement: isAdmin ? <Badge_1.default text={translate('common.admin')}/> : undefined,
            };
            return section;
        })
            .sort(function (a, b) { var _a, _b, _c, _d; return (_d = (_a = a.text) === null || _a === void 0 ? void 0 : _a.toLowerCase().localeCompare((_c = (_b = b.text) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : '')) !== null && _d !== void 0 ? _d : -1; });
    }, [selectedOptions, personalData.accountID, translate]);
    /**
     * Removes a selected option from list if already selected.
     */
    var unselectOption = (0, react_1.useCallback)(function (option) {
        var _a;
        if (!newGroupDraft) {
            return;
        }
        var newSelectedParticipants = ((_a = newGroupDraft.participants) !== null && _a !== void 0 ? _a : []).filter(function (participant) { return (participant === null || participant === void 0 ? void 0 : participant.login) !== option.login; });
        (0, Report_1.setGroupDraft)({ participants: newSelectedParticipants });
    }, [newGroupDraft]);
    var createGroup = (0, react_1.useCallback)(function () {
        var _a, _b, _c;
        if (!newGroupDraft) {
            return;
        }
        var logins = ((_a = newGroupDraft.participants) !== null && _a !== void 0 ? _a : []).map(function (participant) { return participant.login; }).filter(function (login) { return !!login; });
        (0, Report_1.navigateToAndOpenReport)(logins, true, (_b = newGroupDraft.reportName) !== null && _b !== void 0 ? _b : '', (_c = newGroupDraft.avatarUri) !== null && _c !== void 0 ? _c : '', avatarFile, optimisticReportID.current, true);
    }, [newGroupDraft, avatarFile]);
    var stashedLocalAvatarImage = newGroupDraft === null || newGroupDraft === void 0 ? void 0 : newGroupDraft.avatarUri;
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (!stashedLocalAvatarImage || (0, isLoadingOnyxValue_1.default)(newGroupDraftMetaData)) {
            return;
        }
        var onSuccess = function (file) {
            setAvatarFile(file);
        };
        var onFailure = function () {
            setAvatarFile(undefined);
            (0, Report_1.setGroupDraft)({ avatarUri: null, avatarFileName: null, avatarFileType: null });
        };
        // If the user navigates back to the member selection page and then returns to the confirmation page, the component will re-mount, causing avatarFile to be null.
        // To handle this, we re-read the avatar image file from disk whenever the component re-mounts.
        (0, FileUtils_1.readFileAsync)(stashedLocalAvatarImage, (_a = newGroupDraft === null || newGroupDraft === void 0 ? void 0 : newGroupDraft.avatarFileName) !== null && _a !== void 0 ? _a : '', onSuccess, onFailure, (_b = newGroupDraft === null || newGroupDraft === void 0 ? void 0 : newGroupDraft.avatarFileType) !== null && _b !== void 0 ? _b : '');
        // we only need to run this when the component re-mounted and when the onyx is loaded completely
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [newGroupDraftMetaData]);
    return (<ScreenWrapper_1.default testID={NewChatConfirmPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('common.group')} onBackButtonPress={navigateBack}/>
            <react_native_1.View style={styles.avatarSectionWrapper}>
                <AvatarWithImagePicker_1.default isUsingDefaultAvatar={!stashedLocalAvatarImage} 
    // eslint-disable-next-line react-compiler/react-compiler
    source={stashedLocalAvatarImage !== null && stashedLocalAvatarImage !== void 0 ? stashedLocalAvatarImage : (0, ReportUtils_1.getDefaultGroupAvatar)(optimisticReportID.current)} onImageSelected={function (image) {
            var _a, _b;
            setAvatarFile(image);
            (0, Report_1.setGroupDraft)({ avatarUri: (_a = image.uri) !== null && _a !== void 0 ? _a : '', avatarFileName: (_b = image.name) !== null && _b !== void 0 ? _b : '', avatarFileType: image.type });
        }} onImageRemoved={function () {
            setAvatarFile(undefined);
            (0, Report_1.setGroupDraft)({ avatarUri: null, avatarFileName: null, avatarFileType: null });
        }} size={CONST_1.default.AVATAR_SIZE.X_LARGE} avatarStyle={styles.avatarXLarge} shouldDisableViewPhoto editIcon={Expensicons.Camera} editIconStyle={styles.smallEditIconAccount} shouldUseStyleUtilityForAnchorPosition style={styles.w100}/>
            </react_native_1.View>
            <MenuItemWithTopDescription_1.default title={groupName} onPress={navigateToEditChatName} shouldShowRightIcon shouldCheckActionAllowedOnPress={false} description={translate('newRoomPage.groupName')} wrapperStyle={[styles.ph4]}/>
            <react_native_1.View style={[styles.flex1, styles.mt3]}>
                <SelectionList_1.default canSelectMultiple sections={[{ title: translate('common.members'), data: sections }]} ListItem={InviteMemberListItem_1.default} onSelectRow={unselectOption} showConfirmButton={!!selectedOptions.length} confirmButtonText={translate('newChatPage.startGroup')} onConfirm={createGroup} shouldHideListOnInitialRender={false}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
NewChatConfirmPage.displayName = 'NewChatConfirmPage';
exports.default = NewChatConfirmPage;
