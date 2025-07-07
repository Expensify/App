"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Expensicons = require("@components/Icon/Expensicons");
var MoneyRequestAmountInput_1 = require("@components/MoneyRequestAmountInput");
var Text_1 = require("@components/Text");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var variables_1 = require("@styles/variables");
var BaseListItem_1 = require("./BaseListItem");
function SplitListItem(_a) {
    var _b, _c, _d, _e, _f;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, onSelectRow = _a.onSelectRow, shouldPreventEnterKeySubmit = _a.shouldPreventEnterKeySubmit, rightHandSideComponent = _a.rightHandSideComponent, onFocus = _a.onFocus;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var splitItem = item;
    var formattedOriginalAmount = (0, CurrencyUtils_1.convertToDisplayStringWithoutCurrency)(splitItem.originalAmount, splitItem.currency);
    var onSplitExpenseAmountChange = function (amount) {
        splitItem.onSplitExpenseAmountChange(splitItem.transactionID, Number(amount));
    };
    var isBottomVisible = !!splitItem.category || !!((_b = splitItem.tags) === null || _b === void 0 ? void 0 : _b.at(0));
    return (<BaseListItem_1.default item={item} wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.p2, styles.br2]} isFocused={isFocused} containerStyle={[
            styles.mh4,
            styles.mv1,
            styles.reportPreviewBoxHoverBorder,
            styles.br2,
            splitItem.isTransactionLinked && StyleUtils.getBackgroundColorStyle(theme.messageHighlightBG),
        ]} hoverStyle={[styles.br2]} pressableStyle={[styles.br2, styles.p1]} isDisabled={isDisabled} showTooltip={showTooltip} onSelectRow={onSelectRow} shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit} rightHandSideComponent={rightHandSideComponent} keyForList={item.keyForList} onFocus={onFocus} pendingAction={item.pendingAction}>
            <react_native_1.View style={[styles.flexRow, styles.containerWithSpaceBetween]}>
                <react_native_1.View style={[styles.flex1]}>
                    <react_native_1.View style={[styles.containerWithSpaceBetween, !isBottomVisible && styles.justifyContentCenter]}>
                        <react_native_1.View style={[styles.minHeight5, styles.justifyContentCenter]}>
                            <Text_1.default numberOfLines={1} style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}>
                                {splitItem.headerText}
                            </Text_1.default>
                        </react_native_1.View>
                        <react_native_1.View style={[styles.minHeight5, styles.justifyContentCenter, styles.gap2]}>
                            <react_native_1.View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                                <Text_1.default fontSize={variables_1.default.fontSizeNormal} style={[styles.flexShrink1]} numberOfLines={1}>
                                    {splitItem.merchant}
                                </Text_1.default>
                            </react_native_1.View>
                        </react_native_1.View>
                    </react_native_1.View>
                    {isBottomVisible && (<react_native_1.View style={[styles.splitItemBottomContent]}>
                            {!!splitItem.category && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.pr1, styles.flexShrink1, !!((_c = splitItem.tags) === null || _c === void 0 ? void 0 : _c.at(0)) && styles.mw50]}>
                                    <Icon_1.default src={Expensicons_1.Folder} height={variables_1.default.iconSizeExtraSmall} width={variables_1.default.iconSizeExtraSmall} fill={theme.icon}/>
                                    <Text_1.default numberOfLines={1} style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}>
                                        {splitItem.category}
                                    </Text_1.default>
                                </react_native_1.View>)}
                            {!!((_d = splitItem.tags) === null || _d === void 0 ? void 0 : _d.at(0)) && (<react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.pl1, !!splitItem.category && styles.mw50]}>
                                    <Icon_1.default src={Expensicons_1.Tag} height={variables_1.default.iconSizeExtraSmall} width={variables_1.default.iconSizeExtraSmall} fill={theme.icon}/>
                                    <Text_1.default numberOfLines={1} style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1]}>
                                        {(0, PolicyUtils_1.getCleanedTagName)((_f = (_e = splitItem.tags) === null || _e === void 0 ? void 0 : _e.at(0)) !== null && _f !== void 0 ? _f : '')}
                                    </Text_1.default>
                                </react_native_1.View>)}
                        </react_native_1.View>)}
                </react_native_1.View>
                <react_native_1.View style={[styles.flexRow]}>
                    <react_native_1.View style={[styles.justifyContentCenter]}>
                        <MoneyRequestAmountInput_1.default autoGrow={false} amount={splitItem.amount} currency={splitItem.currency} prefixCharacter={splitItem.currencySymbol} disableKeyboard={false} isCurrencyPressable={false} hideFocusedState={false} hideCurrencySymbol submitBehavior="blurAndSubmit" formatAmountOnBlur onAmountChange={onSplitExpenseAmountChange} prefixContainerStyle={[styles.pv0, styles.h100]} prefixStyle={styles.lineHeightUndefined} inputStyle={[styles.optionRowAmountInput, styles.lineHeightUndefined]} containerStyle={[styles.textInputContainer, styles.pl2, styles.pr1]} touchableInputWrapperStyle={[styles.ml3]} maxLength={formattedOriginalAmount.length + 1} contentWidth={(formattedOriginalAmount.length + 1) * 8} shouldApplyPaddingToContainer/>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.popoverMenuIcon, styles.pointerEventsAuto]}>
                        <Icon_1.default src={Expensicons.ArrowRight} fill={theme.icon}/>
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>
        </BaseListItem_1.default>);
}
SplitListItem.displayName = 'SplitListItem';
exports.default = SplitListItem;
