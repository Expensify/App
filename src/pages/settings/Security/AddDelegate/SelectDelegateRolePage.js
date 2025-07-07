"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SelectDelegateRolePage(_a) {
    var _b;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var login = route.params.login;
    var styles = (0, useThemeStyles_1.default)();
    var roleOptions = Object.values(CONST_1.default.DELEGATE_ROLE).map(function (role) { return ({
        value: role,
        text: translate('delegate.role', { role: role }),
        alternateText: translate('delegate.roleDescription', { role: role }),
        isSelected: role === route.params.role,
        keyForList: role,
    }); });
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={SelectDelegateRolePage.displayName}>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('delegate.accessLevel')} onBackButtonPress={function () { var _a, _b; return Navigation_1.default.goBack((_b = (_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo) !== null && _b !== void 0 ? _b : ROUTES_1.default.SETTINGS_ADD_DELEGATE); }}/>
                <SelectionList_1.default isAlternateTextMultilineSupported alternateTextNumberOfLines={4} initiallyFocusedOptionKey={(_b = roleOptions.find(function (role) { return role.isSelected; })) === null || _b === void 0 ? void 0 : _b.keyForList} shouldUpdateFocusedIndex headerContent={<Text_1.default style={[styles.ph5, styles.pb5, styles.pt3]}>
                            <>
                                {translate('delegate.accessLevelDescription')}{' '}
                                <TextLink_1.default style={[styles.link]} href={CONST_1.default.COPILOT_HELP_URL}>
                                    {translate('common.learnMore')}
                                </TextLink_1.default>
                            </>
                        </Text_1.default>} onSelectRow={function (option) {
            Navigation_1.default.setParams({
                role: option.value,
            });
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_DELEGATE_CONFIRM.getRoute(login, option.value));
        }} sections={[{ data: roleOptions }]} ListItem={RadioListItem_1.default}/>
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
SelectDelegateRolePage.displayName = 'SelectDelegateRolePage';
exports.default = SelectDelegateRolePage;
