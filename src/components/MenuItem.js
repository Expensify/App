import React from 'react';
import {
    View, Text, Pressable,
} from 'react-native';
import PropTypes from 'prop-types';
import styles, {getButtonBackgroundColorStyle, getIconFillColor} from '../styles/styles';
import Icon from './Icon';
import {ArrowRight} from './Icon/Expensicons';
import getButtonState from '../libs/getButtonState';
import variables from '../styles/variables';

const propTypes = {
    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    wrapperStyle: PropTypes.object,

    /** Function to fire when component is pressed */
    onPress: PropTypes.func.isRequired,

    /** Icon to display on the left side of component */
    icon: PropTypes.elementType,

    /** Text to display for the item */
    title: PropTypes.string.isRequired,

    /** Boolean whether to display the right icon */
    shouldShowRightIcon: PropTypes.bool,

    /** A boolean flag that gives the icon a green fill if true */
    success: PropTypes.bool,

    // Overrides the icon for shouldShowRightIcon
    iconRight: PropTypes.elementType,

    /** If true, the icon will appear larger and have a circular grey background with a white fill */
    emphasizeIcon: PropTypes.bool,
};

const defaultProps = {
    shouldShowRightIcon: false,
    wrapperStyle: {},
    success: false,
    icon: undefined,
    iconRight: ArrowRight,
    emphasizeIcon: false,
};

const MenuItem = ({
    onPress,
    icon,
    iconRight,
    title,
    shouldShowRightIcon,
    wrapperStyle,
    success,
    emphasizeIcon,
}) => (
    <Pressable
        onPress={onPress}
        style={({hovered, pressed}) => ([
            styles.createMenuItem,
            getButtonBackgroundColorStyle(getButtonState(hovered, pressed)),
            wrapperStyle,
        ])}
    >
        {({hovered, pressed}) => (
            <>
                <View style={styles.flexRow}>
                    {icon && (
                        <View
                            style={[
                                styles.createMenuIcon,
                                emphasizeIcon ? styles.createMenuIconEmphasized : undefined,
                            ]}
                        >
                            <Icon
                                src={icon}
                                fill={getIconFillColor(getButtonState(hovered, pressed, success), emphasizeIcon)}
                            />
                        </View>
                    )}
                    <View style={[styles.justifyContentCenter, styles.menuItemTextContainer]}>
                        <Text style={[styles.createMenuText, styles.ml3]}>
                            {title}
                        </Text>
                    </View>
                </View>
                {shouldShowRightIcon && (
                    <View style={styles.createMenuIcon}>
                        <Icon src={iconRight} fill={getIconFillColor(getButtonState(hovered, pressed))} />
                    </View>
                )}
            </>
        )}
    </Pressable>
);

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;
MenuItem.displayName = 'MenuItem';

export default MenuItem;
