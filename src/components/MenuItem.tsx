import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import type {ImageContentFit} from 'expo-image';
import type {ReactNode} from 'react';
import React, {forwardRef, useContext, useMemo} from 'react';
import type {GestureResponderEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ControlSelection from '@libs/ControlSelection';
import convertToLTR from '@libs/convertToLTR';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getButtonState from '@libs/getButtonState';
import type {MaybePhraseKey} from '@libs/Localize';
import type {AvatarSource} from '@libs/UserUtils';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import Avatar from './Avatar';
import Badge from './Badge';
import DisplayNames from './DisplayNames';
import type {DisplayNameWithTooltip} from './DisplayNames/types';
import FormHelpMessage from './FormHelpMessage';
import Hoverable from './Hoverable';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import * as defaultWorkspaceAvatars from './Icon/WorkspaceDefaultAvatars';
import {MenuItemGroupContext} from './MenuItemGroup';
import MultipleAvatars from './MultipleAvatars';
import type {PressableRef} from './Pressable/GenericPressable/types';
import PressableWithSecondaryInteraction from './PressableWithSecondaryInteraction';
import RenderHTML from './RenderHTML';
import SelectCircle from './SelectCircle';
import SubscriptAvatar from './SubscriptAvatar';
import Text from './Text';

type IconProps = {
    /** Flag to choose between avatar image or an icon */
    iconType?: typeof CONST.ICON_TYPE_ICON;

    /** Icon to display on the left side of component */
    icon: IconAsset | IconType[];
};

type AvatarProps = {
    iconType?: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;

    icon: AvatarSource | IconType[];
};

type NoIcon = {
    iconType?: undefined;

    icon?: undefined;
};

type MenuItemBaseProps = {
    /** Function to fire when component is pressed */
    onPress?: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

    /** Whether the menu item should be interactive at all */
    interactive?: boolean;

    /** Text to be shown as badge near the right end. */
    badgeText?: string;

    /** Used to apply offline styles to child text components */
    style?: StyleProp<ViewStyle>;

    /** Outer wrapper styles */
    outerWrapperStyle?: StyleProp<ViewStyle>;

    /** Any additional styles to apply */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Any additional styles to apply on the outer element */
    containerStyle?: StyleProp<ViewStyle>;

    /** Used to apply styles specifically to the title */
    titleStyle?: ViewStyle;

    /** Any additional styles to apply on the badge element */
    badgeStyle?: ViewStyle;

    /** Any adjustments to style when menu item is hovered or pressed */
    hoverAndPressStyle?: StyleProp<AnimatedStyle<ViewStyle>>;

    /** Additional styles to style the description text below the title */
    descriptionTextStyle?: StyleProp<TextStyle>;

    /** The fill color to pass into the icon. */
    iconFill?: string;

    /** Secondary icon to display on the left side of component, right of the icon */
    secondaryIcon?: IconAsset;

    /** The fill color to pass into the secondary icon. */
    secondaryIconFill?: string;

    /** Icon Width */
    iconWidth?: number;

    /** Icon Height */
    iconHeight?: number;

    /** Any additional styles to pass to the icon container. */
    iconStyles?: StyleProp<ViewStyle>;

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

    /** Should the description be shown above the title (instead of the other way around) */
    shouldShowDescriptionOnTop?: boolean;

    /** Error to display below the title */
    error?: string;

    /** Error to display at the bottom of the component */
    errorText?: MaybePhraseKey;

    /** A boolean flag that gives the icon a green fill if true */
    success?: boolean;

    /** Whether item is focused or active */
    focused?: boolean;

    /** Should we disable this menu item? */
    disabled?: boolean;

    /** Text that appears above the title */
    label?: string;

    isLabelHoverable?: boolean;

    /** Label to be displayed on the right */
    rightLabel?: string;

    /** Text to display for the item */
    title?: string;

    /** A right-aligned subtitle for this menu option */
    subtitle?: string | number;

    /** Should the title show with normal font weight (not bold) */
    shouldShowBasicTitle?: boolean;

    /** Should we make this selectable with a checkbox */
    shouldShowSelectedState?: boolean;

    /** Whether this item is selected */
    isSelected?: boolean;

    /** Prop to identify if we should load avatars vertically instead of diagonally */
    shouldStackHorizontally?: boolean;

    /** Prop to represent the size of the avatar images to be shown */
    avatarSize?: (typeof CONST.AVATAR_SIZE)[keyof typeof CONST.AVATAR_SIZE];

    /** Avatars to show on the right of the menu item */
    floatRightAvatars?: IconType[];

    /** Prop to represent the size of the float right avatar images to be shown */
    floatRightAvatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Whether the secondary right avatar should show as a subscript */
    shouldShowSubscriptRightAvatar?: boolean;

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

    /** Should we grey out the menu item when it is disabled? */
    shouldGreyOutWhenDisabled?: boolean;

    /** Should we use default cursor for disabled content */
    shouldUseDefaultCursorWhenDisabled?: boolean;

    /** The action accept for anonymous user or not */
    isAnonymousAction?: boolean;

    /** Flag to indicate whether or not text selection should be disabled from long-pressing the menu item. */
    shouldBlockSelection?: boolean;

    /** Whether should render title as HTML or as Text */
    shouldParseTitle?: boolean;

    /** Should check anonymous user in onPress function */
    shouldCheckActionAllowedOnPress?: boolean;

    /** Text to display under the main item */
    furtherDetails?: string;

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

    /** The text to display under the title */
    underTitle?: string;
};

type MenuItemProps = (IconProps | AvatarProps | NoIcon) & MenuItemBaseProps;

function MenuItem(
    {
        interactive = true,
        onPress,
        badgeText,
        style,
        wrapperStyle,
        outerWrapperStyle,
        containerStyle,
        titleStyle,
        hoverAndPressStyle,
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
        iconWidth,
        iconHeight,
        iconStyles,
        fallbackIcon = Expensicons.FallbackAvatar,
        shouldShowTitleIcon = false,
        titleIcon,
        shouldShowRightIcon = false,
        iconRight = Expensicons.ArrowRight,
        furtherDetailsIcon,
        furtherDetails,
        description,
        error,
        errorText,
        success = false,
        focused = false,
        disabled = false,
        title,
        subtitle,
        shouldShowBasicTitle,
        label,
        isLabelHoverable = true,
        rightLabel,
        shouldShowSelectedState = false,
        isSelected = false,
        shouldStackHorizontally = false,
        shouldShowDescriptionOnTop = false,
        shouldShowRightComponent = false,
        rightComponent,
        floatRightAvatars = [],
        floatRightAvatarSize,
        shouldShowSubscriptRightAvatar = false,
        avatarSize = CONST.AVATAR_SIZE.DEFAULT,
        isSmallAvatarSubscriptMenu = false,
        brickRoadIndicator,
        shouldRenderAsHTML = false,
        shouldGreyOutWhenDisabled = true,
        shouldUseDefaultCursorWhenDisabled = false,
        isAnonymousAction = false,
        shouldBlockSelection = false,
        shouldParseTitle = false,
        shouldCheckActionAllowedOnPress = true,
        onSecondaryInteraction,
        titleWithTooltips,
        displayInDefaultIconColor = false,
        contentFit = 'cover',
        isPaneMenu = false,
        shouldPutLeftPaddingWhenNoIcon = false,
        onFocus,
        underTitle,
    }: MenuItemProps,
    ref: PressableRef,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const combinedStyle = [style, styles.popoverMenuItem];
    const {isSmallScreenWidth} = useWindowDimensions();
    const {isExecuting, singleExecution, waitForNavigate} = useContext(MenuItemGroupContext) ?? {};

    const isDeleted = style && Array.isArray(style) ? style.includes(styles.offlineFeedback.deleted) : false;
    const descriptionVerticalMargin = shouldShowDescriptionOnTop ? styles.mb1 : styles.mt1;
    const fallbackAvatarSize = viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT;
    const combinedTitleTextStyle = StyleUtils.combineStyles(
        [
            styles.flexShrink1,
            styles.popoverMenuText,
            // eslint-disable-next-line no-nested-ternary
            shouldPutLeftPaddingWhenNoIcon || (icon && !Array.isArray(icon)) ? (avatarSize === CONST.AVATAR_SIZE.SMALL ? styles.ml2 : styles.ml3) : {},
            shouldShowBasicTitle ? {} : styles.textStrong,
            numberOfLinesTitle !== 1 ? styles.preWrap : styles.pre,
            interactive && disabled ? {...styles.userSelectNone} : {},
            styles.ltr,
            isDeleted ? styles.offlineFeedback.deleted : {},
        ],
        titleStyle ?? {},
    );
    const descriptionTextStyles = StyleUtils.combineStyles<TextStyle>([
        styles.textLabelSupporting,
        icon && !Array.isArray(icon) ? styles.ml3 : {},
        title ? descriptionVerticalMargin : StyleUtils.getFontSizeStyle(variables.fontSizeNormal),
        (descriptionTextStyle as TextStyle) || styles.breakWord,
        isDeleted ? styles.offlineFeedback.deleted : {},
    ]);

    const html = useMemo(() => {
        if (!title || !shouldParseTitle) {
            return '';
        }
        const parser = new ExpensiMark();
        return parser.replace(title);
    }, [title, shouldParseTitle]);

    const processedTitle = useMemo(() => {
        let titleToWrap = '';
        if (shouldRenderAsHTML) {
            titleToWrap = title ? convertToLTR(title) : '';
        }

        if (shouldParseTitle) {
            titleToWrap = html;
        }

        return titleToWrap ? `<comment>${titleToWrap}</comment>` : '';
    }, [title, shouldRenderAsHTML, shouldParseTitle, html]);

    const hasPressableRightComponent = iconRight || (shouldShowRightComponent && rightComponent);

    const renderTitleContent = () => {
        if (title && titleWithTooltips && Array.isArray(titleWithTooltips) && titleWithTooltips.length > 0) {
            return (
                <DisplayNames
                    fullTitle={title}
                    displayNamesWithTooltips={titleWithTooltips}
                    tooltipEnabled
                    numberOfLines={1}
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

    return (
        <View>
            {!!label && !isLabelHoverable && (
                <View style={[styles.ph5]}>
                    <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre])}>{label}</Text>
                </View>
            )}
            <Hoverable>
                {(isHovered) => (
                    <PressableWithSecondaryInteraction
                        onPress={shouldCheckActionAllowedOnPress ? Session.checkIfActionIsAllowed(onPressAction, isAnonymousAction) : onPressAction}
                        onPressIn={() => shouldBlockSelection && isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                        onPressOut={ControlSelection.unblock}
                        onSecondaryInteraction={onSecondaryInteraction}
                        wrapperStyle={outerWrapperStyle}
                        style={({pressed}) =>
                            [
                                containerStyle,
                                errorText ? styles.pb5 : {},
                                combinedStyle,
                                !interactive && styles.cursorDefault,
                                StyleUtils.getButtonBackgroundColorStyle(getButtonState(focused || isHovered, pressed, success, disabled, interactive), true),
                                ...(Array.isArray(wrapperStyle) ? wrapperStyle : [wrapperStyle]),
                                !focused && (isHovered || pressed) && hoverAndPressStyle,
                                shouldGreyOutWhenDisabled && disabled && styles.buttonOpacityDisabled,
                            ] as StyleProp<ViewStyle>
                        }
                        disabledStyle={shouldUseDefaultCursorWhenDisabled && [styles.cursorDefault]}
                        disabled={disabled || isExecuting}
                        ref={ref}
                        role={CONST.ROLE.MENUITEM}
                        accessibilityLabel={title ? title.toString() : ''}
                        accessible
                        onFocus={onFocus}
                    >
                        {({pressed}) => (
                            <>
                                <View style={[styles.flexColumn, styles.flex1]}>
                                    {!!label && isLabelHoverable && (
                                        <View style={icon ? styles.mb2 : null}>
                                            <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre])}>
                                                {label}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={[styles.flexRow, styles.pointerEventsAuto, disabled && !shouldUseDefaultCursorWhenDisabled && styles.cursorDisabled]}>
                                        {!!icon && Array.isArray(icon) && (
                                            <MultipleAvatars
                                                isHovered={isHovered}
                                                isPressed={pressed}
                                                icons={icon as IconType[]}
                                                size={avatarSize}
                                                secondAvatarStyle={[
                                                    StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                                    pressed && interactive ? StyleUtils.getBackgroundAndBorderStyle(theme.buttonPressedBG) : undefined,
                                                    isHovered && !pressed && interactive ? StyleUtils.getBackgroundAndBorderStyle(theme.border) : undefined,
                                                ]}
                                            />
                                        )}
                                        {!icon && shouldPutLeftPaddingWhenNoIcon && <View style={[styles.popoverMenuIcon, iconStyles, StyleUtils.getAvatarWidthStyle(avatarSize)]} />}
                                        {icon && !Array.isArray(icon) && (
                                            <View style={[styles.popoverMenuIcon, iconStyles, StyleUtils.getAvatarWidthStyle(avatarSize)]}>
                                                {typeof icon !== 'string' && iconType === CONST.ICON_TYPE_ICON && (
                                                    <Icon
                                                        contentFit={contentFit}
                                                        hovered={isHovered}
                                                        pressed={pressed}
                                                        src={icon}
                                                        width={iconWidth}
                                                        height={iconHeight}
                                                        fill={
                                                            displayInDefaultIconColor
                                                                ? undefined
                                                                : iconFill ??
                                                                  StyleUtils.getIconFillColor(getButtonState(focused || isHovered, pressed, success, disabled, interactive), true, isPaneMenu)
                                                        }
                                                    />
                                                )}
                                                {icon && iconType === CONST.ICON_TYPE_WORKSPACE && (
                                                    <Avatar
                                                        imageStyles={[styles.alignSelfCenter]}
                                                        size={CONST.AVATAR_SIZE.DEFAULT}
                                                        source={icon as AvatarSource}
                                                        fallbackIcon={fallbackIcon}
                                                        name={title}
                                                        type={CONST.ICON_TYPE_WORKSPACE}
                                                    />
                                                )}
                                                {iconType === CONST.ICON_TYPE_AVATAR && (
                                                    <Avatar
                                                        imageStyles={[styles.alignSelfCenter]}
                                                        source={icon as AvatarSource}
                                                        fallbackIcon={fallbackIcon}
                                                        size={avatarSize}
                                                    />
                                                )}
                                            </View>
                                        )}
                                        {secondaryIcon && (
                                            <View style={[styles.popoverMenuIcon, iconStyles]}>
                                                <Icon
                                                    contentFit={contentFit}
                                                    src={secondaryIcon}
                                                    width={iconWidth}
                                                    height={iconHeight}
                                                    fill={
                                                        secondaryIconFill ?? StyleUtils.getIconFillColor(getButtonState(focused || isHovered, pressed, success, disabled, interactive), true)
                                                    }
                                                />
                                            </View>
                                        )}
                                        <View style={[styles.justifyContentCenter, styles.flex1, StyleUtils.getMenuItemTextContainerStyle(isSmallAvatarSubscriptMenu)]}>
                                            {!!description && shouldShowDescriptionOnTop && (
                                                <Text
                                                    style={descriptionTextStyles}
                                                    numberOfLines={numberOfLinesDescription}
                                                >
                                                    {description}
                                                </Text>
                                            )}
                                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
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
                                                {shouldShowTitleIcon && titleIcon && (
                                                    <View style={[styles.ml2]}>
                                                        <Icon
                                                            src={titleIcon}
                                                            fill={theme.iconSuccessFill}
                                                        />
                                                    </View>
                                                )}
                                            </View>
                                            {!!description && !shouldShowDescriptionOnTop && (
                                                <Text
                                                    style={descriptionTextStyles}
                                                    numberOfLines={numberOfLinesDescription}
                                                >
                                                    {description}
                                                </Text>
                                            )}
                                            {!!error && (
                                                <View style={[styles.mt1]}>
                                                    <Text style={[styles.textLabelError]}>{error}</Text>
                                                </View>
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
                                                        style={furtherDetailsIcon ? [styles.furtherDetailsText, styles.ph2, styles.pt1] : styles.textLabelSupporting}
                                                        numberOfLines={2}
                                                    >
                                                        {furtherDetails}
                                                    </Text>
                                                </View>
                                            )}
                                            {underTitle && (
                                                <View style={styles.mt1}>
                                                    <Text
                                                        style={[styles.textLabelSupporting]}
                                                        numberOfLines={1}
                                                    >
                                                        {underTitle}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.flexRow, styles.menuItemTextContainer, !hasPressableRightComponent && styles.pointerEventsNone]}>
                                    {badgeText && (
                                        <Badge
                                            text={badgeText}
                                            badgeStyles={badgeStyle}
                                        />
                                    )}
                                    {/* Since subtitle can be of type number, we should allow 0 to be shown */}
                                    {(subtitle === 0 || subtitle) && (
                                        <View style={[styles.justifyContentCenter, styles.mr1]}>
                                            <Text style={[styles.textLabelSupporting, ...(combinedStyle as TextStyle[])]}>{subtitle}</Text>
                                        </View>
                                    )}
                                    {floatRightAvatars?.length > 0 && (
                                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, brickRoadIndicator ? styles.mr2 : styles.mrn2]}>
                                            {shouldShowSubscriptRightAvatar ? (
                                                <SubscriptAvatar
                                                    backgroundColor={isHovered ? theme.activeComponentBG : theme.componentBG}
                                                    mainAvatar={floatRightAvatars[0]}
                                                    secondaryAvatar={floatRightAvatars[1]}
                                                    size={floatRightAvatarSize ?? fallbackAvatarSize}
                                                />
                                            ) : (
                                                <MultipleAvatars
                                                    isHovered={isHovered}
                                                    isPressed={pressed}
                                                    icons={floatRightAvatars}
                                                    size={floatRightAvatarSize ?? fallbackAvatarSize}
                                                    fallbackIcon={defaultWorkspaceAvatars.WorkspaceBuilding}
                                                    shouldStackHorizontally={shouldStackHorizontally}
                                                    isFocusMode
                                                />
                                            )}
                                        </View>
                                    )}
                                    {!!brickRoadIndicator && (
                                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.ml1, styles.mr2]}>
                                            <Icon
                                                src={Expensicons.DotIndicator}
                                                fill={brickRoadIndicator === 'error' ? theme.danger : theme.success}
                                            />
                                        </View>
                                    )}
                                    {!title && !!rightLabel && (
                                        <View style={styles.justifyContentCenter}>
                                            <Text style={styles.rightLabelMenuItem}>{rightLabel}</Text>
                                        </View>
                                    )}
                                    {shouldShowRightIcon && (
                                        <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, disabled && !shouldUseDefaultCursorWhenDisabled && styles.cursorDisabled]}>
                                            <Icon
                                                src={iconRight}
                                                fill={StyleUtils.getIconFillColor(getButtonState(focused || isHovered, pressed, success, disabled, interactive))}
                                            />
                                        </View>
                                    )}
                                    {shouldShowRightComponent && rightComponent}
                                    {shouldShowSelectedState && <SelectCircle isChecked={isSelected} />}
                                </View>
                                {!!errorText && (
                                    <FormHelpMessage
                                        isError
                                        shouldShowRedDotIndicator={false}
                                        message={errorText}
                                        style={styles.menuItemError}
                                    />
                                )}
                            </>
                        )}
                    </PressableWithSecondaryInteraction>
                )}
            </Hoverable>
        </View>
    );
}

MenuItem.displayName = 'MenuItem';

export type {AvatarProps, IconProps, MenuItemBaseProps, MenuItemProps, NoIcon};
export default forwardRef(MenuItem);
