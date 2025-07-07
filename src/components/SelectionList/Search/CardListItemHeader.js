"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Checkbox_1 = require("@components/Checkbox");
var SubscriptAvatar_1 = require("@components/SubscriptAvatar");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function CardListItemHeader(_a) {
    var _b, _c;
    var cardItem = _a.card, onCheckboxPress = _a.onCheckboxPress, isDisabled = _a.isDisabled, isHovered = _a.isHovered, isFocused = _a.isFocused, canSelectMultiple = _a.canSelectMultiple;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var illustrations = (0, useThemeIllustrations_1.default)();
    var formattedDisplayName = (0, react_1.useMemo)(function () { return (0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(cardItem)); }, [cardItem]);
    var _d = (0, react_1.useMemo)(function () {
        var avatar = {
            source: cardItem.avatar,
            type: CONST_1.default.ICON_TYPE_AVATAR,
            name: formattedDisplayName,
            id: cardItem.accountID,
        };
        var icon = {
            source: (0, CardUtils_1.getCardFeedIcon)(cardItem.bank, illustrations),
            width: variables_1.default.cardAvatarWidth,
            height: variables_1.default.cardAvatarHeight,
        };
        return [avatar, icon];
    }, [formattedDisplayName, illustrations, cardItem]), memberAvatar = _d[0], cardIcon = _d[1];
    var backgroundColor = (_c = (_b = StyleUtils.getItemBackgroundColorStyle(!!cardItem.isSelected, !!isFocused || !!isHovered, !!isDisabled, theme.activeComponentBG, theme.hoverComponentBG)) === null || _b === void 0 ? void 0 : _b.backgroundColor) !== null && _c !== void 0 ? _c : theme.highlightBG;
    // s77rt add total cell, action cell and collapse/expand button
    return (<react_native_1.View>
            <react_native_1.View style={[styles.pv1Half, styles.ph3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (<Checkbox_1.default onPress={function () { return onCheckboxPress === null || onCheckboxPress === void 0 ? void 0 : onCheckboxPress(cardItem); }} isChecked={cardItem.isSelected} disabled={!!isDisabled || cardItem.isDisabledCheckbox} accessibilityLabel={translate('common.select')}/>)}
                    <react_native_1.View style={[styles.flexRow, styles.gap3]}>
                        <SubscriptAvatar_1.default mainAvatar={memberAvatar} subscriptIcon={cardIcon} backgroundColor={backgroundColor} noMargin/>
                        <react_native_1.View style={[styles.gapHalf]}>
                            <TextWithTooltip_1.default text={formattedDisplayName} style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre]}/>
                            <TextWithTooltip_1.default text={"".concat(cardItem.cardName, " \u2022 ").concat(cardItem.lastFourPAN)} style={[styles.textLabelSupporting, styles.lh16, styles.pre]}/>
                        </react_native_1.View>
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={[styles.pv2, styles.ph3]}>
                <react_native_1.View style={[styles.borderBottom]}/>
            </react_native_1.View>
        </react_native_1.View>);
}
CardListItemHeader.displayName = 'CardListItemHeader';
exports.default = CardListItemHeader;
