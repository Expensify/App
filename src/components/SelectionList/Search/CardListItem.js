"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Checkbox_1 = require("@components/Checkbox");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var BaseListItem_1 = require("@components/SelectionList/BaseListItem");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var UserDetailsTooltip_1 = require("@components/UserDetailsTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function CardListItem(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple, onSelectRow = _a.onSelectRow, onCheckboxPress = _a.onCheckboxPress, onDismissError = _a.onDismissError, rightHandSideComponent = _a.rightHandSideComponent, onFocus = _a.onFocus, shouldSyncFocus = _a.shouldSyncFocus;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var handleCheckboxPress = (0, react_1.useCallback)(function () {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        }
        else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);
    var ownersAvatar = {
        source: (_c = (_b = item.cardOwnerPersonalDetails) === null || _b === void 0 ? void 0 : _b.avatar) !== null && _c !== void 0 ? _c : Expensicons_1.FallbackAvatar,
        id: (_e = (_d = item.cardOwnerPersonalDetails) === null || _d === void 0 ? void 0 : _d.accountID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID,
        type: CONST_1.default.ICON_TYPE_AVATAR,
        name: (_g = (_f = item.cardOwnerPersonalDetails) === null || _f === void 0 ? void 0 : _f.displayName) !== null && _g !== void 0 ? _g : '',
        fallbackIcon: (_h = item.cardOwnerPersonalDetails) === null || _h === void 0 ? void 0 : _h.fallbackIcon,
    };
    var subtitleText = "".concat(item.lastFourPAN ? "".concat(item.lastFourPAN) : '') +
        "".concat(item.cardName ? " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(item.cardName) : '') +
        "".concat(item.isVirtual ? " ".concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate('workspace.expensifyCard.virtual')) : '');
    return (<BaseListItem_1.default item={item} wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow]} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple={canSelectMultiple} onSelectRow={onSelectRow} onDismissError={onDismissError} rightHandSideComponent={rightHandSideComponent} errors={item.errors} pendingAction={item.pendingAction} keyForList={item.keyForList} onFocus={onFocus} shouldSyncFocus={shouldSyncFocus}>
            <>
                {!!item.bankIcon && (<react_native_1.View style={[styles.mr3]}>
                        {item.shouldShowOwnersAvatar ? (<react_native_1.View>
                                <UserDetailsTooltip_1.default shouldRender={showTooltip} accountID={Number((_k = (_j = item.cardOwnerPersonalDetails) === null || _j === void 0 ? void 0 : _j.accountID) !== null && _k !== void 0 ? _k : CONST_1.default.DEFAULT_NUMBER_ID)} icon={ownersAvatar} fallbackUserDetails={{
                    displayName: (_l = item.cardOwnerPersonalDetails) === null || _l === void 0 ? void 0 : _l.displayName,
                }}>
                                    <react_native_1.View>
                                        <Avatar_1.default containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST_1.default.AVATAR_SIZE.DEFAULT))} source={ownersAvatar.source} name={ownersAvatar.name} avatarID={ownersAvatar.id} type={CONST_1.default.ICON_TYPE_AVATAR} fallbackIcon={ownersAvatar.fallbackIcon}/>
                                    </react_native_1.View>
                                </UserDetailsTooltip_1.default>
                                <react_native_1.View style={[styles.cardItemSecondaryIconStyle, StyleUtils.getBorderColorStyle(theme.componentBG)]}>
                                    <Icon_1.default src={item.bankIcon.icon} width={variables_1.default.cardMiniatureWidth} height={variables_1.default.cardMiniatureHeight} additionalStyles={styles.cardMiniature}/>
                                </react_native_1.View>
                            </react_native_1.View>) : (<Icon_1.default src={item.bankIcon.icon} width={variables_1.default.cardIconWidth} height={variables_1.default.cardIconHeight} additionalStyles={styles.cardIcon}/>)}
                    </react_native_1.View>)}
                <react_native_1.View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                    <react_native_1.View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                        <TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={expensify_common_1.Str.removeSMSDomain((_m = item.text) !== null && _m !== void 0 ? _m : '')} style={[
            styles.optionDisplayName,
            isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
            item.isBold !== false && styles.sidebarLinkTextBold,
            styles.pre,
            item.alternateText ? styles.mb1 : null,
        ]}/>
                        {!!subtitleText && (<TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={subtitleText} style={[styles.textLabelSupporting, styles.lh16, styles.pre]}/>)}
                    </react_native_1.View>
                </react_native_1.View>
                {!!canSelectMultiple && !item.isDisabled && (<Checkbox_1.default shouldSelectOnPressEnter isChecked={(_o = item.isSelected) !== null && _o !== void 0 ? _o : false} accessibilityLabel={(_p = item.text) !== null && _p !== void 0 ? _p : ''} onPress={handleCheckboxPress} disabled={!!isDisabled} style={styles.ml3}/>)}
            </>
        </BaseListItem_1.default>);
}
CardListItem.displayName = 'CardListItem';
exports.default = CardListItem;
