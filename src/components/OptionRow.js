"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fast_equals_1 = require("fast-equals");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var Button_1 = require("./Button");
var DisplayNames_1 = require("./DisplayNames");
var Hoverable_1 = require("./Hoverable");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var MoneyRequestAmountInput_1 = require("./MoneyRequestAmountInput");
var MultipleAvatars_1 = require("./MultipleAvatars");
var OfflineWithFeedback_1 = require("./OfflineWithFeedback");
var PressableWithFeedback_1 = require("./Pressable/PressableWithFeedback");
var SelectCircle_1 = require("./SelectCircle");
var SubscriptAvatar_1 = require("./SubscriptAvatar");
var Text_1 = require("./Text");
function OptionRow(_a) {
    var _b, _c, _d, _e, _f, _g;
    var option = _a.option, onSelectRow = _a.onSelectRow, style = _a.style, hoverStyle = _a.hoverStyle, selectedStateButtonText = _a.selectedStateButtonText, keyForList = _a.keyForList, _h = _a.isDisabled, isOptionDisabled = _h === void 0 ? false : _h, _j = _a.isMultilineSupported, isMultilineSupported = _j === void 0 ? false : _j, _k = _a.shouldShowSelectedStateAsButton, shouldShowSelectedStateAsButton = _k === void 0 ? false : _k, _l = _a.highlightSelected, highlightSelected = _l === void 0 ? false : _l, _m = _a.shouldHaveOptionSeparator, shouldHaveOptionSeparator = _m === void 0 ? false : _m, _o = _a.showTitleTooltip, showTitleTooltip = _o === void 0 ? false : _o, _p = _a.optionIsFocused, optionIsFocused = _p === void 0 ? false : _p, _q = _a.boldStyle, boldStyle = _q === void 0 ? false : _q, _r = _a.onSelectedStatePressed, onSelectedStatePressed = _r === void 0 ? function () { } : _r, backgroundColor = _a.backgroundColor, _s = _a.isSelected, isSelected = _s === void 0 ? false : _s, _t = _a.showSelectedState, showSelectedState = _t === void 0 ? false : _t, _u = _a.shouldDisableRowInnerPadding, shouldDisableRowInnerPadding = _u === void 0 ? false : _u, _v = _a.shouldPreventDefaultFocusOnSelectRow, shouldPreventDefaultFocusOnSelectRow = _v === void 0 ? false : _v;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var pressableRef = (0, react_1.useRef)(null);
    var _w = (0, react_1.useState)(isOptionDisabled), isDisabled = _w[0], setIsDisabled = _w[1];
    (0, react_1.useEffect)(function () {
        setIsDisabled(isOptionDisabled);
    }, [isOptionDisabled]);
    var text = (_b = option.text) !== null && _b !== void 0 ? _b : '';
    var fullTitle = isMultilineSupported ? text.trimStart() : text;
    var indentsLength = text.length - fullTitle.length;
    var paddingLeft = Math.floor(indentsLength / CONST_1.default.INDENTS.length) * styles.ml3.marginLeft;
    var textStyle = optionIsFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    var textUnreadStyle = boldStyle || option.boldStyle ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    var displayNameStyle = [
        styles.optionDisplayName,
        textUnreadStyle,
        style,
        styles.pre,
        isDisabled ? styles.optionRowDisabled : {},
        isMultilineSupported ? { paddingLeft: paddingLeft } : {},
    ];
    var alternateTextStyle = [
        textStyle,
        styles.optionAlternateText,
        styles.textLabelSupporting,
        style,
        ((_c = option.alternateTextMaxLines) !== null && _c !== void 0 ? _c : 1) === 1 ? styles.pre : styles.preWrap,
    ];
    var contentContainerStyles = [styles.flex1, styles.mr3];
    var sidebarInnerRowStyle = react_native_1.StyleSheet.flatten([styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter]);
    var flattenHoverStyle = react_native_1.StyleSheet.flatten(hoverStyle);
    var hoveredStyle = hoverStyle ? flattenHoverStyle : styles.sidebarLinkHover;
    var hoveredBackgroundColor = (hoveredStyle === null || hoveredStyle === void 0 ? void 0 : hoveredStyle.backgroundColor) ? hoveredStyle.backgroundColor : backgroundColor;
    var focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    var shouldUseShortFormInTooltip = ((_e = (_d = option.participantsList) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0) > 1;
    var firstIcon = (_f = option === null || option === void 0 ? void 0 : option.icons) === null || _f === void 0 ? void 0 : _f.at(0);
    // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
    var displayNamesWithTooltips = (0, ReportUtils_1.getDisplayNamesWithTooltips)(((_g = option.participantsList) !== null && _g !== void 0 ? _g : (option.accountID ? [option] : [])).slice(0, 10), shouldUseShortFormInTooltip);
    var subscriptColor = theme.appBG;
    if (optionIsFocused) {
        subscriptColor = focusedBackgroundColor;
    }
    return (<Hoverable_1.default>
            {function (hovered) {
            var _a, _b, _c, _d, _e, _f, _g;
            return (<OfflineWithFeedback_1.default pendingAction={option.pendingAction} errors={option.allReportErrors} shouldShowErrorMessages={false} needsOffscreenAlphaCompositing>
                    <PressableWithFeedback_1.default id={keyForList} ref={pressableRef} onPress={function (e) {
                    if (!onSelectRow) {
                        return;
                    }
                    setIsDisabled(true);
                    if (e) {
                        e.preventDefault();
                    }
                    var result = onSelectRow(option, pressableRef.current);
                    if (!(result instanceof Promise)) {
                        result = Promise.resolve();
                    }
                    react_native_1.InteractionManager.runAfterInteractions(function () {
                        result === null || result === void 0 ? void 0 : result.finally(function () { return setIsDisabled(isOptionDisabled); });
                    });
                }} disabled={isDisabled} style={[
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.justifyContentBetween,
                    styles.sidebarLink,
                    !isOptionDisabled && styles.cursorPointer,
                    shouldDisableRowInnerPadding ? null : styles.sidebarLinkInner,
                    optionIsFocused ? styles.sidebarLinkActive : null,
                    shouldHaveOptionSeparator && styles.borderTop,
                    !onSelectRow && !isOptionDisabled ? styles.cursorDefault : null,
                ]} accessibilityLabel={(_a = option.text) !== null && _a !== void 0 ? _a : ''} role={CONST_1.default.ROLE.BUTTON} hoverDimmingValue={1} hoverStyle={!optionIsFocused ? (hoverStyle !== null && hoverStyle !== void 0 ? hoverStyle : styles.sidebarLinkHover) : undefined} needsOffscreenAlphaCompositing={((_c = (_b = option.icons) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) >= 2} onMouseDown={shouldPreventDefaultFocusOnSelectRow ? function (event) { return event.preventDefault(); } : undefined} tabIndex={(_d = option.tabIndex) !== null && _d !== void 0 ? _d : 0}>
                        <react_native_1.View style={sidebarInnerRowStyle}>
                            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                                {!!((_e = option.icons) === null || _e === void 0 ? void 0 : _e.length) &&
                    firstIcon &&
                    (option.shouldShowSubscript ? (<SubscriptAvatar_1.default mainAvatar={firstIcon} secondaryAvatar={option.icons.at(1)} backgroundColor={hovered && !optionIsFocused ? hoveredBackgroundColor : subscriptColor} size={CONST_1.default.AVATAR_SIZE.DEFAULT}/>) : (<MultipleAvatars_1.default icons={option.icons} size={CONST_1.default.AVATAR_SIZE.DEFAULT} secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(hovered && !optionIsFocused ? hoveredBackgroundColor : subscriptColor)]} shouldShowTooltip={showTitleTooltip && (0, OptionsListUtils_1.shouldOptionShowTooltip)(option)}/>))}
                                <react_native_1.View style={contentContainerStyles}>
                                    <DisplayNames_1.default accessibilityLabel={translate('accessibilityHints.chatUserDisplayNames')} fullTitle={fullTitle} displayNamesWithTooltips={displayNamesWithTooltips} tooltipEnabled={showTitleTooltip} numberOfLines={isMultilineSupported ? 2 : 1} textStyles={displayNameStyle} shouldUseFullTitle={!!option.isChatRoom ||
                    !!option.isPolicyExpenseChat ||
                    !!option.isMoneyRequestReport ||
                    !!option.isThread ||
                    !!option.isTaskReport ||
                    !!option.isSelfDM}/>
                                    {option.alternateText ? (<Text_1.default style={alternateTextStyle} numberOfLines={(_f = option.alternateTextMaxLines) !== null && _f !== void 0 ? _f : 1}>
                                            {option.alternateText}
                                        </Text_1.default>) : null}
                                </react_native_1.View>
                                {option.descriptiveText ? (<react_native_1.View style={[styles.flexWrap, styles.pl2]}>
                                        <Text_1.default style={[styles.textLabel]}>{option.descriptiveText}</Text_1.default>
                                    </react_native_1.View>) : null}
                                {option.shouldShowAmountInput && option.amountInputProps ? (<MoneyRequestAmountInput_1.default amount={option.amountInputProps.amount} currency={option.amountInputProps.currency} prefixCharacter={option.amountInputProps.prefixCharacter} disableKeyboard={false} isCurrencyPressable={false} hideFocusedState={false} hideCurrencySymbol formatAmountOnBlur prefixContainerStyle={[styles.pv0]} containerStyle={[styles.textInputContainer]} inputStyle={[
                        styles.optionRowAmountInput,
                        StyleUtils.getPaddingLeft(StyleUtils.getCharacterPadding((_g = option.amountInputProps.prefixCharacter) !== null && _g !== void 0 ? _g : '') + styles.pl1.paddingLeft),
                        option.amountInputProps.inputStyle,
                    ]} onAmountChange={option.amountInputProps.onAmountChange} maxLength={option.amountInputProps.maxLength}/>) : null}
                                {!isSelected && option.brickRoadIndicator === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR && (<react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                        <Icon_1.default src={Expensicons.DotIndicator} fill={theme.danger}/>
                                    </react_native_1.View>)}
                                {!isSelected && option.brickRoadIndicator === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.INFO && (<react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                        <Icon_1.default src={Expensicons.DotIndicator} fill={theme.iconSuccessFill}/>
                                    </react_native_1.View>)}
                                {showSelectedState &&
                    (shouldShowSelectedStateAsButton && !isSelected ? (<Button_1.default style={[styles.pl2]} text={selectedStateButtonText !== null && selectedStateButtonText !== void 0 ? selectedStateButtonText : translate('common.select')} onPress={function () { return onSelectedStatePressed(option); }} small shouldUseDefaultHover={false}/>) : (<PressableWithFeedback_1.default onPress={function () { return onSelectedStatePressed(option); }} disabled={isDisabled} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={CONST_1.default.ROLE.BUTTON} style={[styles.ml2, styles.optionSelectCircle]}>
                                            <SelectCircle_1.default isChecked={isSelected} selectCircleStyles={styles.ml0}/>
                                        </PressableWithFeedback_1.default>))}
                                {isSelected && highlightSelected && (<react_native_1.View style={styles.defaultCheckmarkWrapper}>
                                        <Icon_1.default src={Expensicons.Checkmark} fill={theme.iconSuccessFill}/>
                                    </react_native_1.View>)}
                            </react_native_1.View>
                        </react_native_1.View>
                        {!!option.customIcon && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]} accessible={false}>
                                <react_native_1.View>
                                    <Icon_1.default src={option.customIcon.src} fill={option.customIcon.color}/>
                                </react_native_1.View>
                            </react_native_1.View>)}
                    </PressableWithFeedback_1.default>
                </OfflineWithFeedback_1.default>);
        }}
        </Hoverable_1.default>);
}
OptionRow.displayName = 'OptionRow';
exports.default = react_1.default.memo(OptionRow, function (prevProps, nextProps) {
    return prevProps.isDisabled === nextProps.isDisabled &&
        prevProps.isMultilineSupported === nextProps.isMultilineSupported &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.shouldHaveOptionSeparator === nextProps.shouldHaveOptionSeparator &&
        prevProps.selectedStateButtonText === nextProps.selectedStateButtonText &&
        prevProps.showSelectedState === nextProps.showSelectedState &&
        prevProps.highlightSelected === nextProps.highlightSelected &&
        prevProps.showTitleTooltip === nextProps.showTitleTooltip &&
        (0, fast_equals_1.deepEqual)(prevProps.option.icons, nextProps.option.icons) &&
        prevProps.optionIsFocused === nextProps.optionIsFocused &&
        prevProps.option.text === nextProps.option.text &&
        prevProps.option.alternateText === nextProps.option.alternateText &&
        prevProps.option.descriptiveText === nextProps.option.descriptiveText &&
        prevProps.option.brickRoadIndicator === nextProps.option.brickRoadIndicator &&
        prevProps.option.shouldShowSubscript === nextProps.option.shouldShowSubscript &&
        prevProps.option.ownerAccountID === nextProps.option.ownerAccountID &&
        prevProps.option.subtitle === nextProps.option.subtitle &&
        prevProps.option.pendingAction === nextProps.option.pendingAction &&
        prevProps.option.customIcon === nextProps.option.customIcon &&
        prevProps.option.tabIndex === nextProps.option.tabIndex &&
        (0, fast_equals_1.deepEqual)(prevProps.option.amountInputProps, nextProps.option.amountInputProps);
});
