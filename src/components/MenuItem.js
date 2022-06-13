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

const propTypes = {
    ...menuItemPropTypes,
};

const defaultProps = {
    badgeText: undefined,
    shouldShowRightIcon: false,
    shouldShowSelectedState: false,
    wrapperStyle: [],
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
};

const MenuItem = props => (
    <Pressable
        onPress={(e) => {
            if (props.disabled) {
                return;
            }

            if ("type" in e && e.type === 'click') {
                e.currentTarget.blur();
            }

            props.onPress(e);
        }}
        style={({hovered, pressed}) => ([
            styles.popoverMenuItem,
            StyleUtils.getButtonBackgroundColorStyle(getButtonState(props.focused || hovered, pressed, props.success, props.disabled, props.interactive)),
            ..._.isArray(props.wrapperStyle) ? props.wrapperStyle : [props.wrapperStyle],
        ])}
        disabled={props.disabled}
    >
        {({hovered, pressed}) => (
            <>
                <View style={[styles.flexRow, styles.pointerEventsNone, styles.flex1]}>
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
                    <View style={[styles.justifyContentCenter, styles.menuItemTextContainer, styles.flex1]}>
                        <Text
                            style={[
                                styles.popoverMenuText,
                                styles.ml3,
                                (props.interactive && props.disabled ? styles.disabledText : undefined),
                            ]}
                            numberOfLines={1}
                        >
                            {props.title}
                        </Text>
                        {Boolean(props.description) && (
                            <Text
                                style={[styles.textLabelSupporting, styles.ml3, styles.mt1, styles.breakAll]}
                                numberOfLines={2}
                            >
                                {props.description}
                            </Text>
                        )}
                    </View>
                </View>
                <View style={[styles.flexRow, styles.menuItemTextContainer, styles.pointerEventsNone]}>
                    {props.badgeText && <Badge text={props.badgeText} badgeStyles={[styles.alignSelfCenter]} />}

                    {/* Since subtitle can be of type number, we should allow 0 to be shown */}
                    {(props.subtitle || props.subtitle === 0) && (
                        <View style={[styles.justifyContentCenter, styles.mr1]}>
                            <Text
                                style={styles.textLabelSupporting}
                            >
                                {props.subtitle}
                            </Text>
                        </View>
                    )}
                    {props.shouldShowRightIcon && (
                        <View style={styles.popoverMenuIcon}>
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

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;
MenuItem.displayName = 'MenuItem';

export default MenuItem;
