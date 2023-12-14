import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {FC, ForwardedRef, forwardRef, ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {GestureResponderEvent, PressableStateCallbackType, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import {AnimatedStyle} from 'react-native-reanimated';
import {SvgProps} from 'react-native-svg';
// eslint-disable-next-line no-restricted-imports
import _ from 'underscore';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ControlSelection from '@libs/ControlSelection';
import convertToLTR from '@libs/convertToLTR';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getButtonState from '@libs/getButtonState';
import {AvatarSource} from '@libs/UserUtils';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import Avatar from './Avatar';
import Badge from './Badge';
import DisplayNames from './DisplayNames';
import {DisplayNameWithTooltip} from './DisplayNames/types';
import FormHelpMessage from './FormHelpMessage';
import Hoverable from './Hoverable';
import Icon, {SrcProps} from './Icon';
import * as Expensicons from './Icon/Expensicons';
import * as defaultWorkspaceAvatars from './Icon/WorkspaceDefaultAvatars';
import MultipleAvatars from './MultipleAvatars';
import PressableWithSecondaryInteraction from './PressableWithSecondaryInteraction';
import RenderHTML from './RenderHTML';
import SelectCircle from './SelectCircle';
import Text from './Text';

type ResponsiveProps = {
    /** Function to fire when component is pressed */
    onPress: (event: GestureResponderEvent | KeyboardEvent) => void;

    interactive?: true;
};

type UnresponsiveProps = {
    onPress?: undefined;

    /** Whether the menu item should be interactive at all */
    interactive: false;
};

type IconProps = {
    /** Flag to choose between avatar image or an icon */
    iconType: typeof CONST.ICON_TYPE_ICON;

    /** Icon to display on the left side of component */
    icon: (props: SrcProps) => ReactNode;
};

type AvatarProps = {
    iconType: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;

    icon: AvatarSource;
};

type MenuItemProps = (ResponsiveProps | UnresponsiveProps) &
    (IconProps | AvatarProps) & {
        /** Text to be shown as badge near the right end. */
        badgeText?: string;

        /** Used to apply offline styles to child text components */
        style?: ViewStyle;

        /** Any additional styles to apply */
        wrapperStyle?: StyleProp<ViewStyle>;

        /** Any additional styles to apply on the outer element */
        containerStyle?: StyleProp<ViewStyle>;

        /** Used to apply styles specifically to the title */
        titleStyle?: ViewStyle;

        /** Any adjustments to style when menu item is hovered or pressed */
        hoverAndPressStyle: StyleProp<AnimatedStyle<ViewStyle>>;

        descriptionTextStyle?: StyleProp<ViewStyle>;

        /** The fill color to pass into the icon. */
        iconFill?: string;

        /** Secondary icon to display on the left side of component, right of the icon */
        secondaryIcon?: (props: SrcProps) => React.ReactNode;

        /** The fill color to pass into the secondary icon. */
        secondaryIconFill?: string;

        /** Icon Width */
        iconWidth?: number;

        /** Icon Height */
        iconHeight?: number;

        /** Any additional styles to pass to the icon container. */
        iconStyles?: StyleProp<ViewStyle>;

        /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
        fallbackIcon?: FC<SvgProps>;

        /** An icon to display under the main item */
        furtherDetailsIcon?: (props: SrcProps) => ReactNode;

        /** Boolean whether to display the title right icon */
        shouldShowTitleIcon?: boolean;

        /** Icon to display at right side of title */
        titleIcon?: (props: SrcProps) => ReactNode;

        /** Boolean whether to display the right icon */
        shouldShowRightIcon?: boolean;

        /** Overrides the icon for shouldShowRightIcon */
        iconRight?: (props: SrcProps) => ReactNode;

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
        errorText?: string;

        /** A boolean flag that gives the icon a green fill if true */
        success?: boolean;

        /** Whether item is focused or active */
        focused?: boolean;

        /** Should we disable this menu item? */
        disabled?: boolean;

        /** Text that appears above the title */
        label?: string;

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
        shouldStackHorizontally: boolean;

        /** Prop to represent the size of the avatar images to be shown */
        avatarSize?: (typeof CONST.AVATAR_SIZE)[keyof typeof CONST.AVATAR_SIZE];

        /** Avatars to show on the right of the menu item */
        floatRightAvatars?: IconType[];

        /** Prop to represent the size of the float right avatar images to be shown */
        floatRightAvatarSize?: (typeof CONST.AVATAR_SIZE)[keyof typeof CONST.AVATAR_SIZE];

        viewMode?: (typeof CONST.OPTION_MODE)[keyof typeof CONST.OPTION_MODE];

        numberOfLinesTitle?: number;

        /**  Whether we should use small avatar subscript sizing the for menu item */
        isSmallAvatarSubscriptMenu?: boolean;

        /** The type of brick road indicator to show. */
        brickRoadIndicator?: (typeof CONST.BRICK_ROAD_INDICATOR_STATUS)[keyof typeof CONST.BRICK_ROAD_INDICATOR_STATUS];

        /** Should render the content in HTML format */
        shouldRenderAsHTML?: boolean;

        /** Should we grey out the menu item when it is disabled? */
        shouldGreyOutWhenDisabled?: boolean;

        /** The action accept for anonymous user or not */
        isAnonymousAction?: boolean;

        /** Flag to indicate whether or not text selection should be disabled from long-pressing the menu item. */
        shouldBlockSelection?: boolean;

        shouldParseTitle?: false;

        /** Should check anonymous user in onPress function */
        shouldCheckActionAllowedOnPress?: boolean;

        /** Text to display under the main item */
        furtherDetails?: string;

        /** The function that should be called when this component is LongPressed or right-clicked. */
        onSecondaryInteraction: () => void;

        /** Array of objects that map display names to their corresponding tooltip */
        titleWithTooltips: DisplayNameWithTooltip[];
    };

function MenuItem(
    {
        interactive = true,
        onPress,
        badgeText,
        style,
        wrapperStyle,
        containerStyle,
        titleStyle,
        hoverAndPressStyle,
        descriptionTextStyle,
        viewMode = CONST.OPTION_MODE.DEFAULT,
        numberOfLinesTitle = 1,
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
        rightLabel,
        shouldShowSelectedState = false,
        isSelected = false,
        shouldStackHorizontally = false,
        shouldShowDescriptionOnTop = false,
        shouldShowRightComponent = false,
        rightComponent,
        floatRightAvatars = [],
        floatRightAvatarSize,
        avatarSize = CONST.AVATAR_SIZE.DEFAULT,
        isSmallAvatarSubscriptMenu = false,
        brickRoadIndicator,
        shouldRenderAsHTML = false,
        shouldGreyOutWhenDisabled = true,
        isAnonymousAction = false,
        shouldBlockSelection = false,
        shouldParseTitle = false,
        shouldCheckActionAllowedOnPress = true,
        onSecondaryInteraction,
        titleWithTooltips,
    }: MenuItemProps,
    ref: ForwardedRef<View>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const combinedStyle = StyleUtils.combineStyles(style ?? {}, styles.popoverMenuItem);
    const {isSmallScreenWidth} = useWindowDimensions();
    const [html, setHtml] = useState('');
    const titleRef = useRef('');

    // eslint-disable-next-line you-dont-need-lodash-underscore/contains
    const isDeleted = style ? _.contains(style, styles.offlineFeedback.deleted) : false;
    const descriptionVerticalMargin = shouldShowDescriptionOnTop ? styles.mb1 : styles.mt1;
    const fallbackAvatarSize = viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT;
    const combinedTitleTextStyle = StyleUtils.combineStyles(
        [
            styles.flexShrink1,
            styles.popoverMenuText,
            // eslint-disable-next-line no-nested-ternary
            icon && !Array.isArray(icon) ? (avatarSize === CONST.AVATAR_SIZE.SMALL ? styles.ml2 : styles.ml3) : {},
            shouldShowBasicTitle ? {} : styles.textStrong,
            numberOfLinesTitle !== 1 ? styles.preWrap : styles.pre,
            interactive && disabled ? {...styles.userSelectNone} : {},
            styles.ltr,
            isDeleted ? styles.offlineFeedback.deleted : {},
        ],
        titleStyle ?? {},
    );
    const descriptionTextStyles = StyleUtils.combineStyles([
        styles.textLabelSupporting,
        icon && !Array.isArray(icon) ? styles.ml3 : {},
        title ? descriptionVerticalMargin : StyleUtils.getFontSizeStyle(variables.fontSizeNormal),
        (descriptionTextStyle as ViewStyle) || styles.breakWord,
        isDeleted ? styles.offlineFeedback.deleted : {},
    ]) as StyleProp<TextStyle>;

    useEffect(() => {
        if (!title || (titleRef.current.length && titleRef.current === title) || !shouldParseTitle) {
            return;
        }
        const parser = new ExpensiMark();
        setHtml(parser.replace(title));
        titleRef.current = title;
    }, [title, shouldParseTitle]);

    const getProcessedTitle = useMemo(() => {
        let processedTitle = '';
        if (shouldRenderAsHTML) {
            processedTitle = title ? convertToLTR(title) : '';
        }

        if (shouldParseTitle) {
            processedTitle = html;
        }

        return processedTitle ? `<comment>${processedTitle}</comment>` : '';
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

    const onPressAction = (event: GestureResponderEvent | KeyboardEvent) => {
        if (disabled || !interactive) {
            return;
        }

        if (event && event.type === 'click') {
            (event.currentTarget as HTMLElement).blur();
        }

        if (onPress) {
            onPress(event);
        }
    };

    return (
        <Hoverable>
            {(isHovered) => (
                <PressableWithSecondaryInteraction
                    onPress={shouldCheckActionAllowedOnPress ? Session.checkIfActionIsAllowed(onPressAction, isAnonymousAction) : onPressAction}
                    onPressIn={() => shouldBlockSelection && isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={ControlSelection.unblock}
                    onSecondaryInteraction={onSecondaryInteraction}
                    style={({pressed}: PressableStateCallbackType) =>
                        [
                            containerStyle,
                            errorText ? styles.pb5 : {},
                            combinedStyle,
                            !interactive && styles.cursorDefault,
                            StyleUtils.getButtonBackgroundColorStyle(getButtonState(focused || isHovered, Boolean(pressed), success, disabled, interactive), true),
                            (isHovered || pressed) && hoverAndPressStyle,
                            ...(Array.isArray(wrapperStyle) ? wrapperStyle : [wrapperStyle]),
                            shouldGreyOutWhenDisabled && disabled && styles.buttonOpacityDisabled,
                        ] as StyleProp<ViewStyle>
                    }
                    disabled={disabled}
                    ref={ref}
                    role={CONST.ROLE.MENUITEM}
                    accessibilityLabel={title ? title.toString() : ''}
                    accessible
                >
                    {({pressed}) => (
                        <>
                            <View style={[styles.flexColumn, styles.flex1]}>
                                {Boolean(label) && (
                                    <View style={icon ? styles.mb2 : null}>
                                        <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre])}>{label}</Text>
                                    </View>
                                )}
                                <View style={[styles.flexRow, styles.pointerEventsAuto, disabled && styles.cursorDisabled]}>
                                    {Boolean(icon) && Array.isArray(icon) && (
                                        <MultipleAvatars
                                            isHovered={isHovered}
                                            isPressed={Boolean(pressed)}
                                            icons={icon}
                                            size={avatarSize}
                                            secondAvatarStyle={[
                                                StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                                pressed && interactive ? StyleUtils.getBackgroundAndBorderStyle(theme.buttonPressedBG) : undefined,
                                                isHovered && !pressed && interactive ? StyleUtils.getBackgroundAndBorderStyle(theme.border) : undefined,
                                            ]}
                                        />
                                    )}
                                    {Boolean(icon) && typeof icon === 'function' && (
                                        <View style={[styles.popoverMenuIcon, iconStyles, StyleUtils.getAvatarWidthStyle(avatarSize)]}>
                                            {iconType === CONST.ICON_TYPE_ICON && (
                                                <Icon
                                                    hovered={isHovered}
                                                    pressed={Boolean(pressed)}
                                                    src={icon}
                                                    width={iconWidth}
                                                    height={iconHeight}
                                                    fill={
                                                        iconFill ?? StyleUtils.getIconFillColor(getButtonState(focused || isHovered, Boolean(pressed), success, disabled, interactive), true)
                                                    }
                                                />
                                            )}
                                        </View>
                                    )}
                                    {Boolean(icon) && typeof icon !== 'function' && (
                                        <View>
                                            {iconType === CONST.ICON_TYPE_WORKSPACE && (
                                                <Avatar
                                                    imageStyles={[styles.alignSelfCenter]}
                                                    size={CONST.AVATAR_SIZE.DEFAULT}
                                                    source={icon}
                                                    fallbackIcon={fallbackIcon}
                                                    name={title}
                                                    type={CONST.ICON_TYPE_WORKSPACE}
                                                />
                                            )}
                                            {iconType === CONST.ICON_TYPE_AVATAR && (
                                                <Avatar
                                                    imageStyles={[styles.alignSelfCenter]}
                                                    source={icon}
                                                    fallbackIcon={fallbackIcon}
                                                    size={avatarSize}
                                                />
                                            )}
                                        </View>
                                    )}
                                    {secondaryIcon && (
                                        <View style={[styles.popoverMenuIcon, iconStyles]}>
                                            <Icon
                                                src={secondaryIcon}
                                                width={iconWidth}
                                                height={iconHeight}
                                                fill={
                                                    secondaryIconFill ??
                                                    StyleUtils.getIconFillColor(getButtonState(focused || isHovered, Boolean(pressed), success, disabled, interactive), true)
                                                }
                                            />
                                        </View>
                                    )}
                                    <View style={[styles.justifyContentCenter, styles.flex1, StyleUtils.getMenuItemTextContainerStyle(isSmallAvatarSubscriptMenu)]}>
                                        {Boolean(description) && shouldShowDescriptionOnTop && (
                                            <Text
                                                style={descriptionTextStyles as TextStyle}
                                                numberOfLines={2}
                                            >
                                                {description}
                                            </Text>
                                        )}
                                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                            {Boolean(title) && (Boolean(shouldRenderAsHTML) || (Boolean(shouldParseTitle) && Boolean(html.length))) && (
                                                <View style={styles.renderHTMLTitle}>
                                                    <RenderHTML html={getProcessedTitle} />
                                                </View>
                                            )}
                                            {!shouldRenderAsHTML && !shouldParseTitle && Boolean(title) && (
                                                <Text
                                                    style={combinedTitleTextStyle}
                                                    numberOfLines={numberOfLinesTitle || undefined}
                                                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: interactive && disabled}}
                                                >
                                                    {renderTitleContent()}
                                                </Text>
                                            )}
                                            {Boolean(shouldShowTitleIcon) && titleIcon && (
                                                <View style={[styles.ml2]}>
                                                    <Icon
                                                        src={titleIcon}
                                                        fill={theme.iconSuccessFill}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                        {Boolean(description) && !shouldShowDescriptionOnTop && (
                                            <Text
                                                style={descriptionTextStyles}
                                                numberOfLines={2}
                                            >
                                                {description}
                                            </Text>
                                        )}
                                        {Boolean(error) && (
                                            <View style={[styles.mt1]}>
                                                <Text style={[styles.textLabelError]}>{error}</Text>
                                            </View>
                                        )}
                                        {furtherDetailsIcon && Boolean(furtherDetails) && (
                                            <View style={[styles.flexRow, styles.mt1, styles.alignItemsCenter]}>
                                                <Icon
                                                    src={furtherDetailsIcon}
                                                    height={variables.iconSizeNormal}
                                                    width={variables.iconSizeNormal}
                                                    inline
                                                />
                                                <Text
                                                    style={[styles.furtherDetailsText, styles.ph2, styles.pt1]}
                                                    numberOfLines={2}
                                                >
                                                    {furtherDetails}
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
                                        badgeStyles={[styles.alignSelfCenter, brickRoadIndicator ? styles.mr2 : undefined, focused || isHovered || pressed ? styles.hoveredButton : {}]}
                                    />
                                )}
                                {/* Since subtitle can be of type number, we should allow 0 to be shown */}
                                {(subtitle ?? subtitle === 0) && (
                                    <View style={[styles.justifyContentCenter, styles.mr1]}>
                                        <Text style={[styles.textLabelSupporting, ...(combinedStyle as TextStyle[])]}>{subtitle}</Text>
                                    </View>
                                )}
                                {!_.isEmpty(floatRightAvatars) && (
                                    <View style={[styles.justifyContentCenter, brickRoadIndicator ? styles.mr2 : undefined]}>
                                        <MultipleAvatars
                                            isHovered={isHovered}
                                            isPressed={Boolean(pressed)}
                                            icons={floatRightAvatars}
                                            size={floatRightAvatarSize ?? fallbackAvatarSize}
                                            fallbackIcon={defaultWorkspaceAvatars.WorkspaceBuilding}
                                            shouldStackHorizontally={shouldStackHorizontally}
                                        />
                                    </View>
                                )}
                                {Boolean(brickRoadIndicator) && (
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.ml1]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={brickRoadIndicator === 'error' ? theme.danger : theme.success}
                                        />
                                    </View>
                                )}
                                {Boolean(rightLabel) && (
                                    <View style={styles.justifyContentCenter}>
                                        <Text style={styles.rightLabelMenuItem}>{rightLabel}</Text>
                                    </View>
                                )}
                                {Boolean(shouldShowRightIcon) && (
                                    <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, disabled && styles.cursorDisabled]}>
                                        <Icon
                                            src={iconRight}
                                            fill={StyleUtils.getIconFillColor(getButtonState(focused || isHovered, Boolean(pressed), success, disabled, interactive))}
                                        />
                                    </View>
                                )}
                                {shouldShowRightComponent && rightComponent}
                                {shouldShowSelectedState && <SelectCircle isChecked={isSelected} />}
                            </View>
                            {Boolean(errorText) && (
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
    );
}

MenuItem.displayName = 'MenuItem';

export type {MenuItemProps};
export default forwardRef(MenuItem);
