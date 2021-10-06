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
import MenuItemPropTypes from './MenuItemPropTypes';

const propTypes = {
    ...MenuItemPropTypes,
};

const defaultProps = {
    badgeText: undefined,
    shouldShowRightIcon: false,
    wrapperStyle: {},
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
};

const MenuItem = ({
    badgeText,
    onPress,
    icon,
    iconRight,
    title,
    shouldShowRightIcon,
    wrapperStyle,
    success,
    iconWidth,
    iconHeight,
    description,
    iconStyles,
    iconFill,
    focused,
    disabled,
    subtitle,
    iconType,
}) => (
    <Pressable
        onPress={(e) => {
            if (disabled) {
                return;
            }

            onPress(e);
        }}
        style={({hovered, pressed}) => ([
            styles.popoverMenuItem,
            getButtonBackgroundColorStyle(getButtonState(focused || hovered, pressed, success, disabled)),
            wrapperStyle,
        ])}
        disabled={disabled}
    >
        {({hovered, pressed}) => (
            <>
                <View style={styles.flexRow}>
                    {(icon && iconType === CONST.ICON_TYPE_ICON) && (
                        <View
                            style={[
                                styles.popoverMenuIcon,
                                ...iconStyles,
                            ]}
                        >
                            <Icon
                                src={icon}
                                width={iconWidth}
                                height={iconHeight}
                                fill={iconFill || getIconFillColor(
                                    getButtonState(focused || hovered, pressed, success, disabled),
                                )}
                            />
                        </View>
                    )}
                    {(icon && iconType === CONST.ICON_TYPE_AVATAR) && (
                        <View
                            style={[
                                styles.popoverMenuIcon,
                                ...iconStyles,
                            ]}
                        >
                            <Avatar
                                imageStyles={[styles.avatarNormal, styles.alignSelfCenter]}
                                source={icon}
                            />
                        </View>
                    )}
                    <View style={[styles.justifyContentCenter, styles.menuItemTextContainer]}>
                        <Text
                            style={[
                                styles.popoverMenuText,
                                styles.ml3,
                                (disabled ? styles.disabledText : undefined),
                            ]}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                        {description && (
                            <Text style={[styles.textLabelSupporting, styles.ml3, styles.mt1]}>
                                {description}
                            </Text>
                        )}
                    </View>
                </View>
                <View style={[styles.flexRow, styles.menuItemTextContainer]}>
                    {badgeText && <Badge text={badgeText} badgeStyles={[styles.alignSelfCenter]} />}
                    {subtitle && (
                        <View style={[styles.justifyContentCenter, styles.mr1]}>
                            <Text
                                style={styles.textLabelSupporting}
                            >
                                {subtitle}
                            </Text>
                        </View>
                    )}
                    {shouldShowRightIcon && (
                        <View style={styles.popoverMenuIcon}>
                            <Icon
                                src={iconRight}
                                fill={getIconFillColor(getButtonState(focused || hovered, pressed, success, disabled))}
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
