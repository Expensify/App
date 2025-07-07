"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var TextWithTooltip_1 = require("@components/TextWithTooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var BaseListItem_1 = require("./BaseListItem");
function RadioListItem(_a) {
    var _b, _c, _d, _e;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, onSelectRow = _a.onSelectRow, onDismissError = _a.onDismissError, shouldPreventEnterKeySubmit = _a.shouldPreventEnterKeySubmit, rightHandSideComponent = _a.rightHandSideComponent, _f = _a.isMultilineSupported, isMultilineSupported = _f === void 0 ? false : _f, _g = _a.isAlternateTextMultilineSupported, isAlternateTextMultilineSupported = _g === void 0 ? false : _g, _h = _a.alternateTextNumberOfLines, alternateTextNumberOfLines = _h === void 0 ? 2 : _h, onFocus = _a.onFocus, shouldSyncFocus = _a.shouldSyncFocus, wrapperStyle = _a.wrapperStyle, titleStyles = _a.titleStyles;
    var styles = (0, useThemeStyles_1.default)();
    var fullTitle = isMultilineSupported ? (_b = item.text) === null || _b === void 0 ? void 0 : _b.trimStart() : item.text;
    var indentsLength = ((_d = (_c = item.text) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) - ((_e = fullTitle === null || fullTitle === void 0 ? void 0 : fullTitle.length) !== null && _e !== void 0 ? _e : 0);
    var paddingLeft = Math.floor(indentsLength / CONST_1.default.INDENTS.length) * styles.ml3.marginLeft;
    var alternateTextMaxWidth = variables_1.default.sideBarWidth - styles.ph5.paddingHorizontal * 2 - styles.ml3.marginLeft - variables_1.default.iconSizeNormal;
    return (<BaseListItem_1.default item={item} wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.optionRow, wrapperStyle]} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} onSelectRow={onSelectRow} onDismissError={onDismissError} shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit} rightHandSideComponent={rightHandSideComponent} keyForList={item.keyForList} onFocus={onFocus} shouldSyncFocus={shouldSyncFocus} pendingAction={item.pendingAction}>
            <>
                {!!item.leftElement && item.leftElement}
                <react_native_1.View style={[styles.flex1, styles.alignItemsStart]}>
                    <TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={fullTitle !== null && fullTitle !== void 0 ? fullTitle : ''} style={[
            styles.optionDisplayName,
            isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
            styles.sidebarLinkTextBold,
            isMultilineSupported ? styles.preWrap : styles.pre,
            item.alternateText ? styles.mb1 : null,
            isDisabled && styles.colorMuted,
            isMultilineSupported ? { paddingLeft: paddingLeft } : null,
            titleStyles,
        ]} numberOfLines={isMultilineSupported ? 2 : 1}/>

                    {!!item.alternateText && (<TextWithTooltip_1.default shouldShowTooltip={showTooltip} text={item.alternateText} style={[
                styles.textLabelSupporting,
                styles.lh16,
                isAlternateTextMultilineSupported ? styles.preWrap : styles.pre,
                isAlternateTextMultilineSupported ? { maxWidth: alternateTextMaxWidth } : null,
            ]} numberOfLines={isAlternateTextMultilineSupported ? alternateTextNumberOfLines : 1}/>)}
                </react_native_1.View>
                {!!item.rightElement && item.rightElement}
            </>
        </BaseListItem_1.default>);
}
RadioListItem.displayName = 'RadioListItem';
exports.default = RadioListItem;
