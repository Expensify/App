"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Checkbox_1 = require("@components/Checkbox");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var UserDetailsTooltip_1 = require("@components/UserDetailsTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var CONST_1 = require("@src/CONST");
function MemberListItemHeader(_a) {
    var memberItem = _a.member, onCheckboxPress = _a.onCheckboxPress, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useMemo)(function () { var _a; return [(0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(memberItem)), (0, LocalePhoneNumber_1.formatPhoneNumber)((_a = memberItem.login) !== null && _a !== void 0 ? _a : '')]; }, [memberItem]), formattedDisplayName = _b[0], formattedLogin = _b[1];
    // s77rt add total cell, action cell and collapse/expand button
    return (<react_native_1.View>
            <react_native_1.View style={[styles.pv1Half, styles.ph3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (<Checkbox_1.default onPress={function () { return onCheckboxPress === null || onCheckboxPress === void 0 ? void 0 : onCheckboxPress(memberItem); }} isChecked={memberItem.isSelected} disabled={!!isDisabled || memberItem.isDisabledCheckbox} accessibilityLabel={translate('common.select')}/>)}
                    <react_native_1.View style={[styles.flexRow, styles.gap3]}>
                        <UserDetailsTooltip_1.default accountID={memberItem.accountID}>
                            <react_native_1.View>
                                <Avatar_1.default source={memberItem.avatar} type={CONST_1.default.ICON_TYPE_AVATAR} name={formattedDisplayName} avatarID={memberItem.accountID}/>
                            </react_native_1.View>
                        </UserDetailsTooltip_1.default>
                        <react_native_1.View style={[styles.gapHalf]}>
                            <TextWithTooltip_1.default text={formattedDisplayName} style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre]}/>
                            <TextWithTooltip_1.default text={formattedLogin || formattedDisplayName} style={[styles.textLabelSupporting, styles.lh16, styles.pre]}/>
                        </react_native_1.View>
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={[styles.pv2, styles.ph3]}>
                <react_native_1.View style={[styles.borderBottom]}/>
            </react_native_1.View>
        </react_native_1.View>);
}
MemberListItemHeader.displayName = 'MemberListItemHeader';
exports.default = MemberListItemHeader;
