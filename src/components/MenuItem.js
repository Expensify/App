import _ from 'underscore';
import React from 'react';
import {
    View, Pressable,
} from 'react-native';
import Text from './Text';
import styles, {getButtonBackgroundColorStyle, getIconFillColor} from '../styles/styles';
import Icon from './Icon';
import {ArrowRight} from './Icon/Expensicons';
import getButtonState from '../libs/getButtonState';
import Avatar from './Avatar';
import Badge from './Badge';
import CONST from '../CONST';
import menuItemPropTypes from './menuItemPropTypes';

const propTypes = {
    ...menuItemPropTypes,
};

const defaultProps = {
    badgeText: undefined,
    shouldShowRightIcon: false,
    wrapperStyle: [],
    success: false,
    icon: undefined,
    iconWidth: undefined,
    iconHeight: undefined,
    description: undefined,
    iconRight: ArrowRight,
    iconStyles: [],
    iconFill: undefined,
    focused: false,
    disabled: false,
    subtitle: undefined,
    iconType: 'icon',
    onPress: () => {},
    interactive: true,
};

const MenuItem = props => (
    <Pressable
        onPress={(e) => {
            if (props.disabled) {
                return;
            }

            props.onPress(e);
        }}
        style={({hovered, pressed}) => ([
            styles.popoverMenuItem,
            getButtonBackgroundColorStyle(getButtonState(props.focused || hovered, pressed, props.success, props.disabled, props.interactive)),
            ..._.isArray(props.wrapperStyle) ? props.wrapperStyle : [props.wrapperStyle],
        ])}
        disabled={props.disabled}
    >
        {({hovered, pressed}) => (
            <>
                <View style={styles.flexRow}>
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
                                fill={props.iconFill || getIconFillColor(
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
                            />
                        </View>
                    )}
                    <View style={[styles.justifyContentCenter, styles.menuItemTextContainer]}>
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
                        {props.description && (
                            <Text style={[styles.textLabelSupporting, styles.ml3, styles.mt1]}>
                                {props.description}
                            </Text>
                        )}
                    </View>
                </View>
                <View style={[styles.flexRow, styles.menuItemTextContainer]}>
                    {props.badgeText && <Badge text={props.badgeText} badgeStyles={[styles.alignSelfCenter]} />}
                    {props.subtitle && (
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
                                fill={getIconFillColor(getButtonState(props.focused || hovered, pressed, props.success, props.disabled, props.interactive))}
                            />
                        </View>
                    )}
                </View>
            </>
        )}
    </Pressable>
);

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;
MenuItem.displayName = 'MenuItem';

export default MenuItem;
