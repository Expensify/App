import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import Text from './Text';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import * as StyleUtils from '../styles/StyleUtils';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import getButtonState from '../libs/getButtonState';
import convertToLTR from '../libs/convertToLTR';
import Avatar from './Avatar';
import Badge from './Badge';
import CONST from '../CONST';
import menuItemPropTypes from './menuItemPropTypes';
import SelectCircle from './SelectCircle';
import colors from '../styles/colors';
import MultipleAvatars from './MultipleAvatars';
import * as defaultWorkspaceAvatars from './Icon/WorkspaceDefaultAvatars';
import PressableWithSecondaryInteraction from './PressableWithSecondaryInteraction';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import * as DeviceCapabilities from '../libs/DeviceCapabilities';
import ControlSelection from '../libs/ControlSelection';
import variables from '../styles/variables';
import * as Session from '../libs/actions/Session';
import Hoverable from './Hoverable';

const propTypes = {
    ...menuItemPropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    badgeText: undefined,
    shouldShowRightIcon: false,
    shouldShowSelectedState: false,
    shouldShowBasicTitle: false,
    shouldShowDescriptionOnTop: false,
    shouldShowHeaderTitle: false,
    wrapperStyle: [],
    style: styles.popoverMenuItem,
    titleStyle: {},
    shouldShowTitleIcon: false,
    titleIcon: () => {},
    descriptionTextStyle: styles.breakWord,
    success: false,
    icon: undefined,
    iconWidth: undefined,
    iconHeight: undefined,
    description: undefined,
    iconRight: Expensicons.ArrowRight,
    iconStyles: [],
    iconFill: undefined,
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
    avatarSize: undefined,
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
};

function MenuItem(props) {
    const isDeleted = _.contains(props.style, styles.offlineFeedback.deleted);
    const descriptionVerticalMargin = props.shouldShowDescriptionOnTop ? styles.mb1 : styles.mt1;
    const titleTextStyle = StyleUtils.combineStyles(
        [
            styles.flexShrink1,
            styles.popoverMenuText,
            props.icon && !_.isArray(props.icon) && (props.avatarSize === CONST.AVATAR_SIZE.SMALL ? styles.ml2 : styles.ml3),
            props.shouldShowBasicTitle ? undefined : styles.textStrong,
            props.shouldShowHeaderTitle ? styles.textHeadlineH1 : undefined,
            props.numberOfLinesTitle > 1 ? styles.preWrap : styles.pre,
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

    return (
        <Hoverable>
            {(isHovered) => (
                <PressableWithSecondaryInteraction
                    onPress={Session.checkIfActionIsAllowed((e) => {
                        if (props.disabled || !props.interactive) {
                            return;
                        }

                        if (e && e.type === 'click') {
                            e.currentTarget.blur();
                        }

                        props.onPress(e);
                    }, props.isAnonymousAction)}
                    onPressIn={() => props.shouldBlockSelection && props.isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
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
                    ref={props.forwardedRef}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.MENUITEM}
                    accessibilityLabel={props.title}
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
                                            size={CONST.AVATAR_SIZE.DEFAULT}
                                            secondAvatarStyle={[
                                                StyleUtils.getBackgroundAndBorderStyle(themeColors.sidebar),
                                                pressed ? StyleUtils.getBackgroundAndBorderStyle(themeColors.buttonPressedBG) : undefined,
                                                isHovered && !pressed ? StyleUtils.getBackgroundAndBorderStyle(themeColors.border) : undefined,
                                            ]}
                                        />
                                    )}
                                    {Boolean(props.icon) && !_.isArray(props.icon) && (
                                        <View style={[styles.popoverMenuIcon, ...props.iconStyles, StyleUtils.getAvatarWidthStyle(props.avatarSize || CONST.AVATAR_SIZE.DEFAULT)]}>
                                            {props.iconType === CONST.ICON_TYPE_ICON && (
                                                <Icon
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
                                                    size={props.avatarSize || CONST.AVATAR_SIZE.DEFAULT}
                                                />
                                            )}
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
                                            {Boolean(props.title) && (
                                                <Text
                                                    style={titleTextStyle}
                                                    numberOfLines={props.numberOfLinesTitle}
                                                >
                                                    {convertToLTR(props.title)}
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
                            <View style={[styles.flexRow, styles.menuItemTextContainer, styles.pointerEventsNone]}>
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
                                            fill={props.brickRoadIndicator === 'error' ? colors.red : colors.green}
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
                                {props.shouldShowSelectedState && <SelectCircle isChecked={props.isSelected} />}
                            </View>
                        </>
                    )}
                </PressableWithSecondaryInteraction>
            )}
        </Hoverable>
    );
}

MenuItem.propTypes = propTypes;
MenuItem.displayName = 'MenuItem';

const MenuItemWithWindowDimensions = withWindowDimensions(
    React.forwardRef((props, ref) => (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    )),
);
MenuItemWithWindowDimensions.defaultProps = defaultProps;

export default MenuItemWithWindowDimensions;
