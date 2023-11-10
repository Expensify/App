import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {FC, ForwardedRef, ReactNode, forwardRef, useEffect, useMemo} from 'react';
import {GestureResponderEvent, StyleProp, View, ViewStyle} from 'react-native';
import _ from 'underscore';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ControlSelection from '@libs/ControlSelection';
import convertToLTR from '@libs/convertToLTR';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getButtonState from '@libs/getButtonState';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import AvatarType from '@src/types/onyx/Avatar';
import { AnimatedStyle } from 'react-native-reanimated';
import IconType from '@types/Icon';
import { SvgProps } from 'react-native-svg';
import Avatar from './Avatar';
import Badge from './Badge';
import DisplayNames from './DisplayNames';
import Hoverable from './Hoverable';
import Icon from './Icon';
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
}

type UnresponsiveProps = {
    onPress?: undefined;

    /** Whether the menu item should be interactive at all */
    interactive: false;
}

type TitleIconProps = {
    /** Boolean whether to display the title right icon */
    shouldShowTitleIcon: true;

    /** Icon to display at right side of title */
    titleIcon: IconType;
}

type NoTitleIconProps = {
    shouldShowTitleIcon?: false;
    
    titleIcon?: undefined;
}

type RightIconProps = {
    /** Boolean whether to display the right icon */
    shouldShowRightIcon: true;

    /** Overrides the icon for shouldShowRightIcon */
    iconRight: IconType;
}

type NoRightIconProps = {
    shouldShowRightIcon?: false;

    iconRight?: IconType;
}

type RightComponent = {
    /** Should render component on the right */
    shouldShowRightComponent: true;

    /** Component to be displayed on the right */
    rightComponent: ReactNode;
}

type NoRightComponent = {
    shouldShowRightComponent?: false;

    rightComponent?: undefined;
}

type MenuItemProps = (ResponsiveProps | UnresponsiveProps) & (TitleIconProps | NoTitleIconProps) &
(RightIconProps | NoRightIconProps) & (RightComponent | NoRightComponent) & {
    /** Text to be shown as badge near the right end. */
    badgeText?: string;
 
    /** Used to apply offline styles to child text components */
    style?: StyleProp<ViewStyle>;

    /** Any additional styles to apply */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Used to apply styles specifically to the title */
    titleStyle?: StyleProp<ViewStyle>;

    /** Any adjustments to style when menu item is hovered or pressed */
    hoverAndPressStyle: StyleProp<AnimatedStyle<ViewStyle>>;

    /** Icon to display on the left side of component */
    icon?: ReactNode | string | AvatarType;

    /** The fill color to pass into the icon. */
    iconFill?: string;

    /** Secondary icon to display on the left side of component, right of the icon */
    secondaryIcon?: ReactNode;

    /** The fill color to pass into the secondary icon. */
    secondaryIconFill?: string;

    /** Flag to choose between avatar image or an icon */
    iconType?: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_ICON | typeof CONST.ICON_TYPE_WORKSPACE;

    /** Icon Width */
    iconWidth?: number;

    /** Icon Height */
    iconHeight?: number;

    /** Any additional styles to pass to the icon container. */
    iconStyles?: StyleProp<ViewStyle>;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: FC<SvgProps>;

    /** An icon to display under the main item */
    furtherDetailsIcon?: IconType;

    /** A description text to show under the title */
    description?: string;

    /** Should the description be shown above the title (instead of the other way around) */
    shouldShowDescriptionOnTop?: boolean;

    /** Error to display below the title */
    error?: string;

    /** A boolean flag that gives the icon a green fill if true */
    success?: boolean;

    /** Whether item is focused or active */
    focused?: boolean;

    /** Should we disable this menu item? */
    disabled?: boolean;

    /** Text that appears above the title */
    label?: string;

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
    avatarSize?: typeof CONST.AVATAR_SIZE;

    /** Avatars to show on the right of the menu item */
    floatRightAvatars?: AvatarType[];

    /** Prop to represent the size of the float right avatar images to be shown */
    floatRightAvatarSize?: typeof CONST.AVATAR_SIZE;    

/**  Whether we should use small avatar subscript sizing the for menu item */
    isSmallAvatarSubscriptMenu?: boolean;

    // ------------------------------- VALID PROPS ABOVE
    
    /** The type of brick road indicator to show. */
    brickRoadIndicator: typeof CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR | typeof CONST.BRICK_ROAD_INDICATOR_STATUS.INFO | '';
    
    /** The function that should be called when this component is LongPressed or right-clicked. */
    onSecondaryInteraction: () => void;

    /** Flag to indicate whether or not text selection should be disabled from long-pressing the menu item. */
    shouldBlockSelection: boolean;

    /** Text to display under the main item */
    furtherDetails: string;

    /** The action accept for anonymous user or not */
    isAnonymousAction: boolean;

    /** Should we grey out the menu item when it is disabled? */
    shouldGreyOutWhenDisabled: boolean;

    /** Should render the content in HTML format */
    shouldRenderAsHTML: boolean;

    /** Array of objects that map display names to their corresponding tooltip */
    titleWithTooltips: ReactNode[];

    /** Should check anonymous user in onPress function */
    shouldCheckActionAllowedOnPress: boolean;
};

// TODO: Destructure props
// TODO: Adjust default values
// TODO: Adjust () => void in AvatarProps - always just used () => void without checking the usage

const defaultProps = {
    shouldParseTitle: false,
    descriptionTextStyle: styles.breakWord,
    interactive: true,
    brickRoadIndicator: '',
    floatRightAvatars: [],
    avatarSize: CONST.AVATAR_SIZE.DEFAULT,
    shouldBlockSelection: false,
    furtherDetails: '',
    isAnonymousAction: false,
    numberOfLinesTitle: 1,
    shouldGreyOutWhenDisabled: true,
    shouldRenderAsHTML: false,
    titleWithTooltips: [],
    shouldCheckActionAllowedOnPress: true,
};

function MenuItem({
    badgeText, onPress, style = styles.popoverMenuItem, wrapperStyle, titleStyle, hoverAndPressStyle,
    icon, iconFill, secondaryIcon, secondaryIconFill, iconType = CONST.ICON_TYPE_ICON, iconWidth, iconHeight, iconStyles, fallbackIcon = Expensicons.FallbackAvatar, shouldShowTitleIcon = false, titleIcon,
    shouldShowRightIcon = false, iconRight = Expensicons.ArrowRight, furtherDetailsIcon,
    description, error, success = false, focused = false, disabled = false,
    title, subtitle, shouldShowBasicTitle, label, shouldShowSelectedState = false, isSelected = false, shouldStackHorizontally = false,
    shouldShowDescriptionOnTop = false, shouldShowRightComponent = false, rightComponent,
    floatRightAvatars = [], floatRightAvatarSize, avatarSize = CONST.AVATAR_SIZE.DEFAULT, isSmallAvatarSubscriptMenu = false,
    // Props not validated below - Validate if required and default value
    interactive,brickRoadIndicator = '',avatarSize,onSecondaryInteraction,shouldBlockSelection,furtherDetails,isAnonymousAction,isSmallAvatarSubscriptMenu,shouldGreyOutWhenDisabled,shouldRenderAsHTML,titleWithTooltips,
        shouldCheckActionAllowedOnPress
}: MenuItemProps, ref: ForwardedRef<View>) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const [html, setHtml] = React.useState('');

    const isDeleted = _.contains(style, styles.offlineFeedback.deleted);
    const descriptionVerticalMargin = shouldShowDescriptionOnTop ? styles.mb1 : styles.mt1;
    const titleTextStyle = StyleUtils.combineStyles(
        [
            styles.flexShrink1,
            styles.popoverMenuText,
            icon && !_.isArray(icon) && (avatarSize === CONST.AVATAR_SIZE.SMALL ? styles.ml2 : styles.ml3),
            shouldShowBasicTitle ? undefined : styles.textStrong,
            numberOfLinesTitle !== 1 ? styles.preWrap : styles.pre,
            interactive && disabled ? {...styles.userSelectNone} : undefined,
            styles.ltr,
            isDeleted ? styles.offlineFeedback.deleted : undefined,
        ],
        titleStyle,
    );
    const descriptionTextStyle = StyleUtils.combineStyles([
        styles.textLabelSupporting,
        icon && !_.isArray(icon) ? styles.ml3 : undefined,
        title ? descriptionVerticalMargin : StyleUtils.getFontSizeStyle(variables.fontSizeNormal),
        descriptionTextStyle,
        isDeleted ? styles.offlineFeedback.deleted : undefined,
    ]);

    const fallbackAvatarSize = viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT;

    const titleRef = React.useRef('');
    useEffect(() => {
        if (!title || (titleRef.current.length && titleRef.current === title) || !shouldParseTitle) {
            return;
        }
        const parser = new ExpensiMark();
        setHtml(parser.replace(title));
        titleRef.current = title;
    }, [title, shouldParseTitle]);

    const getProcessedTitle = useMemo(() => {
        let title = '';
        if (shouldRenderAsHTML) {
            title = convertToLTR(title);
        }

        if (shouldParseTitle) {
            title = html;
        }

        return title ? `<comment>${title}</comment>` : '';
    }, [title, shouldRenderAsHTML, shouldParseTitle, html]);

    const hasPressableRightComponent = iconRight || (rightComponent && shouldShowRightComponent);

    const renderTitleContent = () => {
        if (titleWithTooltips && _.isArray(titleWithTooltips) && titleWithTooltips.length > 0) {
            return (
                <DisplayNames
                    fullTitle={title}
                    displayNamesWithTooltips={titleWithTooltips}
                    tooltipEnabled
                    numberOfLines={1}
                />
            );
        }

        return convertToLTR(title);
    };

    const onPressAction = (event: GestureResponderEvent | KeyboardEvent) => {
        if (disabled || !interactive) {
            return;
        }

        if (event && event.type === 'click' && event.currentTarget instanceof EventTarget) {
            (event.currentTarget as HTMLElement).blur();
        }

        onPress(event);
    };

    return (
        <Hoverable>
            {(isHovered) => (
                <PressableWithSecondaryInteraction
                    onPress={shouldCheckActionAllowedOnPress ? Session.checkIfActionIsAllowed(onPressAction, isAnonymousAction) : onPressAction}
                    onPressIn={() => shouldBlockSelection && isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={ControlSelection.unblock}
                    onSecondaryInteraction={onSecondaryInteraction}
                    style={({pressed}) => [
                        style,
                        !interactive && styles.cursorDefault,
                        StyleUtils.getButtonBackgroundColorStyle(getButtonState(focused || isHovered, pressed, success, disabled, interactive), true),
                        (isHovered || pressed) && hoverAndPressStyle,
                        ...(_.isArray(wrapperStyle) ? wrapperStyle : [wrapperStyle]),
                        shouldGreyOutWhenDisabled && disabled && styles.buttonOpacityDisabled,
                    ]}
                    disabled={disabled}
                    ref={ref}
                    role={CONST.ACCESSIBILITY_ROLE.MENUITEM}
                    accessibilityLabel={title ? title.toString() : ''}
                >
                    {({pressed}) => (
                        <>
                            <View style={[styles.flexColumn, styles.flex1]}>
                                {Boolean(label) && (
                                    <View style={icon ? styles.mb2 : null}>
                                        <Text style={StyleUtils.combineStyles(styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre)}>
                                            {label}
                                        </Text>
                                    </View>
                                )}
                                <View style={[styles.flexRow, styles.pointerEventsAuto, disabled && styles.cursorDisabled]}>
                                    {Boolean(icon) && _.isArray(icon) && (
                                        <MultipleAvatars
                                            isHovered={isHovered}
                                            isPressed={pressed}
                                            icons={icon}
                                            size={avatarSize}
                                            secondAvatarStyle={[
                                                StyleUtils.getBackgroundAndBorderStyle(themeColors.sidebar),
                                                pressed && interactive ? StyleUtils.getBackgroundAndBorderStyle(themeColors.buttonPressedBG) : undefined,
                                                isHovered && !pressed && interactive ? StyleUtils.getBackgroundAndBorderStyle(themeColors.border) : undefined,
                                            ]}
                                        />
                                    )}
                                    {Boolean(icon) && !_.isArray(icon) && (
                                        <View style={[styles.popoverMenuIcon, iconStyles, StyleUtils.getAvatarWidthStyle(avatarSize)]}>
                                            {iconType === CONST.ICON_TYPE_ICON && (
                                                <Icon
                                                    hovered={isHovered}
                                                    pressed={pressed}
                                                    src={icon}
                                                    width={iconWidth}
                                                    height={iconHeight}
                                                    fill={
                                                        iconFill ||
                                                        StyleUtils.getIconFillColor(
                                                            getButtonState(focused || isHovered, pressed, success, disabled, interactive),
                                                            true,
                                                        )
                                                    }
                                                />
                                            )}
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
                                    {Boolean(secondaryIcon) && (
                                        <View style={[styles.popoverMenuIcon, iconStyles]}>
                                            <Icon
                                                src={secondaryIcon}
                                                width={iconWidth}
                                                height={iconHeight}
                                                fill={
                                                    secondaryIconFill ||
                                                    StyleUtils.getIconFillColor(getButtonState(focused || isHovered, pressed, success, disabled, interactive), true)
                                                }
                                            />
                                        </View>
                                    )}
                                    <View style={[styles.justifyContentCenter, styles.flex1, StyleUtils.getMenuItemTextContainerStyle(isSmallAvatarSubscriptMenu)]}>
                                        {Boolean(description) && shouldShowDescriptionOnTop && (
                                            <Text
                                                style={descriptionTextStyle}
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
                                                    style={titleTextStyle}
                                                    numberOfLines={numberOfLinesTitle || undefined}
                                                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: interactive && disabled}}
                                                >
                                                    {renderTitleContent()}
                                                </Text>
                                            )}
                                            {Boolean(shouldShowTitleIcon) && (
                                                <View style={[styles.ml2]}>
                                                    <Icon
                                                        src={titleIcon}
                                                        fill={themeColors.iconSuccessFill}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                        {Boolean(description) && !shouldShowDescriptionOnTop && (
                                            <Text
                                                style={descriptionTextStyle}
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
                                        {Boolean(furtherDetails) && (
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
                                {Boolean(badgeText) && (
                                    <Badge
                                        text={badgeText}
                                        badgeStyles={[
                                            styles.alignSelfCenter,
                                            brickRoadIndicator ? styles.mr2 : undefined,
                                            focused || isHovered || pressed ? styles.hoveredButton : {},
                                        ]}
                                    />
                                )}
                                {/* Since subtitle can be of type number, we should allow 0 to be shown */}
                                {(subtitle || subtitle === 0) && (
                                    <View style={[styles.justifyContentCenter, styles.mr1]}>
                                        <Text style={[styles.textLabelSupporting, style]}>{subtitle}</Text>
                                    </View>
                                )}
                                {!_.isEmpty(floatRightAvatars) && (
                                    <View style={[styles.justifyContentCenter, brickRoadIndicator ? styles.mr2 : undefined]}>
                                        <MultipleAvatars
                                            isHovered={isHovered}
                                            isPressed={pressed}
                                            icons={floatRightAvatars}
                                            size={floatRightAvatarSize || fallbackAvatarSize}
                                            fallbackIcon={defaultWorkspaceAvatars.WorkspaceBuilding}
                                            shouldStackHorizontally={shouldStackHorizontally}
                                        />
                                    </View>
                                )}
                                {Boolean(brickRoadIndicator) && (
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.ml1]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={brickRoadIndicator === 'error' ? themeColors.danger : themeColors.success}
                                        />
                                    </View>
                                )}
                                {Boolean(shouldShowRightIcon) && (
                                    <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, disabled && styles.cursorDisabled]}>
                                        <Icon
                                            src={iconRight}
                                            fill={StyleUtils.getIconFillColor(getButtonState(focused || isHovered, pressed, success, disabled, interactive))}
                                        />
                                    </View>
                                )}
                                {shouldShowRightComponent && rightComponent}
                                {shouldShowSelectedState && <SelectCircle isChecked={isSelected} />}
                            </View>
                        </>
                    )}
                </PressableWithSecondaryInteraction>
            )}
        </Hoverable>
    );
}

MenuItem.displayName = 'MenuItem';

export default forwardRef(MenuItem);
