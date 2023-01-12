import _ from 'underscore';
import React from 'react';
import {
    View, Pressable,
} from 'react-native';
import Text from './Text';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import getButtonState from '../libs/getButtonState';
import Avatar from './Avatar';
import Badge from './Badge';
import CONST from '../CONST';
import menuItemPropTypes from './menuItemPropTypes';
import SelectCircle from './SelectCircle';
import colors from '../styles/colors';
import variables from '../styles/variables';
import MultipleAvatars from './MultipleAvatars';

const propTypes = {
    ...menuItemPropTypes,
};

const defaultProps = {
    badgeText: undefined,
    shouldShowRightIcon: false,
    shouldShowSelectedState: false,
    shouldShowBasicTitle: false,
    shouldShowDescriptionOnTop: false,
    wrapperStyle: [],
    style: {},
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
    iconType: 'icon',
    onPress: () => {},
    interactive: true,
    fallbackIcon: Expensicons.FallbackAvatar,
    brickRoadIndicator: '',
    floatRightAvatars: [],
    shouldStackHorizontally: false,
};

const MenuItem = (props) => {
    const titleTextStyle = StyleUtils.combineStyles([
        styles.popoverMenuText,
        styles.ml3,
        (props.shouldShowBasicTitle ? undefined : styles.textStrong),
        (props.interactive && props.disabled ? {...styles.disabledText, ...styles.userSelectNone} : undefined),
    ], props.style);
    const descriptionTextStyle = StyleUtils.combineStyles([styles.textLabelSupporting, styles.ml3, styles.breakAll, styles.lh16], props.style);

    return (
        <Pressable
            onPress={(e) => {
                if (props.disabled) {
                    return;
                }

                if (e && e.type === 'click') {
                    e.currentTarget.blur();
                }

                props.onPress(e);
            }}
            style={({hovered, pressed}) => ([
                styles.popoverMenuItem,
                StyleUtils.getButtonBackgroundColorStyle(getButtonState(props.focused || hovered, pressed, props.success, props.disabled, props.interactive), true),
                ..._.isArray(props.wrapperStyle) ? props.wrapperStyle : [props.wrapperStyle],
            ])}
            disabled={props.disabled}
        >
            {({hovered, pressed}) => (
                <>
                    <View style={[styles.flexRow, styles.pointerEventsAuto, styles.flex1, props.disabled && styles.cursorDisabled]}>
                        {(props.icon && props.iconType === CONST.ICON_TYPE_ICON) && (
                            <View
                                style={[
                                    styles.popoverMenuIcon,
                                    ...props.iconStyles,
                                ]}
                            >
                                <Icon
                                    src={props.icon}
                                    width={props.iconWidth}
                                    height={props.iconHeight}
                                    fill={props.iconFill || StyleUtils.getIconFillColor(
                                        getButtonState(props.focused || hovered, pressed, props.success, props.disabled, props.interactive),
                                        true,
                                    )}
                                />
                            </View>
                        )}
                        {(props.icon && props.iconType === CONST.ICON_TYPE_AVATAR) && (
                            <View
                                style={[
                                    styles.popoverMenuIcon,
                                    ...props.iconStyles,
                                ]}
                            >
                                <Avatar
                                    imageStyles={[styles.avatarNormal, styles.alignSelfCenter]}
                                    source={props.icon}
                                    fallbackIcon={props.fallbackIcon}
                                />
                            </View>
                        )}
                        <View style={[styles.justifyContentCenter, styles.menuItemTextContainer, styles.flex1, styles.gap1]}>
                            {Boolean(props.description) && props.shouldShowDescriptionOnTop && (
                                <Text
                                    style={descriptionTextStyle}
                                    numberOfLines={2}
                                >
                                    {props.description}
                                </Text>
                            )}
                            {Boolean(props.title) && (
                                <Text
                                    style={titleTextStyle}
                                    numberOfLines={1}
                                >
                                    {props.title}
                                </Text>
                            )}
                            {Boolean(props.description) && !props.shouldShowDescriptionOnTop && (
                                <Text
                                    style={descriptionTextStyle}
                                    numberOfLines={2}
                                >
                                    {props.description}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={[styles.flexRow, styles.menuItemTextContainer, styles.pointerEventsNone]}>
                        {props.badgeText && (
                        <Badge
                            text={props.badgeText}
                            badgeStyles={[styles.alignSelfCenter, (props.brickRoadIndicator ? styles.mr2 : undefined),
                                (props.focused || hovered || pressed) ? styles.hoveredButton : {},
                            ]}
                        />
                        )}
                        {/* Since subtitle can be of type number, we should allow 0 to be shown */}
                        {(props.subtitle || props.subtitle === 0) && (
                            <View style={[styles.justifyContentCenter, styles.mr1]}>
                                <Text
                                    style={[styles.textLabelSupporting, props.style]}
                                >
                                    {props.subtitle}
                                </Text>
                            </View>
                        )}
                        {!_.isEmpty(props.floatRightAvatars) && (
                            <View style={[styles.justifyContentCenter, (props.brickRoadIndicator ? styles.mr4 : styles.mr3)]}>
                                <MultipleAvatars
                                    isHovered={hovered}
                                    isPressed={pressed}
                                    icons={props.floatRightAvatars}
                                    size={props.viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                                    fallbackIcon={Expensicons.Workspace}
                                    shouldStackHorizontally={props.shouldStackHorizontally}
                                />
                            </View>
                        )}
                        {Boolean(props.brickRoadIndicator) && (
                            <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.l4]}>
                                <Icon
                                    src={Expensicons.DotIndicator}
                                    fill={props.brickRoadIndicator === 'error' ? colors.red : colors.green}
                                    height={variables.iconSizeSmall}
                                    width={variables.iconSizeSmall}
                                />
                            </View>
                        )}
                        {Boolean(props.shouldShowRightIcon) && (
                            <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, props.disabled && styles.cursorDisabled]}>
                                <Icon
                                    src={props.iconRight}
                                    fill={StyleUtils.getIconFillColor(getButtonState(props.focused || hovered, pressed, props.success, props.disabled, props.interactive))}
                                />
                            </View>
                        )}
                        {props.shouldShowSelectedState && <SelectCircle isChecked={props.isSelected} />}
                    </View>
                </>
            )}
        </Pressable>
    );
};

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;
MenuItem.displayName = 'MenuItem';

export default MenuItem;
