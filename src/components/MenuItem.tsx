import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {ForwardedRef, ReactNode, useEffect, useMemo} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
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

type MenuItemProps = {
    /** Text to be shown as badge near the right end. */
    badgeText: string;
    
    /** Function to fire when component is pressed */
    onPress?: (event: Event) => void;
 
    /** Used to apply offline styles to child text components */
    style?: StyleProp<ViewStyle>;

    /** Any additional styles to apply */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Used to apply styles specifically to the title */
    titleStyle?: StyleProp<ViewStyle>;

    /** Icon to display on the left side of component */
    icon: ReactNode | string | AvatarType;

    /** Secondary icon to display on the left side of component, right of the icon */
    secondaryIcon: ReactNode;

    /** Icon Width */
    iconWidth: number;

    /** Icon Height */
    iconHeight: number;

    /** Text to display for the item */
    title: string;

    /** Text that appears above the title */
    label: string;

    /** Boolean whether to display the title right icon */
    shouldShowTitleIcon: boolean;

    /** Icon to display at right side of title */
    titleIcon: () => void;

    /** Boolean whether to display the right icon */
    shouldShowRightIcon: boolean;
    
    /** Should we make this selectable with a checkbox */
    shouldShowSelectedState: boolean;
    
    /** Should the title show with normal font weight (not bold) */
    shouldShowBasicTitle: boolean;
    
    /** Should the description be shown above the title (instead of the other way around) */
    shouldShowDescriptionOnTop: boolean;
    
    /** Whether this item is selected */
    isSelected: boolean;
    
    /** A boolean flag that gives the icon a green fill if true */
    success: boolean;

    /** Overrides the icon for shouldShowRightIcon */
    iconRight: ReactNode;

    /** A description text to show under the title */
    description: string;

    /** Any additional styles to pass to the icon container. */
    iconStyles: Array<StyleProp<ViewStyle>>;

    /** The fill color to pass into the icon. */
    iconFill: string;

    /** The fill color to pass into the secondary icon. */
    secondaryIconFill: string;

    /** Whether item is focused or active */
    focused: boolean;

    /** Should we disable this menu item? */
    disabled: boolean;

    /** A right-aligned subtitle for this menu option */
    subtitle: string | number;

    /** Flag to choose between avatar image or an icon */
    iconType: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_ICON | typeof CONST.ICON_TYPE_WORKSPACE;

    /** Whether the menu item should be interactive at all */
    interactive: boolean;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon: string | (() => void);
    
    /** Avatars to show on the right of the menu item */
    floatRightAvatars: AvatarType;
    
    /** The type of brick road indicator to show. */
    brickRoadIndicator: typeof CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR | typeof CONST.BRICK_ROAD_INDICATOR_STATUS.INFO | '';

    /** Prop to identify if we should load avatars vertically instead of diagonally */
    shouldStackHorizontally: boolean;

    /** Prop to represent the size of the float right avatar images to be shown */
    floatRightAvatarSize: typeof CONST.AVATAR_SIZE;

    /** Prop to represent the size of the avatar images to be shown */
    avatarSize: typeof CONST.AVATAR_SIZE;

    /** The function that should be called when this component is LongPressed or right-clicked. */
    onSecondaryInteraction: () => void;

    /** Flag to indicate whether or not text selection should be disabled from long-pressing the menu item. */
    shouldBlockSelection: boolean;

    /** Any adjustments to style when menu item is hovered or pressed */
    hoverAndPressStyle: Array<StyleProp<AnimatedStyle<ViewStyle>>>,

    /** Text to display under the main item */
    furtherDetails: string;

    /** An icon to display under the main item */
    furtherDetailsIcon: ReactNode | string;

    /** The action accept for anonymous user or not */
    isAnonymousAction: boolean;

    /**  Whether we should use small avatar subscript sizing the for menu item */
    isSmallAvatarSubscriptMenu: boolean;

    /** Should we grey out the menu item when it is disabled? */
    shouldGreyOutWhenDisabled: boolean;

    /** Error to display below the title */
    error: string;

    /** Should render the content in HTML format */
    shouldRenderAsHTML: boolean;

    /** Component to be displayed on the right */
    rightComponent: ReactNode;

    /** Should render component on the right */
    shouldShowRightComponent: boolean;

    /** Array of objects that map display names to their corresponding tooltip */
    titleWithTooltips: ReactNode[];

    /** Should check anonymous user in onPress function */
    shouldCheckActionAllowedOnPress: boolean;
};

// TODO: Destructure props
// TODO: Adjust default values
// TODO: Adjust () => void in AvatarProps - always just used () => void without checking the usage

const defaultProps = {
    badgeText: undefined,
    shouldShowRightIcon: false,
    shouldShowSelectedState: false,
    shouldShowBasicTitle: false,
    shouldShowDescriptionOnTop: false,
    shouldShowHeaderTitle: false,
    shouldParseTitle: false,
    wrapperStyle: [],
    style: styles.popoverMenuItem,
    titleStyle: {},
    shouldShowTitleIcon: false,
    titleIcon: () => {},
    descriptionTextStyle: styles.breakWord,
    success: false,
    icon: undefined,
    secondaryIcon: undefined,
    iconWidth: undefined,
    iconHeight: undefined,
    description: undefined,
    iconRight: Expensicons.ArrowRight,
    iconStyles: [],
    iconFill: undefined,
    secondaryIconFill: undefined,
    focused: false,
    disabled: false,
    isSelected: false,
    subtitle: undefined,
    iconType: CONST.ICON_TYPE_ICON,
    onPress: () => {},
    onSecondaryInteraction: undefined,
    interactive: true,
    fallbackIcon: Expensicons.FallbackAvatar,
    brickRoadIndicator: '',
    floatRightAvatars: [],
    shouldStackHorizontally: false,
    avatarSize: CONST.AVATAR_SIZE.DEFAULT,
    floatRightAvatarSize: undefined,
    shouldBlockSelection: false,
    hoverAndPressStyle: [],
    furtherDetails: '',
    furtherDetailsIcon: undefined,
    isAnonymousAction: false,
    isSmallAvatarSubscriptMenu: false,
    title: '',
    numberOfLinesTitle: 1,
    shouldGreyOutWhenDisabled: true,
    error: '',
    shouldRenderAsHTML: false,
    rightComponent: undefined,
    shouldShowRightComponent: false,
    titleWithTooltips: [],
    shouldCheckActionAllowedOnPress: true,
};

const MenuItem = React.forwardRef((props: MenuItemProps, ref: ForwardedRef<View>) => {
    const {isSmallScreenWidth} = useWindowDimensions();
    const [html, setHtml] = React.useState('');

    const isDeleted = _.contains(props.style, styles.offlineFeedback.deleted);
    const descriptionVerticalMargin = props.shouldShowDescriptionOnTop ? styles.mb1 : styles.mt1;
    const titleTextStyle = StyleUtils.combineStyles(
        [
            styles.flexShrink1,
            styles.popoverMenuText,
            props.icon && !_.isArray(props.icon) && (props.avatarSize === CONST.AVATAR_SIZE.SMALL ? styles.ml2 : styles.ml3),
            props.shouldShowBasicTitle ? undefined : styles.textStrong,
            props.shouldShowHeaderTitle ? styles.textHeadlineH1 : undefined,
            props.numberOfLinesTitle !== 1 ? styles.preWrap : styles.pre,
            props.interactive && props.disabled ? {...styles.userSelectNone} : undefined,
            styles.ltr,
            isDeleted ? styles.offlineFeedback.deleted : undefined,
        ],
        props.titleStyle,
    );
    const descriptionTextStyle = StyleUtils.combineStyles([
        styles.textLabelSupporting,
        props.icon && !_.isArray(props.icon) ? styles.ml3 : undefined,
        props.title ? descriptionVerticalMargin : StyleUtils.getFontSizeStyle(variables.fontSizeNormal),
        props.descriptionTextStyle,
        isDeleted ? styles.offlineFeedback.deleted : undefined,
    ]);

    const fallbackAvatarSize = props.viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT;

    const titleRef = React.useRef('');
    useEffect(() => {
        if (!props.title || (titleRef.current.length && titleRef.current === props.title) || !props.shouldParseTitle) {
            return;
        }
        const parser = new ExpensiMark();
        setHtml(parser.replace(props.title));
        titleRef.current = props.title;
    }, [props.title, props.shouldParseTitle]);

    const getProcessedTitle = useMemo(() => {
        let title = '';
        if (props.shouldRenderAsHTML) {
            title = convertToLTR(props.title);
        }

        if (props.shouldParseTitle) {
            title = html;
        }

        return title ? `<comment>${title}</comment>` : '';
    }, [props.title, props.shouldRenderAsHTML, props.shouldParseTitle, html]);

    const hasPressableRightComponent = props.iconRight || (props.rightComponent && props.shouldShowRightComponent);

    const renderTitleContent = () => {
        if (props.titleWithTooltips && _.isArray(props.titleWithTooltips) && props.titleWithTooltips.length > 0) {
            return (
                <DisplayNames
                    fullTitle={props.title}
                    displayNamesWithTooltips={props.titleWithTooltips}
                    tooltipEnabled
                    numberOfLines={1}
                />
            );
        }

        return convertToLTR(props.title);
    };

    const onPressAction = (e) => {
        if (props.disabled || !props.interactive) {
            return;
        }

        if (e && e.type === 'click') {
            e.currentTarget.blur();
        }

        props.onPress(e);
    };

    return (
        <Hoverable>
            {(isHovered) => (
                <PressableWithSecondaryInteraction
                    onPress={props.shouldCheckActionAllowedOnPress ? Session.checkIfActionIsAllowed(onPressAction, props.isAnonymousAction) : onPressAction}
                    onPressIn={() => props.shouldBlockSelection && isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={ControlSelection.unblock}
                    onSecondaryInteraction={props.onSecondaryInteraction}
                    style={({pressed}) => [
                        props.style,
                        !props.interactive && styles.cursorDefault,
                        StyleUtils.getButtonBackgroundColorStyle(getButtonState(props.focused || isHovered, pressed, props.success, props.disabled, props.interactive), true),
                        (isHovered || pressed) && props.hoverAndPressStyle,
                        ...(_.isArray(props.wrapperStyle) ? props.wrapperStyle : [props.wrapperStyle]),
                        props.shouldGreyOutWhenDisabled && props.disabled && styles.buttonOpacityDisabled,
                    ]}
                    disabled={props.disabled}
                    ref={ref}
                    role={CONST.ACCESSIBILITY_ROLE.MENUITEM}
                    accessibilityLabel={props.title ? props.title.toString() : ''}
                >
                    {({pressed}) => (
                        <>
                            <View style={[styles.flexColumn, styles.flex1]}>
                                {Boolean(props.label) && (
                                    <View style={props.icon ? styles.mb2 : null}>
                                        <Text style={StyleUtils.combineStyles(styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre)}>
                                            {props.label}
                                        </Text>
                                    </View>
                                )}
                                <View style={[styles.flexRow, styles.pointerEventsAuto, props.disabled && styles.cursorDisabled]}>
                                    {Boolean(props.icon) && _.isArray(props.icon) && (
                                        <MultipleAvatars
                                            isHovered={isHovered}
                                            isPressed={pressed}
                                            icons={props.icon}
                                            size={props.avatarSize}
                                            secondAvatarStyle={[
                                                StyleUtils.getBackgroundAndBorderStyle(themeColors.sidebar),
                                                pressed && props.interactive ? StyleUtils.getBackgroundAndBorderStyle(themeColors.buttonPressedBG) : undefined,
                                                isHovered && !pressed && props.interactive ? StyleUtils.getBackgroundAndBorderStyle(themeColors.border) : undefined,
                                            ]}
                                        />
                                    )}
                                    {Boolean(props.icon) && !_.isArray(props.icon) && (
                                        <View style={[styles.popoverMenuIcon, ...props.iconStyles, StyleUtils.getAvatarWidthStyle(props.avatarSize)]}>
                                            {props.iconType === CONST.ICON_TYPE_ICON && (
                                                <Icon
                                                    hovered={isHovered}
                                                    pressed={pressed}
                                                    src={props.icon}
                                                    width={props.iconWidth}
                                                    height={props.iconHeight}
                                                    fill={
                                                        props.iconFill ||
                                                        StyleUtils.getIconFillColor(
                                                            getButtonState(props.focused || isHovered, pressed, props.success, props.disabled, props.interactive),
                                                            true,
                                                        )
                                                    }
                                                />
                                            )}
                                            {props.iconType === CONST.ICON_TYPE_WORKSPACE && (
                                                <Avatar
                                                    imageStyles={[styles.alignSelfCenter]}
                                                    size={CONST.AVATAR_SIZE.DEFAULT}
                                                    source={props.icon}
                                                    fallbackIcon={props.fallbackIcon}
                                                    name={props.title}
                                                    type={CONST.ICON_TYPE_WORKSPACE}
                                                />
                                            )}
                                            {props.iconType === CONST.ICON_TYPE_AVATAR && (
                                                <Avatar
                                                    imageStyles={[styles.alignSelfCenter]}
                                                    source={props.icon}
                                                    fallbackIcon={props.fallbackIcon}
                                                    size={props.avatarSize}
                                                />
                                            )}
                                        </View>
                                    )}
                                    {Boolean(props.secondaryIcon) && (
                                        <View style={[styles.popoverMenuIcon, ...props.iconStyles]}>
                                            <Icon
                                                src={props.secondaryIcon}
                                                width={props.iconWidth}
                                                height={props.iconHeight}
                                                fill={
                                                    props.secondaryIconFill ||
                                                    StyleUtils.getIconFillColor(getButtonState(props.focused || isHovered, pressed, props.success, props.disabled, props.interactive), true)
                                                }
                                            />
                                        </View>
                                    )}
                                    <View style={[styles.justifyContentCenter, styles.flex1, StyleUtils.getMenuItemTextContainerStyle(props.isSmallAvatarSubscriptMenu)]}>
                                        {Boolean(props.description) && props.shouldShowDescriptionOnTop && (
                                            <Text
                                                style={descriptionTextStyle}
                                                numberOfLines={2}
                                            >
                                                {props.description}
                                            </Text>
                                        )}
                                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                            {Boolean(props.title) && (Boolean(props.shouldRenderAsHTML) || (Boolean(props.shouldParseTitle) && Boolean(html.length))) && (
                                                <View style={styles.renderHTMLTitle}>
                                                    <RenderHTML html={getProcessedTitle} />
                                                </View>
                                            )}
                                            {!props.shouldRenderAsHTML && !props.shouldParseTitle && Boolean(props.title) && (
                                                <Text
                                                    style={titleTextStyle}
                                                    numberOfLines={props.numberOfLinesTitle || undefined}
                                                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: props.interactive && props.disabled}}
                                                >
                                                    {renderTitleContent()}
                                                </Text>
                                            )}
                                            {Boolean(props.shouldShowTitleIcon) && (
                                                <View style={[styles.ml2]}>
                                                    <Icon
                                                        src={props.titleIcon}
                                                        fill={themeColors.iconSuccessFill}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                        {Boolean(props.description) && !props.shouldShowDescriptionOnTop && (
                                            <Text
                                                style={descriptionTextStyle}
                                                numberOfLines={2}
                                            >
                                                {props.description}
                                            </Text>
                                        )}
                                        {Boolean(props.error) && (
                                            <View style={[styles.mt1]}>
                                                <Text style={[styles.textLabelError]}>{props.error}</Text>
                                            </View>
                                        )}
                                        {Boolean(props.furtherDetails) && (
                                            <View style={[styles.flexRow, styles.mt1, styles.alignItemsCenter]}>
                                                <Icon
                                                    src={props.furtherDetailsIcon}
                                                    height={variables.iconSizeNormal}
                                                    width={variables.iconSizeNormal}
                                                    inline
                                                />
                                                <Text
                                                    style={[styles.furtherDetailsText, styles.ph2, styles.pt1]}
                                                    numberOfLines={2}
                                                >
                                                    {props.furtherDetails}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.flexRow, styles.menuItemTextContainer, !hasPressableRightComponent && styles.pointerEventsNone]}>
                                {Boolean(props.badgeText) && (
                                    <Badge
                                        text={props.badgeText}
                                        badgeStyles={[
                                            styles.alignSelfCenter,
                                            props.brickRoadIndicator ? styles.mr2 : undefined,
                                            props.focused || isHovered || pressed ? styles.hoveredButton : {},
                                        ]}
                                    />
                                )}
                                {/* Since subtitle can be of type number, we should allow 0 to be shown */}
                                {(props.subtitle || props.subtitle === 0) && (
                                    <View style={[styles.justifyContentCenter, styles.mr1]}>
                                        <Text style={[styles.textLabelSupporting, props.style]}>{props.subtitle}</Text>
                                    </View>
                                )}
                                {!_.isEmpty(props.floatRightAvatars) && (
                                    <View style={[styles.justifyContentCenter, props.brickRoadIndicator ? styles.mr2 : undefined]}>
                                        <MultipleAvatars
                                            isHovered={isHovered}
                                            isPressed={pressed}
                                            icons={props.floatRightAvatars}
                                            size={props.floatRightAvatarSize || fallbackAvatarSize}
                                            fallbackIcon={defaultWorkspaceAvatars.WorkspaceBuilding}
                                            shouldStackHorizontally={props.shouldStackHorizontally}
                                        />
                                    </View>
                                )}
                                {Boolean(props.brickRoadIndicator) && (
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.ml1]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={props.brickRoadIndicator === 'error' ? themeColors.danger : themeColors.success}
                                        />
                                    </View>
                                )}
                                {Boolean(props.shouldShowRightIcon) && (
                                    <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, props.disabled && styles.cursorDisabled]}>
                                        <Icon
                                            src={props.iconRight}
                                            fill={StyleUtils.getIconFillColor(getButtonState(props.focused || isHovered, pressed, props.success, props.disabled, props.interactive))}
                                        />
                                    </View>
                                )}
                                {props.shouldShowRightComponent && props.rightComponent}
                                {props.shouldShowSelectedState && <SelectCircle isChecked={props.isSelected} />}
                            </View>
                        </>
                    )}
                </PressableWithSecondaryInteraction>
            )}
        </Hoverable>
    );
});

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;
MenuItem.displayName = 'MenuItem';

export default MenuItem;
