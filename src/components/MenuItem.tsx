import type {ImageContentFit} from 'expo-image';
import type {ReactElement, ReactNode, Ref} from 'react';
import React, {useContext, useMemo, useRef} from 'react';
import type {GestureResponderEvent, Role, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import convertToLTR from '@libs/convertToLTR';
import {canUseTouchScreen, hasHoverSupport} from '@libs/DeviceCapabilities';
import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import getButtonState from '@libs/getButtonState';
import mergeRefs from '@libs/mergeRefs';
import Parser from '@libs/Parser';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import variables from '@styles/variables';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import type {TooltipAnchorAlignment} from '@src/types/utils/AnchorAlignment';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import ActivityIndicator from './ActivityIndicator';
import Avatar from './Avatar';
import Badge from './Badge';
import CopyTextToClipboard from './CopyTextToClipboard';
import DisplayNames from './DisplayNames';
import type {DisplayNameWithTooltip} from './DisplayNames/types';
import FormHelpMessage from './FormHelpMessage';
import Hoverable from './Hoverable';
import Icon from './Icon';
import {MenuItemGroupContext} from './MenuItemGroup';
import PlaidCardFeedIcon from './PlaidCardFeedIcon';
import type {PressableRef} from './Pressable/GenericPressable/types';
import PressableWithSecondaryInteraction from './PressableWithSecondaryInteraction';
import RenderHTML from './RenderHTML';
import ReportActionAvatars from './ReportActionAvatars';
import SelectCircle from './SelectCircle';
import Text from './Text';
import EducationalTooltip from './Tooltip/EducationalTooltip';

type IconProps = {
    /** Flag to choose between avatar image or an icon */
    iconType?: typeof CONST.ICON_TYPE_ICON;

    /** Icon to display on the left side of component */
    icon: IconAsset | IconType[];
};

type AvatarProps = {
    iconType?: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE | typeof CONST.ICON_TYPE_PLAID;

    icon?: AvatarSource | IconType[];
};

type NoIcon = {
    iconType?: undefined;

    icon?: undefined;
};

type MenuItemBaseProps = ForwardedFSClassProps &
    WithSentryLabel & {
        /** Reference to the outer element */
        ref?: PressableRef | Ref<View>;

        /** Function to fire when component is pressed */
        onPress?: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** Whether the menu item should be interactive at all */
        interactive?: boolean;

        /** Text to be shown as badge near the right end. */
        badgeText?: string;

        /** Icon to display on the left side of the badge */
        badgeIcon?: IconAsset;

        /** Whether the badge should be shown as success */
        badgeSuccess?: boolean;

        /** Whether the badge should be shown as error */
        badgeError?: boolean;

        /** Callback to fire when the badge is pressed */
        onBadgePress?: (event?: GestureResponderEvent | KeyboardEvent) => void;

        /** Used to apply offline styles to child text components */
        style?: StyleProp<ViewStyle>;

        /** Outer wrapper styles */
        outerWrapperStyle?: StyleProp<ViewStyle>;

        /** Any additional styles to apply */
        wrapperStyle?: StyleProp<ViewStyle>;

        /** Styles to apply on the title wrapper */
        titleWrapperStyle?: StyleProp<ViewStyle>;

        /** Any additional styles to apply on the outer element */
        containerStyle?: StyleProp<ViewStyle>;

        /** Used to apply styles specifically to the title */
        titleStyle?: StyleProp<TextStyle>;

        /** Any additional styles to apply on the badge element */
        badgeStyle?: ViewStyle;

        /** Any additional styles to apply to the label */
        labelStyle?: StyleProp<ViewStyle>;

        /** Additional styles to style the description text below the title */
        descriptionTextStyle?: StyleProp<TextStyle>;

        /** The fill color to pass into the icon. */
        iconFill?: string | ((isHovered: boolean) => string);

        /** Secondary icon to display on the left side of component, right of the icon */
        secondaryIcon?: IconAsset;

        /** The fill color to pass into the secondary icon. */
        secondaryIconFill?: string;

        /** Whether the secondary icon should have hover style */
        isSecondaryIconHoverable?: boolean;

        /** Icon Width */
        iconWidth?: number;

        /** Icon Height */
        iconHeight?: number;

        /** Any additional styles to pass to the icon container. */
        iconStyles?: StyleProp<ViewStyle>;

        /** Additional styles to pass to the icon itself */
        additionalIconStyles?: StyleProp<ViewStyle>;

        /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
        fallbackIcon?: IconAsset;

        /** An icon to display under the main item */
        furtherDetailsIcon?: IconAsset;

        /** Boolean whether to display the title right icon */
        shouldShowTitleIcon?: boolean;

        /** Icon to display at right side of title */
        titleIcon?: IconAsset;

        /** Boolean whether to display the right icon */
        shouldShowRightIcon?: boolean;

        /** Overrides the icon for shouldShowRightIcon */
        iconRight?: IconAsset;

        /** Should render component on the right */
        shouldShowRightComponent?: boolean;

        /** Component to be displayed on the right */
        rightComponent?: ReactNode;

        /** A description text to show under the title */
        description?: string;

        /** Text to show below menu item. This text is not interactive */
        helperText?: string;

        /** Any additional styles to pass to helper text. */
        helperTextStyle?: StyleProp<TextStyle>;

        /** Should the description be shown above the title (instead of the other way around) */
        shouldShowDescriptionOnTop?: boolean;

        /** Error to display at the bottom of the component */
        errorText?: string | ReactNode;

        /** Any additional styles to pass to error text. */
        errorTextStyle?: StyleProp<ViewStyle>;

        /** Hint to display at the bottom of the component */
        hintText?: string | ReactNode;

        /** Should the error text red dot indicator be shown */
        shouldShowRedDotIndicator?: boolean;

        /** A boolean flag that gives the icon a green fill if true */
        success?: boolean;

        /** Whether item is focused or active */
        focused?: boolean;

        /** Should we disable this menu item? */
        disabled?: boolean;

        /** Text that appears above the title */
        label?: string;

        /** Character limit after which the menu item text will be truncated */
        characterLimit?: number;

        isLabelHoverable?: boolean;

        /** Label to be displayed on the right */
        rightLabel?: string;

        /** Text to display for the item */
        title?: string;

        /** Accessibility label for the menu item */
        accessibilityLabel?: string;

        /** Component to display as the title */
        titleComponent?: ReactElement;

        /** Any additional styles to apply to the container for title components */
        titleContainerStyle?: StyleProp<ViewStyle>;

        /** A right-aligned subtitle for this menu option */
        subtitle?: string | number;

        /** Should the title show with normal font weight (not bold) */
        shouldShowBasicTitle?: boolean;

        /** Should we make this selectable with a checkbox */
        shouldShowSelectedState?: boolean;

        /** Should we truncate the title */
        shouldTruncateTitle?: boolean;

        /** Whether this item is selected */
        isSelected?: boolean;

        /** Prop to identify if we should load avatars vertically instead of diagonally */
        shouldStackHorizontally?: boolean;

        /** Prop to represent the size of the avatar images to be shown */
        avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;

        /** Affects avatar size  */
        viewMode?: ValueOf<typeof CONST.OPTION_MODE>;

        /** Used to truncate the text with an ellipsis after computing the text layout */
        numberOfLinesTitle?: number;

        /** Used to truncate the description with an ellipsis after computing the text layout */
        numberOfLinesDescription?: number;

        /**  Whether we should use small avatar subscript sizing the for menu item */
        isSmallAvatarSubscriptMenu?: boolean;

        /** The type of brick road indicator to show. */
        brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;

        /** Should render the content in HTML format */
        shouldRenderAsHTML?: boolean;

        /** Whether or not the text should be escaped */
        shouldEscapeText?: boolean;

        /** Should we grey out the menu item when it is disabled? */
        shouldGreyOutWhenDisabled?: boolean;

        /** Should we remove the background color of the menu item */
        shouldRemoveBackground?: boolean;

        /** Should we remove the hover background color of the menu item */
        shouldRemoveHoverBackground?: boolean;

        rightIconAccountID?: number | string;

        iconAccountID?: number;

        /** Should we use default cursor for disabled content */
        shouldUseDefaultCursorWhenDisabled?: boolean;

        /** The action accept for anonymous user or not */
        isAnonymousAction?: boolean;

        /** Flag to indicate whether or not text selection should be disabled from long-pressing the menu item. */
        shouldBlockSelection?: boolean;

        /** Whether should render title as HTML or as Text */
        shouldParseTitle?: boolean;

        /** Whether should render helper text as HTML or as Text */
        shouldParseHelperText?: boolean;

        /** Whether should render hint text as HTML or as Text */
        shouldRenderHintAsHTML?: boolean;

        /** Whether should render error text as HTML or as Text */
        shouldRenderErrorAsHTML?: boolean;

        /** List of markdown rules that will be ignored */
        excludedMarkdownRules?: string[];

        /** Should check anonymous user in onPress function */
        shouldCheckActionAllowedOnPress?: boolean;

        /** Text to display under the main item */
        furtherDetails?: string;

        /** The maximum number of lines for further details text */
        furtherDetailsNumberOfLines?: number;

        /** The further details additional style */
        furtherDetailsStyle?: StyleProp<TextStyle>;

        /** Render custom content under the main item */
        furtherDetailsComponent?: ReactElement;

        /** The function that should be called when this component is LongPressed or right-clicked. */
        onSecondaryInteraction?: (event: GestureResponderEvent | MouseEvent) => void;

        /** Array of objects that map display names to their corresponding tooltip */
        titleWithTooltips?: DisplayNameWithTooltip[] | undefined;

        /** Icon should be displayed in its own color */
        displayInDefaultIconColor?: boolean;

        /** Determines how the icon should be resized to fit its container */
        contentFit?: ImageContentFit;

        /** Is this in the Pane */
        isPaneMenu?: boolean;

        /** Adds padding to the left of the text when there is no icon. */
        shouldPutLeftPaddingWhenNoIcon?: boolean;

        /** Handles what to do when the item is focused */
        onFocus?: () => void;

        /** Handles what to do when the item loose focus */
        onBlur?: () => void;

        /** Optional account id if it's user avatar or policy id if it's workspace avatar */
        avatarID?: number | string;

        /** Whether to show the tooltip */
        shouldRenderTooltip?: boolean;

        /** Anchor alignment of the tooltip */
        tooltipAnchorAlignment?: TooltipAnchorAlignment;

        /** Additional styles for tooltip wrapper */
        tooltipWrapperStyle?: StyleProp<ViewStyle>;

        /** Any additional amount to manually adjust the horizontal position of the tooltip */
        tooltipShiftHorizontal?: number;

        /** Any additional amount to manually adjust the vertical position of the tooltip */
        tooltipShiftVertical?: number;

        /** Render custom content inside the tooltip. */
        renderTooltipContent?: () => ReactNode;

        /** Callback to fire when the education tooltip is pressed */
        onEducationTooltipPress?: () => void;

        /** Whether the tooltip should hide on scroll */
        shouldHideOnScroll?: boolean;

        shouldShowLoadingSpinnerIcon?: boolean;

        /** Should selected item be marked with checkmark */
        shouldShowSelectedItemCheck?: boolean;

        /** Should use auto width for the icon container. */
        shouldIconUseAutoWidthStyle?: boolean;

        /** Should break word for room title */
        shouldBreakWord?: boolean;

        /** Pressable component Test ID. Used to locate the component in tests. */
        pressableTestID?: string;

        /** Whether to teleport the portal to the modal layer */
        shouldTeleportPortalToModalLayer?: boolean;

        /** The value to copy in copy to clipboard action. Must be used in conjunction with `copyable=true`. Default value is `title` prop. */
        copyValue?: string;

        /** Should enable copy to clipboard action */
        copyable?: boolean;

        /** Plaid image for the bank */
        plaidUrl?: string;

        /** Report ID for the avatar */
        iconReportID?: string;

        /** Report ID for the avatar on the right */
        rightIconReportID?: string;

        /** Whether the menu item contains nested submenu items. */
        hasSubMenuItems?: boolean;

        /** Whether the screen containing the item is focused */
        isFocused?: boolean;

        /** Additional styles for the root wrapper View */
        rootWrapperStyle?: StyleProp<ViewStyle>;

        /** The accessibility role to use for this menu item */
        role?: Role;

        /** Whether to show the badge in a separate row */
        shouldShowBadgeInSeparateRow?: boolean;

        /** Whether to show the badge below the title */
        shouldShowBadgeBelow?: boolean;

        /** Whether item should be accessible */
        shouldBeAccessible?: boolean;

        /** Whether item should be focusable with keyboard */
        tabIndex?: 0 | -1;
    };

type MenuItemProps = (IconProps | AvatarProps | NoIcon) & MenuItemBaseProps;

const getSubscriptAvatarBackgroundColor = (isHovered: boolean, isPressed: boolean, hoveredBackgroundColor: string, pressedBackgroundColor: string) => {
    if (isPressed) {
        return pressedBackgroundColor;
    }
    if (isHovered) {
        return hoveredBackgroundColor;
    }
};

function MenuItem({
    interactive = true,
    onPress,
    badgeText,
    badgeIcon,
    badgeSuccess,
    badgeError,
    onBadgePress,
    shouldShowBadgeInSeparateRow = false,
    shouldShowBadgeBelow = false,
    style,
    wrapperStyle,
    titleWrapperStyle,
    outerWrapperStyle,
    containerStyle,
    titleStyle,
    labelStyle,
    descriptionTextStyle,
    badgeStyle,
    viewMode = CONST.OPTION_MODE.DEFAULT,
    numberOfLinesTitle = 1,
    numberOfLinesDescription = 2,
    icon,
    iconFill,
    secondaryIcon,
    secondaryIconFill,
    iconType = CONST.ICON_TYPE_ICON,
    isSecondaryIconHoverable = false,
    iconWidth,
    iconHeight,
    iconStyles,
    fallbackIcon,
    shouldShowTitleIcon = false,
    titleIcon,
    rightIconAccountID,
    iconAccountID,
    shouldShowRightIcon = false,
    iconRight,
    furtherDetailsIcon,
    furtherDetails,
    furtherDetailsNumberOfLines = 2,
    furtherDetailsStyle,
    furtherDetailsComponent,
    description,
    helperText,
    helperTextStyle,
    errorText,
    errorTextStyle,
    shouldShowRedDotIndicator,
    hintText,
    success = false,
    iconReportID,
    focused = false,
    disabled = false,
    title,
    accessibilityLabel,
    titleComponent,
    titleContainerStyle,
    subtitle,
    shouldShowBasicTitle,
    label,
    shouldTruncateTitle = false,
    characterLimit = 200,
    isLabelHoverable = true,
    rightLabel,
    shouldShowSelectedState = false,
    isSelected = false,
    shouldStackHorizontally = false,
    shouldShowDescriptionOnTop = false,
    shouldShowRightComponent = false,
    rightComponent,
    rightIconReportID,
    avatarSize = CONST.AVATAR_SIZE.DEFAULT,
    isSmallAvatarSubscriptMenu = false,
    brickRoadIndicator,
    shouldRenderAsHTML = false,
    shouldEscapeText = undefined,
    shouldGreyOutWhenDisabled = true,
    shouldRemoveBackground = false,
    shouldRemoveHoverBackground = false,
    shouldUseDefaultCursorWhenDisabled = false,
    shouldShowLoadingSpinnerIcon = false,
    isAnonymousAction = false,
    shouldBlockSelection = false,
    shouldParseTitle = false,
    shouldParseHelperText = false,
    shouldRenderHintAsHTML = false,
    shouldRenderErrorAsHTML = false,
    excludedMarkdownRules = [],
    shouldCheckActionAllowedOnPress = true,
    onSecondaryInteraction,
    titleWithTooltips,
    displayInDefaultIconColor = false,
    contentFit = 'cover',
    isPaneMenu = true,
    shouldPutLeftPaddingWhenNoIcon = false,
    onFocus,
    onBlur,
    avatarID,
    shouldRenderTooltip = false,
    shouldHideOnScroll = false,
    tooltipAnchorAlignment,
    tooltipWrapperStyle = {},
    tooltipShiftHorizontal = 0,
    tooltipShiftVertical = 0,
    renderTooltipContent,
    onEducationTooltipPress,
    additionalIconStyles,
    shouldShowSelectedItemCheck = false,
    shouldIconUseAutoWidthStyle = false,
    shouldBreakWord = false,
    pressableTestID,
    shouldTeleportPortalToModalLayer,
    plaidUrl,
    copyValue = title,
    copyable = false,
    hasSubMenuItems = false,
    forwardedFSClass,
    ref,
    isFocused,
    sentryLabel,
    rootWrapperStyle,
    role = CONST.ROLE.MENUITEM,
    shouldBeAccessible = true,
    tabIndex = 0,
}: MenuItemProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'FallbackAvatar', 'DotIndicator', 'Checkmark']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const combinedStyle = [styles.popoverMenuItem, style];
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isExecuting, singleExecution, waitForNavigate} = useContext(MenuItemGroupContext) ?? {};
    const popoverAnchor = useRef<View>(null);
    const deviceHasHoverSupport = hasHoverSupport();

    const isCompact = viewMode === CONST.OPTION_MODE.COMPACT;
    const isDeleted = style && Array.isArray(style) ? style.includes(styles.offlineFeedbackDeleted) : false;
    const descriptionVerticalMargin = shouldShowDescriptionOnTop ? styles.mb1 : styles.mt1;
    const defaultAccessibilityLabel = (shouldShowDescriptionOnTop ? [description, title] : [title, description]).filter(Boolean).join(', ');

    const combinedTitleTextStyle = StyleUtils.combineStyles<TextStyle>(
        [
            styles.flexShrink1,
            styles.popoverMenuText,
            // eslint-disable-next-line no-nested-ternary
            shouldPutLeftPaddingWhenNoIcon || (icon && !Array.isArray(icon)) ? (avatarSize === CONST.AVATAR_SIZE.SMALL ? styles.ml2 : styles.ml3) : {},
            shouldShowBasicTitle ? {} : styles.textStrong,
            numberOfLinesTitle !== 1 ? styles.preWrap : styles.pre,
            interactive && disabled ? {...styles.userSelectNone} : {},
            styles.ltr,
            isDeleted ? styles.offlineFeedbackDeleted : {},
            shouldBreakWord ? styles.breakWord : {},
            styles.mw100,
        ],
        (titleStyle ?? {}) as TextStyle,
    );

    const descriptionTextStyles = StyleUtils.combineStyles<TextStyle>([
        styles.textLabelSupporting,
        icon && !Array.isArray(icon) ? styles.ml3 : {},
        title ? descriptionVerticalMargin : StyleUtils.getFontSizeStyle(variables.fontSizeNormal),
        title ? styles.textLineHeightNormal : StyleUtils.getLineHeightStyle(variables.fontSizeNormalHeight),
        (descriptionTextStyle as TextStyle) || styles.breakWord,
        isDeleted ? styles.offlineFeedbackDeleted : {},
    ]);

    const html = useMemo(() => {
        if (!title || !shouldParseTitle) {
            return '';
        }
        return Parser.replace(title, {shouldEscapeText, disabledRules: excludedMarkdownRules});
    }, [title, shouldParseTitle, shouldEscapeText, excludedMarkdownRules]);

    const helperHtml = useMemo(() => {
        if (!helperText || !shouldParseHelperText) {
            return '';
        }
        return Parser.replace(helperText, {shouldEscapeText});
    }, [helperText, shouldParseHelperText, shouldEscapeText]);

    const processedTitle = useMemo(() => {
        let titleToWrap = '';
        if (shouldRenderAsHTML) {
            titleToWrap = title ?? '';
        }

        if (shouldParseTitle) {
            titleToWrap = html;
        }

        if (shouldTruncateTitle) {
            titleToWrap = Parser.truncateHTML(`<comment>${titleToWrap}</comment>`, characterLimit, {ellipsis: '...'});
            return titleToWrap;
        }

        return titleToWrap ? `<comment>${titleToWrap}</comment>` : '';
    }, [title, shouldRenderAsHTML, shouldParseTitle, characterLimit, shouldTruncateTitle, html]);

    const processedHelperText = useMemo(() => {
        let textToWrap = '';

        if (shouldParseHelperText) {
            textToWrap = helperHtml;
        }

        return textToWrap ? `<comment><muted-text-label>${textToWrap}</muted-text-label></comment>` : '';
    }, [shouldParseHelperText, helperHtml]);

    const hasPressableRightComponent = (iconRight ?? icons.ArrowRight) || (shouldShowRightComponent && rightComponent);

    const renderTitleContent = () => {
        if (title && titleWithTooltips && Array.isArray(titleWithTooltips) && titleWithTooltips.length > 0) {
            return (
                <DisplayNames
                    fullTitle={title}
                    shouldParseFullTitle={!shouldRenderAsHTML}
                    displayNamesWithTooltips={titleWithTooltips}
                    tooltipEnabled
                    numberOfLines={1}
                />
            );
        }

        const titleContainsTextAndCustomEmoji = containsCustomEmoji(title ?? '') && !containsOnlyCustomEmoji(title ?? '');

        if (title && titleContainsTextAndCustomEmoji) {
            return (
                <TextWithEmojiFragment
                    message={convertToLTR(title) || ''}
                    style={combinedTitleTextStyle}
                    alignCustomEmoji
                />
            );
        }

        return title ? convertToLTR(title) : '';
    };

    const onPressAction = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (disabled || !interactive) {
            return;
        }

        if (event?.type === 'click') {
            (event.currentTarget as HTMLElement).blur();
        }

        if (onPress && event) {
            if (!singleExecution || !waitForNavigate) {
                onPress(event);
                return;
            }
            singleExecution(
                waitForNavigate(() => {
                    onPress(event);
                }),
            )();
        }
    };

    const secondaryInteraction = (event: GestureResponderEvent | MouseEvent) => {
        if (!copyValue) {
            return;
        }
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.TEXT,
            event,
            selection: copyValue,
            contextMenuAnchor: popoverAnchor.current,
        });
        onSecondaryInteraction?.(event);
    };

    const isIDPassed = !!iconReportID || !!iconAccountID || iconAccountID === CONST.DEFAULT_NUMBER_ID;

    return (
        <View
            style={rootWrapperStyle}
            onBlur={onBlur}
        >
            {!!label && !isLabelHoverable && (
                <View style={[styles.ph5, labelStyle]}>
                    <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre])}>{label}</Text>
                </View>
            )}
            <EducationalTooltip
                shouldRender={shouldRenderTooltip}
                anchorAlignment={tooltipAnchorAlignment}
                renderTooltipContent={renderTooltipContent}
                wrapperStyle={tooltipWrapperStyle}
                shiftHorizontal={tooltipShiftHorizontal}
                shiftVertical={tooltipShiftVertical}
                shouldTeleportPortalToModalLayer={shouldTeleportPortalToModalLayer}
                onTooltipPress={onEducationTooltipPress}
                shouldHideOnScroll={shouldHideOnScroll}
            >
                <View>
                    <Hoverable isFocused={isFocused}>
                        {(isHovered) => (
                            <PressableWithSecondaryInteraction
                                onPress={shouldCheckActionAllowedOnPress ? callFunctionIfActionIsAllowed(onPressAction, isAnonymousAction) : onPressAction}
                                onPressIn={() => shouldBlockSelection && shouldUseNarrowLayout && canUseTouchScreen() && ControlSelection.block()}
                                onPressOut={ControlSelection.unblock}
                                onSecondaryInteraction={copyable && !deviceHasHoverSupport ? secondaryInteraction : onSecondaryInteraction}
                                wrapperStyle={outerWrapperStyle}
                                activeOpacity={!interactive ? 1 : variables.pressDimValue}
                                opacityAnimationDuration={0}
                                testID={pressableTestID}
                                style={({pressed}) =>
                                    [
                                        containerStyle,
                                        combinedStyle,
                                        !interactive && styles.cursorDefault,
                                        isCompact && styles.alignItemsCenter,
                                        isCompact && styles.optionRowCompact,
                                        !shouldRemoveBackground &&
                                            StyleUtils.getButtonBackgroundColorStyle(getButtonState(focused || isHovered, pressed, success, disabled, interactive), true),
                                        ...(Array.isArray(wrapperStyle) ? wrapperStyle : [wrapperStyle]),
                                        shouldGreyOutWhenDisabled && disabled && styles.buttonOpacityDisabled,
                                        isHovered && interactive && !focused && !pressed && !shouldRemoveBackground && !shouldRemoveHoverBackground && styles.hoveredComponentBG,
                                    ] as StyleProp<ViewStyle>
                                }
                                disabledStyle={shouldUseDefaultCursorWhenDisabled && [styles.cursorDefault]}
                                disabled={disabled || isExecuting}
                                ref={mergeRefs(ref, popoverAnchor)}
                                role={role}
                                accessibilityLabel={accessibilityLabel ?? defaultAccessibilityLabel}
                                accessible={shouldBeAccessible}
                                tabIndex={tabIndex}
                                onFocus={onFocus}
                                sentryLabel={sentryLabel}
                            >
                                {({pressed}) => (
                                    <View style={[styles.flex1]}>
                                        <View style={[styles.flexRow]}>
                                            <View style={[styles.flexColumn, styles.flex1]}>
                                                {!!label && isLabelHoverable && (
                                                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                                    <View style={[isIDPassed ? styles.mb2 : null, labelStyle]}>
                                                        <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre])}>
                                                            {label}
                                                        </Text>
                                                    </View>
                                                )}
                                                <View style={[styles.flexRow, styles.pointerEventsAuto, disabled && !shouldUseDefaultCursorWhenDisabled && styles.cursorDisabled]}>
                                                    {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
                                                    {isIDPassed && (
                                                        <ReportActionAvatars
                                                            subscriptAvatarBorderColor={getSubscriptAvatarBackgroundColor(isHovered, pressed, theme.hoverComponentBG, theme.buttonHoveredBG)}
                                                            singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
                                                            size={avatarSize}
                                                            secondaryAvatarContainerStyle={[
                                                                StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                                                pressed && interactive ? StyleUtils.getBackgroundAndBorderStyle(theme.buttonPressedBG) : undefined,
                                                                isHovered && !pressed && interactive ? StyleUtils.getBackgroundAndBorderStyle(theme.border) : undefined,
                                                            ]}
                                                            reportID={iconReportID}
                                                            accountIDs={iconAccountID ? [iconAccountID] : undefined}
                                                        />
                                                    )}
                                                    {!icon && shouldPutLeftPaddingWhenNoIcon && (
                                                        <View
                                                            style={[
                                                                styles.popoverMenuIcon,
                                                                iconStyles,
                                                                shouldIconUseAutoWidthStyle ? styles.wAuto : StyleUtils.getAvatarWidthStyle(avatarSize),
                                                            ]}
                                                        />
                                                    )}
                                                    {!!icon && !Array.isArray(icon) && (
                                                        <View
                                                            style={[
                                                                styles.popoverMenuIcon,
                                                                iconStyles,
                                                                shouldIconUseAutoWidthStyle ? styles.wAuto : StyleUtils.getAvatarWidthStyle(avatarSize),
                                                            ]}
                                                        >
                                                            {typeof icon !== 'string' &&
                                                                iconType === CONST.ICON_TYPE_ICON &&
                                                                (!shouldShowLoadingSpinnerIcon ? (
                                                                    <Icon
                                                                        contentFit={contentFit}
                                                                        hovered={isHovered}
                                                                        pressed={pressed}
                                                                        src={icon}
                                                                        width={iconWidth}
                                                                        height={iconHeight}
                                                                        fill={
                                                                            // eslint-disable-next-line no-nested-ternary
                                                                            displayInDefaultIconColor
                                                                                ? undefined
                                                                                : typeof iconFill === 'function'
                                                                                  ? iconFill(isHovered)
                                                                                  : (iconFill ??
                                                                                    StyleUtils.getIconFillColor(
                                                                                        getButtonState(focused || isHovered, pressed, success, disabled, interactive),
                                                                                        true,
                                                                                        isPaneMenu,
                                                                                    ))
                                                                        }
                                                                        additionalStyles={additionalIconStyles}
                                                                    />
                                                                ) : (
                                                                    <ActivityIndicator color={theme.textSupporting} />
                                                                ))}
                                                            {!!icon && iconType === CONST.ICON_TYPE_WORKSPACE && (
                                                                <Avatar
                                                                    imageStyles={[styles.alignSelfCenter]}
                                                                    size={CONST.AVATAR_SIZE.DEFAULT}
                                                                    source={icon}
                                                                    fallbackIcon={fallbackIcon ?? icons.FallbackAvatar}
                                                                    name={title}
                                                                    avatarID={avatarID}
                                                                    type={CONST.ICON_TYPE_WORKSPACE}
                                                                />
                                                            )}
                                                            {iconType === CONST.ICON_TYPE_AVATAR && (
                                                                <Avatar
                                                                    imageStyles={[styles.alignSelfCenter]}
                                                                    source={icon}
                                                                    avatarID={avatarID}
                                                                    fallbackIcon={fallbackIcon ?? icons.FallbackAvatar}
                                                                    size={avatarSize}
                                                                    type={CONST.ICON_TYPE_AVATAR}
                                                                />
                                                            )}
                                                            {iconType === CONST.ICON_TYPE_PLAID && !!plaidUrl && <PlaidCardFeedIcon plaidUrl={plaidUrl} />}
                                                        </View>
                                                    )}
                                                    {!!secondaryIcon && (
                                                        <View style={[styles.popoverMenuIcon, iconStyles, isSecondaryIconHoverable && StyleUtils.getBackgroundAndBorderStyle(theme.border)]}>
                                                            <Icon
                                                                contentFit={contentFit}
                                                                src={secondaryIcon}
                                                                width={iconWidth}
                                                                height={iconHeight}
                                                                fill={
                                                                    secondaryIconFill ??
                                                                    StyleUtils.getIconFillColor(getButtonState(focused || isHovered, pressed, success, disabled, interactive), true)
                                                                }
                                                            />
                                                        </View>
                                                    )}
                                                    <View
                                                        style={[
                                                            styles.justifyContentCenter,
                                                            styles.flex1,
                                                            StyleUtils.getMenuItemTextContainerStyle(isSmallAvatarSubscriptMenu || isCompact),
                                                            titleContainerStyle,
                                                        ]}
                                                    >
                                                        {!!description && shouldShowDescriptionOnTop && (
                                                            <Text
                                                                style={descriptionTextStyles}
                                                                numberOfLines={numberOfLinesDescription}
                                                            >
                                                                {description}
                                                            </Text>
                                                        )}
                                                        {(!!title || !!shouldShowTitleIcon) && (
                                                            <View
                                                                style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, titleWrapperStyle]}
                                                                fsClass={forwardedFSClass}
                                                            >
                                                                {!!title && (shouldRenderAsHTML || (shouldParseTitle && !!html.length)) && (
                                                                    <View style={styles.renderHTMLTitle}>
                                                                        <RenderHTML html={processedTitle} />
                                                                    </View>
                                                                )}
                                                                {!shouldRenderAsHTML && !shouldParseTitle && !!title && (
                                                                    <Text
                                                                        style={combinedTitleTextStyle}
                                                                        numberOfLines={numberOfLinesTitle || undefined}
                                                                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: interactive && disabled}}
                                                                    >
                                                                        {renderTitleContent()}
                                                                    </Text>
                                                                )}
                                                                {!!shouldShowTitleIcon && !!titleIcon && (
                                                                    <View style={[styles.ml2]}>
                                                                        <Icon
                                                                            src={titleIcon}
                                                                            fill={theme.iconSuccessFill}
                                                                        />
                                                                    </View>
                                                                )}
                                                            </View>
                                                        )}
                                                        {!!description && !shouldShowDescriptionOnTop && (
                                                            <Text
                                                                style={descriptionTextStyles}
                                                                numberOfLines={numberOfLinesDescription}
                                                            >
                                                                {description}
                                                            </Text>
                                                        )}
                                                        {!!furtherDetails && (
                                                            <View style={[styles.flexRow, styles.mt1, styles.alignItemsCenter]}>
                                                                {!!furtherDetailsIcon && (
                                                                    <Icon
                                                                        src={furtherDetailsIcon}
                                                                        height={variables.iconSizeNormal}
                                                                        width={variables.iconSizeNormal}
                                                                        inline
                                                                    />
                                                                )}
                                                                <Text
                                                                    style={[
                                                                        furtherDetailsIcon ? [styles.furtherDetailsText, styles.ph2, styles.pt1] : styles.textLabelSupporting,
                                                                        furtherDetailsStyle,
                                                                    ]}
                                                                    numberOfLines={furtherDetailsNumberOfLines}
                                                                >
                                                                    {furtherDetails}
                                                                </Text>
                                                            </View>
                                                        )}
                                                        {!!badgeText && shouldShowBadgeBelow && (
                                                            <Badge
                                                                text={badgeText}
                                                                icon={badgeIcon}
                                                                badgeStyles={[badgeStyle, styles.alignSelfStart, styles.ml3, styles.mt2]}
                                                                success={badgeSuccess}
                                                                onPress={onBadgePress}
                                                                pressable={!!onBadgePress}
                                                            />
                                                        )}
                                                        {furtherDetailsComponent}
                                                        {titleComponent}
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={[styles.flexRow, StyleUtils.getMenuItemTextContainerStyle(isCompact), !hasPressableRightComponent && styles.pointerEventsNone]}>
                                                {!!badgeText && !shouldShowBadgeInSeparateRow && !shouldShowBadgeBelow && (
                                                    <Badge
                                                        text={badgeText}
                                                        icon={badgeIcon}
                                                        badgeStyles={badgeStyle}
                                                        success={badgeSuccess}
                                                        error={badgeError}
                                                        onPress={onBadgePress}
                                                        pressable={!!onBadgePress}
                                                    />
                                                )}
                                                {/* Since subtitle can be of type number, we should allow 0 to be shown */}
                                                {(subtitle === 0 || !!subtitle) && (
                                                    <View style={[styles.justifyContentCenter, styles.mr1]}>
                                                        <Text style={[styles.textLabelSupporting, ...(combinedStyle as TextStyle[])]}>{subtitle}</Text>
                                                    </View>
                                                )}
                                                {(!!rightIconAccountID || !!rightIconReportID) && (
                                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter, brickRoadIndicator ? styles.mr2 : styles.mrn2]}>
                                                        <ReportActionAvatars
                                                            subscriptAvatarBorderColor={isHovered ? theme.activeComponentBG : theme.componentBG}
                                                            singleAvatarContainerStyle={[styles.actionAvatar, styles.mr2]}
                                                            reportID={rightIconReportID}
                                                            size={CONST.AVATAR_SIZE.SMALL}
                                                            horizontalStacking={
                                                                shouldStackHorizontally && {
                                                                    isHovered,
                                                                    isPressed: pressed,
                                                                }
                                                            }
                                                            accountIDs={!!rightIconAccountID && Number(rightIconAccountID) > 0 ? [Number(rightIconAccountID)] : undefined}
                                                            useMidSubscriptSizeForMultipleAvatars
                                                        />
                                                    </View>
                                                )}
                                                {!!brickRoadIndicator && (
                                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.ml1]}>
                                                        <Icon
                                                            src={icons.DotIndicator}
                                                            fill={brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR ? theme.danger : theme.success}
                                                        />
                                                    </View>
                                                )}
                                                {!title && !!rightLabel && !errorText && (
                                                    <View style={styles.justifyContentCenter}>
                                                        <Text style={styles.rightLabelMenuItem}>{rightLabel}</Text>
                                                    </View>
                                                )}
                                                {shouldShowRightIcon && (
                                                    <View
                                                        style={[
                                                            styles.pointerEventsAuto,
                                                            StyleUtils.getMenuItemIconStyle(isCompact),
                                                            disabled && !shouldUseDefaultCursorWhenDisabled && styles.cursorDisabled,
                                                            hasSubMenuItems && styles.opacitySemiTransparent,
                                                            hasSubMenuItems && styles.pl6,
                                                        ]}
                                                    >
                                                        <Icon
                                                            src={iconRight ?? icons.ArrowRight}
                                                            fill={StyleUtils.getIconFillColor(getButtonState(focused || isHovered, pressed, success, disabled, interactive))}
                                                            width={hasSubMenuItems ? variables.iconSizeSmall : variables.iconSizeNormal}
                                                            height={hasSubMenuItems ? variables.iconSizeSmall : variables.iconSizeNormal}
                                                        />
                                                    </View>
                                                )}
                                                {shouldShowRightComponent && rightComponent}
                                                {shouldShowSelectedState && <SelectCircle isChecked={isSelected} />}
                                                {shouldShowSelectedItemCheck && isSelected && (
                                                    <Icon
                                                        src={icons.Checkmark}
                                                        fill={theme.iconSuccessFill}
                                                        additionalStyles={styles.alignSelfCenter}
                                                    />
                                                )}
                                                {copyable && deviceHasHoverSupport && !interactive && isHovered && !!copyValue && (
                                                    <View style={styles.justifyContentCenter}>
                                                        <CopyTextToClipboard
                                                            urlToCopy={copyValue}
                                                            shouldHaveActiveBackground
                                                            iconHeight={variables.iconSizeExtraSmall}
                                                            iconWidth={variables.iconSizeExtraSmall}
                                                            iconStyles={styles.t0}
                                                            styles={styles.reportActionContextMenuMiniButton}
                                                            shouldUseButtonBackground
                                                        />
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        {!!badgeText && shouldShowBadgeInSeparateRow && (
                                            <Badge
                                                text={badgeText}
                                                icon={badgeIcon}
                                                badgeStyles={[badgeStyle, styles.alignSelfStart, styles.ml13, styles.mt2]}
                                                success={badgeSuccess}
                                                onPress={onBadgePress}
                                                pressable={!!onBadgePress}
                                            />
                                        )}
                                        {!!errorText && (
                                            <FormHelpMessage
                                                isError
                                                shouldShowRedDotIndicator={!!shouldShowRedDotIndicator}
                                                message={errorText}
                                                style={[styles.menuItemError, errorTextStyle]}
                                                shouldRenderMessageAsHTML={shouldRenderErrorAsHTML}
                                            />
                                        )}
                                        {!!hintText && (
                                            <FormHelpMessage
                                                isError={false}
                                                shouldShowRedDotIndicator={false}
                                                message={hintText}
                                                style={styles.menuItemError}
                                                shouldRenderMessageAsHTML={shouldRenderHintAsHTML}
                                            />
                                        )}
                                    </View>
                                )}
                            </PressableWithSecondaryInteraction>
                        )}
                    </Hoverable>
                    {!!helperText &&
                        (shouldParseHelperText ? (
                            <View style={[styles.flexRow, styles.renderHTML, styles.ph5, styles.pb5]}>
                                <RenderHTML html={processedHelperText} />
                            </View>
                        ) : (
                            <Text style={[styles.mutedNormalTextLabel, styles.ph5, styles.pb5, helperTextStyle]}>{helperText}</Text>
                        ))}
                </View>
            </EducationalTooltip>
        </View>
    );
}

export type {MenuItemBaseProps, MenuItemProps};
export default MenuItem;
