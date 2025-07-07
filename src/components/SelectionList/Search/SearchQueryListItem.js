"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSearchQueryItem = isSearchQueryItem;
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var BaseListItem_1 = require("@components/SelectionList/BaseListItem");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function isSearchQueryItem(item) {
    return 'searchItemType' in item;
}
function SearchQueryListItem(_a) {
    var _b;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, onSelectRow = _a.onSelectRow, onFocus = _a.onFocus, shouldSyncFocus = _a.shouldSyncFocus;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    return (<BaseListItem_1.default item={item} pressableStyle={[[styles.searchQueryListItemStyle, item.isSelected && styles.activeComponentBG, item.cursorStyle]]} wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]} isFocused={isFocused} onSelectRow={onSelectRow} keyForList={item.keyForList} onFocus={onFocus} hoverStyle={item.isSelected && styles.activeComponentBG} shouldSyncFocus={shouldSyncFocus} showTooltip={showTooltip}>
            <>
                {!!item.singleIcon && (<Icon_1.default src={item.singleIcon} fill={theme.icon} additionalStyles={styles.mr3} medium/>)}
                <react_native_1.View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                    <TextWithTooltip_1.default shouldShowTooltip={showTooltip !== null && showTooltip !== void 0 ? showTooltip : false} text={(_b = item.text) !== null && _b !== void 0 ? _b : ''} style={[
            styles.optionDisplayName,
            isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
            styles.sidebarLinkTextBold,
            styles.pre,
            item.alternateText ? styles.mb1 : null,
            styles.justifyContentCenter,
        ]}/>
                    {!!item.alternateText && (<TextWithTooltip_1.default shouldShowTooltip={showTooltip !== null && showTooltip !== void 0 ? showTooltip : false} text={item.alternateText} style={[styles.textLabelSupporting, styles.lh16, styles.pre]}/>)}
                </react_native_1.View>
            </>
        </BaseListItem_1.default>);
}
SearchQueryListItem.displayName = 'SearchQueryListItem';
exports.default = SearchQueryListItem;
