"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Delegate_1 = require("@libs/actions/Delegate");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var UpdateDelegateMagicCodeModal_1 = require("./UpdateDelegateMagicCodeModal");
function UpdateDelegateRolePage(_a) {
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var login = route.params.login;
    var currentRole = route.params.currentRole;
    var showValidateActionModalFromURL = route.params.showValidateActionModal === 'true';
    var newRoleFromURL = route.params.newRole;
    var _b = (0, react_1.useState)(showValidateActionModalFromURL !== null && showValidateActionModalFromURL !== void 0 ? showValidateActionModalFromURL : false), isValidateCodeActionModalVisible = _b[0], setIsValidateCodeActionModalVisible = _b[1];
    var _c = (0, react_1.useState)(newRoleFromURL), newRole = _c[0], setNewRole = _c[1];
    var _d = (0, react_1.useState)(showValidateActionModalFromURL !== null && showValidateActionModalFromURL !== void 0 ? showValidateActionModalFromURL : false), shouldShowLoading = _d[0], setShouldShowLoading = _d[1];
    (0, react_1.useEffect)(function () {
        Navigation_1.default.setParams({ showValidateActionModal: isValidateCodeActionModalVisible, newRole: newRole });
    }, [isValidateCodeActionModalVisible, newRole]);
    var styles = (0, useThemeStyles_1.default)();
    var roleOptions = Object.values(CONST_1.default.DELEGATE_ROLE).map(function (role) { return ({
        value: role,
        text: translate('delegate.role', { role: role }),
        keyForList: role,
        alternateText: translate('delegate.roleDescription', { role: role }),
        isSelected: role === currentRole,
    }); });
    (0, useBeforeRemove_1.default)(function () { return setIsValidateCodeActionModalVisible(false); });
    (0, react_1.useEffect)(function () {
        (0, Delegate_1.updateDelegateRoleOptimistically)(login !== null && login !== void 0 ? login : '', currentRole);
        return function () { return (0, Delegate_1.clearDelegateRolePendingAction)(login); };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [login]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={UpdateDelegateRolePage.displayName}>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('delegate.accessLevel')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <SelectionList_1.default isAlternateTextMultilineSupported alternateTextNumberOfLines={4} initiallyFocusedOptionKey={currentRole} shouldUpdateFocusedIndex headerContent={<Text_1.default style={[styles.ph5, styles.pb5, styles.pt3]}>
                            <>
                                {translate('delegate.accessLevelDescription')}{' '}
                                <TextLink_1.default style={[styles.link]} href={CONST_1.default.COPILOT_HELP_URL}>
                                    {translate('common.learnMore')}
                                </TextLink_1.default>
                            </>
                        </Text_1.default>} onSelectRow={function (option) {
            if (option.isSelected) {
                Navigation_1.default.dismissModal();
                return;
            }
            setNewRole(option === null || option === void 0 ? void 0 : option.value);
            setIsValidateCodeActionModalVisible(true);
        }} sections={[{ data: roleOptions }]} ListItem={RadioListItem_1.default}/>
                {!!newRole && (<UpdateDelegateMagicCodeModal_1.default login={login} role={newRole} isValidateCodeActionModalVisible={isValidateCodeActionModalVisible} onClose={function () {
                setShouldShowLoading(false);
                setIsValidateCodeActionModalVisible(false);
            }}/>)}
            </DelegateNoAccessWrapper_1.default>
            {shouldShowLoading && <FullscreenLoadingIndicator_1.default />}
        </ScreenWrapper_1.default>);
}
UpdateDelegateRolePage.displayName = 'UpdateDelegateRolePage';
exports.default = UpdateDelegateRolePage;
