"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ControlSelection_1 = require("@libs/ControlSelection");
var convertToLTR_1 = require("@libs/convertToLTR");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var getButtonState_1 = require("@libs/getButtonState");
var mergeRefs_1 = require("@libs/mergeRefs");
var Parser_1 = require("@libs/Parser");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var variables_1 = require("@styles/variables");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var Avatar_1 = require("./Avatar");
var Badge_1 = require("./Badge");
var DisplayNames_1 = require("./DisplayNames");
var FormHelpMessage_1 = require("./FormHelpMessage");
var Hoverable_1 = require("./Hoverable");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var defaultWorkspaceAvatars = require("./Icon/WorkspaceDefaultAvatars");
var MenuItemGroup_1 = require("./MenuItemGroup");
var MultipleAvatars_1 = require("./MultipleAvatars");
var PlaidCardFeedIcon_1 = require("./PlaidCardFeedIcon");
var PressableWithSecondaryInteraction_1 = require("./PressableWithSecondaryInteraction");
var RenderHTML_1 = require("./RenderHTML");
var SelectCircle_1 = require("./SelectCircle");
var SubscriptAvatar_1 = require("./SubscriptAvatar");
var Text_1 = require("./Text");
var EducationalTooltip_1 = require("./Tooltip/EducationalTooltip");
var getSubscriptAvatarBackgroundColor = function (isHovered, isPressed, hoveredBackgroundColor, pressedBackgroundColor) {
    if (isPressed) {
        return pressedBackgroundColor;
    }
    if (isHovered) {
        return hoveredBackgroundColor;
    }
};
function MenuItem(_a, ref) {
    var _b;
    var _c = _a.interactive, interactive = _c === void 0 ? true : _c, onPress = _a.onPress, badgeText = _a.badgeText, style = _a.style, wrapperStyle = _a.wrapperStyle, titleWrapperStyle = _a.titleWrapperStyle, outerWrapperStyle = _a.outerWrapperStyle, containerStyle = _a.containerStyle, titleStyle = _a.titleStyle, labelStyle = _a.labelStyle, descriptionTextStyle = _a.descriptionTextStyle, badgeStyle = _a.badgeStyle, _d = _a.viewMode, viewMode = _d === void 0 ? CONST_1.default.OPTION_MODE.DEFAULT : _d, _e = _a.numberOfLinesTitle, numberOfLinesTitle = _e === void 0 ? 1 : _e, _f = _a.numberOfLinesDescription, numberOfLinesDescription = _f === void 0 ? 2 : _f, icon = _a.icon, iconFill = _a.iconFill, secondaryIcon = _a.secondaryIcon, secondaryIconFill = _a.secondaryIconFill, _g = _a.iconType, iconType = _g === void 0 ? CONST_1.default.ICON_TYPE_ICON : _g, _h = _a.isSecondaryIconHoverable, isSecondaryIconHoverable = _h === void 0 ? false : _h, iconWidth = _a.iconWidth, iconHeight = _a.iconHeight, iconStyles = _a.iconStyles, _j = _a.fallbackIcon, fallbackIcon = _j === void 0 ? Expensicons.FallbackAvatar : _j, _k = _a.shouldShowTitleIcon, shouldShowTitleIcon = _k === void 0 ? false : _k, titleIcon = _a.titleIcon, _l = _a.shouldShowRightIcon, shouldShowRightIcon = _l === void 0 ? false : _l, _m = _a.iconRight, iconRight = _m === void 0 ? Expensicons.ArrowRight : _m, furtherDetailsIcon = _a.furtherDetailsIcon, furtherDetails = _a.furtherDetails, _o = _a.furtherDetailsNumberOfLines, furtherDetailsNumberOfLines = _o === void 0 ? 2 : _o, furtherDetailsStyle = _a.furtherDetailsStyle, furtherDetailsComponent = _a.furtherDetailsComponent, description = _a.description, helperText = _a.helperText, helperTextStyle = _a.helperTextStyle, errorText = _a.errorText, errorTextStyle = _a.errorTextStyle, shouldShowRedDotIndicator = _a.shouldShowRedDotIndicator, hintText = _a.hintText, _p = _a.success, success = _p === void 0 ? false : _p, _q = _a.focused, focused = _q === void 0 ? false : _q, _r = _a.disabled, disabled = _r === void 0 ? false : _r, title = _a.title, titleComponent = _a.titleComponent, titleContainerStyle = _a.titleContainerStyle, subtitle = _a.subtitle, shouldShowBasicTitle = _a.shouldShowBasicTitle, label = _a.label, _s = _a.shouldTruncateTitle, shouldTruncateTitle = _s === void 0 ? false : _s, _t = _a.characterLimit, characterLimit = _t === void 0 ? 200 : _t, _u = _a.isLabelHoverable, isLabelHoverable = _u === void 0 ? true : _u, rightLabel = _a.rightLabel, _v = _a.shouldShowSelectedState, shouldShowSelectedState = _v === void 0 ? false : _v, _w = _a.isSelected, isSelected = _w === void 0 ? false : _w, _x = _a.shouldStackHorizontally, shouldStackHorizontally = _x === void 0 ? false : _x, _y = _a.shouldShowDescriptionOnTop, shouldShowDescriptionOnTop = _y === void 0 ? false : _y, _z = _a.shouldShowRightComponent, shouldShowRightComponent = _z === void 0 ? false : _z, rightComponent = _a.rightComponent, _0 = _a.floatRightAvatars, floatRightAvatars = _0 === void 0 ? [] : _0, floatRightAvatarSize = _a.floatRightAvatarSize, _1 = _a.shouldShowSubscriptRightAvatar, shouldShowSubscriptRightAvatar = _1 === void 0 ? false : _1, _2 = _a.shouldShowSubscriptAvatar, shouldShowSubscriptAvatarProp = _2 === void 0 ? false : _2, _3 = _a.avatarSize, avatarSize = _3 === void 0 ? CONST_1.default.AVATAR_SIZE.DEFAULT : _3, _4 = _a.isSmallAvatarSubscriptMenu, isSmallAvatarSubscriptMenu = _4 === void 0 ? false : _4, brickRoadIndicator = _a.brickRoadIndicator, _5 = _a.shouldRenderAsHTML, shouldRenderAsHTML = _5 === void 0 ? false : _5, _6 = _a.shouldEscapeText, shouldEscapeText = _6 === void 0 ? undefined : _6, _7 = _a.shouldGreyOutWhenDisabled, shouldGreyOutWhenDisabled = _7 === void 0 ? true : _7, _8 = _a.shouldRemoveBackground, shouldRemoveBackground = _8 === void 0 ? false : _8, _9 = _a.shouldRemoveHoverBackground, shouldRemoveHoverBackground = _9 === void 0 ? false : _9, _10 = _a.shouldUseDefaultCursorWhenDisabled, shouldUseDefaultCursorWhenDisabled = _10 === void 0 ? false : _10, _11 = _a.shouldShowLoadingSpinnerIcon, shouldShowLoadingSpinnerIcon = _11 === void 0 ? false : _11, _12 = _a.isAnonymousAction, isAnonymousAction = _12 === void 0 ? false : _12, _13 = _a.shouldBlockSelection, shouldBlockSelection = _13 === void 0 ? false : _13, _14 = _a.shouldParseTitle, shouldParseTitle = _14 === void 0 ? false : _14, _15 = _a.shouldParseHelperText, shouldParseHelperText = _15 === void 0 ? false : _15, _16 = _a.shouldRenderHintAsHTML, shouldRenderHintAsHTML = _16 === void 0 ? false : _16, _17 = _a.shouldRenderErrorAsHTML, shouldRenderErrorAsHTML = _17 === void 0 ? false : _17, _18 = _a.excludedMarkdownRules, excludedMarkdownRules = _18 === void 0 ? [] : _18, _19 = _a.shouldCheckActionAllowedOnPress, shouldCheckActionAllowedOnPress = _19 === void 0 ? true : _19, onSecondaryInteraction = _a.onSecondaryInteraction, titleWithTooltips = _a.titleWithTooltips, _20 = _a.displayInDefaultIconColor, displayInDefaultIconColor = _20 === void 0 ? false : _20, _21 = _a.contentFit, contentFit = _21 === void 0 ? 'cover' : _21, _22 = _a.isPaneMenu, isPaneMenu = _22 === void 0 ? true : _22, _23 = _a.shouldPutLeftPaddingWhenNoIcon, shouldPutLeftPaddingWhenNoIcon = _23 === void 0 ? false : _23, onFocus = _a.onFocus, onBlur = _a.onBlur, avatarID = _a.avatarID, _24 = _a.shouldRenderTooltip, shouldRenderTooltip = _24 === void 0 ? false : _24, _25 = _a.shouldHideOnScroll, shouldHideOnScroll = _25 === void 0 ? false : _25, tooltipAnchorAlignment = _a.tooltipAnchorAlignment, _26 = _a.tooltipWrapperStyle, tooltipWrapperStyle = _26 === void 0 ? {} : _26, _27 = _a.tooltipShiftHorizontal, tooltipShiftHorizontal = _27 === void 0 ? 0 : _27, _28 = _a.tooltipShiftVertical, tooltipShiftVertical = _28 === void 0 ? 0 : _28, renderTooltipContent = _a.renderTooltipContent, onEducationTooltipPress = _a.onEducationTooltipPress, additionalIconStyles = _a.additionalIconStyles, _29 = _a.shouldShowSelectedItemCheck, shouldShowSelectedItemCheck = _29 === void 0 ? false : _29, _30 = _a.shouldIconUseAutoWidthStyle, shouldIconUseAutoWidthStyle = _30 === void 0 ? false : _30, _31 = _a.shouldBreakWord, shouldBreakWord = _31 === void 0 ? false : _31, pressableTestID = _a.pressableTestID, shouldTeleportPortalToModalLayer = _a.shouldTeleportPortalToModalLayer, copyValue = _a.copyValue, plaidUrl = _a.plaidUrl;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var combinedStyle = [styles.popoverMenuItem, style];
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _32 = (_b = (0, react_1.useContext)(MenuItemGroup_1.MenuItemGroupContext)) !== null && _b !== void 0 ? _b : {}, isExecuting = _32.isExecuting, singleExecution = _32.singleExecution, waitForNavigate = _32.waitForNavigate;
    var popoverAnchor = (0, react_1.useRef)(null);
    var isCompact = viewMode === CONST_1.default.OPTION_MODE.COMPACT;
    var isDeleted = style && Array.isArray(style) ? style.includes(styles.offlineFeedback.deleted) : false;
    var descriptionVerticalMargin = shouldShowDescriptionOnTop ? styles.mb1 : styles.mt1;
    var fallbackAvatarSize = isCompact ? CONST_1.default.AVATAR_SIZE.SMALL : CONST_1.default.AVATAR_SIZE.DEFAULT;
    var firstRightIcon = floatRightAvatars.at(0);
    var combinedTitleTextStyle = StyleUtils.combineStyles([
        styles.flexShrink1,
        styles.popoverMenuText,
        // eslint-disable-next-line no-nested-ternary
        shouldPutLeftPaddingWhenNoIcon || (icon && !Array.isArray(icon)) ? (avatarSize === CONST_1.default.AVATAR_SIZE.SMALL ? styles.ml2 : styles.ml3) : {},
        shouldShowBasicTitle ? {} : styles.textStrong,
        numberOfLinesTitle !== 1 ? styles.preWrap : styles.pre,
        interactive && disabled ? __assign({}, styles.userSelectNone) : {},
        styles.ltr,
        isDeleted ? styles.offlineFeedback.deleted : {},
        shouldBreakWord ? styles.breakWord : {},
        styles.mw100,
    ], titleStyle !== null && titleStyle !== void 0 ? titleStyle : {});
    var shouldShowAvatar = !!icon && Array.isArray(icon);
    var firstIcon = Array.isArray(icon) && !!icon.length ? icon.at(0) : undefined;
    var shouldShowSubscriptAvatar = shouldShowSubscriptAvatarProp && !!firstIcon;
    var descriptionTextStyles = StyleUtils.combineStyles([
        styles.textLabelSupporting,
        icon && !Array.isArray(icon) ? styles.ml3 : {},
        title ? descriptionVerticalMargin : StyleUtils.getFontSizeStyle(variables_1.default.fontSizeNormal),
        title ? styles.textLineHeightNormal : StyleUtils.getLineHeightStyle(variables_1.default.fontSizeNormalHeight),
        descriptionTextStyle || styles.breakWord,
        isDeleted ? styles.offlineFeedback.deleted : {},
    ]);
    var html = (0, react_1.useMemo)(function () {
        if (!title || !shouldParseTitle) {
            return '';
        }
        return Parser_1.default.replace(title, { shouldEscapeText: shouldEscapeText, disabledRules: excludedMarkdownRules });
    }, [title, shouldParseTitle, shouldEscapeText, excludedMarkdownRules]);
    var helperHtml = (0, react_1.useMemo)(function () {
        if (!helperText || !shouldParseHelperText) {
            return '';
        }
        return Parser_1.default.replace(helperText, { shouldEscapeText: shouldEscapeText });
    }, [helperText, shouldParseHelperText, shouldEscapeText]);
    var processedTitle = (0, react_1.useMemo)(function () {
        var titleToWrap = '';
        if (shouldRenderAsHTML) {
            titleToWrap = title !== null && title !== void 0 ? title : '';
        }
        if (shouldParseTitle) {
            titleToWrap = html;
        }
        if (shouldTruncateTitle) {
            titleToWrap = Parser_1.default.truncateHTML("<comment>".concat(titleToWrap, "</comment>"), characterLimit, { ellipsis: '...' });
            return titleToWrap;
        }
        return titleToWrap ? "<comment>".concat(titleToWrap, "</comment>") : '';
    }, [title, shouldRenderAsHTML, shouldParseTitle, characterLimit, shouldTruncateTitle, html]);
    var processedHelperText = (0, react_1.useMemo)(function () {
        var textToWrap = '';
        if (shouldParseHelperText) {
            textToWrap = helperHtml;
        }
        return textToWrap ? "<comment><muted-text-label>".concat(textToWrap, "</muted-text-label></comment>") : '';
    }, [shouldParseHelperText, helperHtml]);
    var hasPressableRightComponent = iconRight || (shouldShowRightComponent && rightComponent);
    var renderTitleContent = function () {
        if (title && titleWithTooltips && Array.isArray(titleWithTooltips) && titleWithTooltips.length > 0) {
            return (<DisplayNames_1.default fullTitle={title} displayNamesWithTooltips={titleWithTooltips} tooltipEnabled numberOfLines={1}/>);
        }
        return title ? (0, convertToLTR_1.default)(title) : '';
    };
    var onPressAction = function (event) {
        if (disabled || !interactive) {
            return;
        }
        if ((event === null || event === void 0 ? void 0 : event.type) === 'click') {
            event.currentTarget.blur();
        }
        if (onPress && event) {
            if (!singleExecution || !waitForNavigate) {
                onPress(event);
                return;
            }
            singleExecution(waitForNavigate(function () {
                onPress(event);
            }))();
        }
    };
    var secondaryInteraction = function (event) {
        if (!copyValue) {
            return;
        }
        (0, ReportActionContextMenu_1.showContextMenu)({
            type: CONST_1.default.CONTEXT_MENU_TYPES.TEXT,
            event: event,
            selection: copyValue,
            contextMenuAnchor: popoverAnchor.current,
        });
        onSecondaryInteraction === null || onSecondaryInteraction === void 0 ? void 0 : onSecondaryInteraction(event);
    };
    return (<react_native_1.View onBlur={onBlur}>
            {!!label && !isLabelHoverable && (<react_native_1.View style={[styles.ph5, labelStyle]}>
                    <Text_1.default style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre])}>{label}</Text_1.default>
                </react_native_1.View>)}
            <EducationalTooltip_1.default shouldRender={shouldRenderTooltip} anchorAlignment={tooltipAnchorAlignment} renderTooltipContent={renderTooltipContent} wrapperStyle={tooltipWrapperStyle} shiftHorizontal={tooltipShiftHorizontal} shiftVertical={tooltipShiftVertical} shouldTeleportPortalToModalLayer={shouldTeleportPortalToModalLayer} onTooltipPress={onEducationTooltipPress} shouldHideOnScroll={shouldHideOnScroll}>
                <react_native_1.View>
                    <Hoverable_1.default>
                        {function (isHovered) { return (<PressableWithSecondaryInteraction_1.default onPress={shouldCheckActionAllowedOnPress ? (0, Session_1.callFunctionIfActionIsAllowed)(onPressAction, isAnonymousAction) : onPressAction} onPressIn={function () { return shouldBlockSelection && shouldUseNarrowLayout && (0, DeviceCapabilities_1.canUseTouchScreen)() && ControlSelection_1.default.block(); }} onPressOut={ControlSelection_1.default.unblock} onSecondaryInteraction={copyValue ? secondaryInteraction : onSecondaryInteraction} wrapperStyle={outerWrapperStyle} activeOpacity={!interactive ? 1 : variables_1.default.pressDimValue} opacityAnimationDuration={0} testID={pressableTestID} style={function (_a) {
                var pressed = _a.pressed;
                return __spreadArray(__spreadArray([
                    containerStyle,
                    combinedStyle,
                    !interactive && styles.cursorDefault,
                    isCompact && styles.alignItemsCenter,
                    isCompact && styles.optionRowCompact,
                    !shouldRemoveBackground &&
                        StyleUtils.getButtonBackgroundColorStyle((0, getButtonState_1.default)(focused || isHovered, pressed, success, disabled, interactive), true)
                ], (Array.isArray(wrapperStyle) ? wrapperStyle : [wrapperStyle]), true), [
                    shouldGreyOutWhenDisabled && disabled && styles.buttonOpacityDisabled,
                    isHovered && interactive && !focused && !pressed && !shouldRemoveBackground && !shouldRemoveHoverBackground && styles.hoveredComponentBG,
                ], false);
            }} disabledStyle={shouldUseDefaultCursorWhenDisabled && [styles.cursorDefault]} disabled={disabled || isExecuting} ref={(0, mergeRefs_1.default)(ref, popoverAnchor)} role={CONST_1.default.ROLE.MENUITEM} accessibilityLabel={title ? title.toString() : ''} accessible onFocus={onFocus}>
                                {function (_a) {
                var _b;
                var pressed = _a.pressed;
                return (<react_native_1.View style={[styles.flex1]}>
                                        <react_native_1.View style={[styles.flexRow]}>
                                            <react_native_1.View style={[styles.flexColumn, styles.flex1]}>
                                                {!!label && isLabelHoverable && (<react_native_1.View style={[icon ? styles.mb2 : null, labelStyle]}>
                                                        <Text_1.default style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre])}>
                                                            {label}
                                                        </Text_1.default>
                                                    </react_native_1.View>)}
                                                <react_native_1.View style={[styles.flexRow, styles.pointerEventsAuto, disabled && !shouldUseDefaultCursorWhenDisabled && styles.cursorDisabled]}>
                                                    {shouldShowAvatar && !shouldShowSubscriptAvatar && (<MultipleAvatars_1.default isHovered={isHovered} isPressed={pressed} icons={icon} size={avatarSize} secondAvatarStyle={[
                            StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                            pressed && interactive ? StyleUtils.getBackgroundAndBorderStyle(theme.buttonPressedBG) : undefined,
                            isHovered && !pressed && interactive ? StyleUtils.getBackgroundAndBorderStyle(theme.border) : undefined,
                        ]}/>)}
                                                    {shouldShowAvatar && shouldShowSubscriptAvatar && (<SubscriptAvatar_1.default backgroundColor={getSubscriptAvatarBackgroundColor(isHovered, pressed, theme.hoverComponentBG, theme.buttonHoveredBG)} mainAvatar={firstIcon} secondaryAvatar={icon.at(1)} size={avatarSize}/>)}
                                                    {!icon && shouldPutLeftPaddingWhenNoIcon && (<react_native_1.View style={[
                            styles.popoverMenuIcon,
                            iconStyles,
                            shouldIconUseAutoWidthStyle ? styles.wAuto : StyleUtils.getAvatarWidthStyle(avatarSize),
                        ]}/>)}
                                                    {!!icon && !Array.isArray(icon) && (<react_native_1.View style={[
                            styles.popoverMenuIcon,
                            iconStyles,
                            shouldIconUseAutoWidthStyle ? styles.wAuto : StyleUtils.getAvatarWidthStyle(avatarSize),
                        ]}>
                                                            {typeof icon !== 'string' &&
                            iconType === CONST_1.default.ICON_TYPE_ICON &&
                            (!shouldShowLoadingSpinnerIcon ? (<Icon_1.default contentFit={contentFit} hovered={isHovered} pressed={pressed} src={icon} width={iconWidth} height={iconHeight} fill={displayInDefaultIconColor
                                    ? undefined
                                    : (iconFill !== null && iconFill !== void 0 ? iconFill : StyleUtils.getIconFillColor((0, getButtonState_1.default)(focused || isHovered, pressed, success, disabled, interactive), true, isPaneMenu))} additionalStyles={additionalIconStyles}/>) : (<react_native_1.ActivityIndicator size="small" color={theme.textSupporting}/>))}
                                                            {!!icon && iconType === CONST_1.default.ICON_TYPE_WORKSPACE && (<Avatar_1.default imageStyles={[styles.alignSelfCenter]} size={CONST_1.default.AVATAR_SIZE.DEFAULT} source={icon} fallbackIcon={fallbackIcon} name={title} avatarID={avatarID} type={CONST_1.default.ICON_TYPE_WORKSPACE}/>)}
                                                            {iconType === CONST_1.default.ICON_TYPE_AVATAR && (<Avatar_1.default imageStyles={[styles.alignSelfCenter]} source={icon} avatarID={avatarID} fallbackIcon={fallbackIcon} size={avatarSize} type={CONST_1.default.ICON_TYPE_AVATAR}/>)}
                                                            {iconType === CONST_1.default.ICON_TYPE_PLAID && !!plaidUrl && <PlaidCardFeedIcon_1.default plaidUrl={plaidUrl}/>}
                                                        </react_native_1.View>)}
                                                    {!!secondaryIcon && (<react_native_1.View style={[styles.popoverMenuIcon, iconStyles, isSecondaryIconHoverable && StyleUtils.getBackgroundAndBorderStyle(theme.border)]}>
                                                            <Icon_1.default contentFit={contentFit} src={secondaryIcon} width={iconWidth} height={iconHeight} fill={secondaryIconFill !== null && secondaryIconFill !== void 0 ? secondaryIconFill : StyleUtils.getIconFillColor((0, getButtonState_1.default)(focused || isHovered, pressed, success, disabled, interactive), true)}/>
                                                        </react_native_1.View>)}
                                                    <react_native_1.View style={[
                        styles.justifyContentCenter,
                        styles.flex1,
                        StyleUtils.getMenuItemTextContainerStyle(isSmallAvatarSubscriptMenu || isCompact),
                        titleContainerStyle,
                    ]}>
                                                        {!!description && shouldShowDescriptionOnTop && (<Text_1.default style={descriptionTextStyles} numberOfLines={numberOfLinesDescription}>
                                                                {description}
                                                            </Text_1.default>)}
                                                        {(!!title || !!shouldShowTitleIcon) && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, titleWrapperStyle]}>
                                                                {!!title && (shouldRenderAsHTML || (shouldParseTitle && !!html.length)) && (<react_native_1.View style={styles.renderHTMLTitle}>
                                                                        <RenderHTML_1.default html={processedTitle}/>
                                                                    </react_native_1.View>)}
                                                                {!shouldRenderAsHTML && !shouldParseTitle && !!title && (<Text_1.default style={combinedTitleTextStyle} numberOfLines={numberOfLinesTitle || undefined} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = interactive && disabled, _b}>
                                                                        {renderTitleContent()}
                                                                    </Text_1.default>)}
                                                                {!!shouldShowTitleIcon && !!titleIcon && (<react_native_1.View style={[styles.ml2]}>
                                                                        <Icon_1.default src={titleIcon} fill={theme.iconSuccessFill}/>
                                                                    </react_native_1.View>)}
                                                            </react_native_1.View>)}
                                                        {!!description && !shouldShowDescriptionOnTop && (<Text_1.default style={descriptionTextStyles} numberOfLines={numberOfLinesDescription}>
                                                                {description}
                                                            </Text_1.default>)}
                                                        {!!furtherDetails && (<react_native_1.View style={[styles.flexRow, styles.mt1, styles.alignItemsCenter]}>
                                                                {!!furtherDetailsIcon && (<Icon_1.default src={furtherDetailsIcon} height={variables_1.default.iconSizeNormal} width={variables_1.default.iconSizeNormal} inline/>)}
                                                                <Text_1.default style={[
                            furtherDetailsIcon ? [styles.furtherDetailsText, styles.ph2, styles.pt1] : styles.textLabelSupporting,
                            furtherDetailsStyle,
                        ]} numberOfLines={furtherDetailsNumberOfLines}>
                                                                    {furtherDetails}
                                                                </Text_1.default>
                                                            </react_native_1.View>)}
                                                        {!!furtherDetailsComponent && <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>{furtherDetailsComponent}</react_native_1.View>}
                                                        {titleComponent}
                                                    </react_native_1.View>
                                                </react_native_1.View>
                                            </react_native_1.View>
                                            <react_native_1.View style={[styles.flexRow, StyleUtils.getMenuItemTextContainerStyle(isCompact), !hasPressableRightComponent && styles.pointerEventsNone]}>
                                                {!!badgeText && (<Badge_1.default text={badgeText} badgeStyles={badgeStyle}/>)}
                                                {/* Since subtitle can be of type number, we should allow 0 to be shown */}
                                                {(subtitle === 0 || !!subtitle) && (<react_native_1.View style={[styles.justifyContentCenter, styles.mr1]}>
                                                        <Text_1.default style={__spreadArray([styles.textLabelSupporting], combinedStyle, true)}>{subtitle}</Text_1.default>
                                                    </react_native_1.View>)}
                                                {(floatRightAvatars === null || floatRightAvatars === void 0 ? void 0 : floatRightAvatars.length) > 0 && !!firstRightIcon && (<react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentCenter, brickRoadIndicator ? styles.mr2 : styles.mrn2]}>
                                                        {shouldShowSubscriptRightAvatar ? (<SubscriptAvatar_1.default backgroundColor={isHovered ? theme.activeComponentBG : theme.componentBG} mainAvatar={firstRightIcon} secondaryAvatar={floatRightAvatars.at(1)} size={floatRightAvatarSize !== null && floatRightAvatarSize !== void 0 ? floatRightAvatarSize : fallbackAvatarSize}/>) : (<MultipleAvatars_1.default isHovered={isHovered} isPressed={pressed} icons={floatRightAvatars} size={floatRightAvatarSize !== null && floatRightAvatarSize !== void 0 ? floatRightAvatarSize : fallbackAvatarSize} fallbackIcon={defaultWorkspaceAvatars.WorkspaceBuilding} shouldStackHorizontally={shouldStackHorizontally} isFocusMode/>)}
                                                    </react_native_1.View>)}
                                                {!!brickRoadIndicator && (<react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.ml1]}>
                                                        <Icon_1.default src={Expensicons.DotIndicator} fill={brickRoadIndicator === 'error' ? theme.danger : theme.success}/>
                                                    </react_native_1.View>)}
                                                {!title && !!rightLabel && !errorText && (<react_native_1.View style={styles.justifyContentCenter}>
                                                        <Text_1.default style={styles.rightLabelMenuItem}>{rightLabel}</Text_1.default>
                                                    </react_native_1.View>)}
                                                {shouldShowRightIcon && (<react_native_1.View style={[
                            styles.pointerEventsAuto,
                            StyleUtils.getMenuItemIconStyle(isCompact),
                            disabled && !shouldUseDefaultCursorWhenDisabled && styles.cursorDisabled,
                        ]}>
                                                        <Icon_1.default src={iconRight} fill={StyleUtils.getIconFillColor((0, getButtonState_1.default)(focused || isHovered, pressed, success, disabled, interactive))}/>
                                                    </react_native_1.View>)}
                                                {shouldShowRightComponent && rightComponent}
                                                {shouldShowSelectedState && <SelectCircle_1.default isChecked={isSelected}/>}
                                                {shouldShowSelectedItemCheck && isSelected && (<Icon_1.default src={Expensicons.Checkmark} fill={theme.iconSuccessFill} additionalStyles={styles.alignSelfCenter}/>)}
                                            </react_native_1.View>
                                        </react_native_1.View>
                                        {!!errorText && (<FormHelpMessage_1.default isError shouldShowRedDotIndicator={!!shouldShowRedDotIndicator} message={errorText} style={[styles.menuItemError, errorTextStyle]} shouldRenderMessageAsHTML={shouldRenderErrorAsHTML}/>)}
                                        {!!hintText && (<FormHelpMessage_1.default isError={false} shouldShowRedDotIndicator={false} message={hintText} style={styles.menuItemError} shouldRenderMessageAsHTML={shouldRenderHintAsHTML}/>)}
                                    </react_native_1.View>);
            }}
                            </PressableWithSecondaryInteraction_1.default>); }}
                    </Hoverable_1.default>
                    {!!helperText &&
            (shouldParseHelperText ? (<react_native_1.View style={[styles.flexRow, styles.renderHTML, styles.ph5, styles.pb5]}>
                                <RenderHTML_1.default html={processedHelperText}/>
                            </react_native_1.View>) : (<Text_1.default style={[styles.mutedNormalTextLabel, styles.ph5, styles.pb5, helperTextStyle]}>{helperText}</Text_1.default>))}
                </react_native_1.View>
            </EducationalTooltip_1.default>
        </react_native_1.View>);
}
MenuItem.displayName = 'MenuItem';
exports.default = (0, react_1.forwardRef)(MenuItem);
