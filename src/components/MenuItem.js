import React from 'react';
import {
    View, Text, Pressable,
} from 'react-native';
import PropTypes from 'prop-types';
import styles, {getButtonBackgroundColorStyle, getIconFillColor} from '../styles/styles';
import Icon from './Icon';
import {ArrowRight} from './Icon/Expensicons';
import getButtonState from '../libs/getButtonState';

const propTypes = {
    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    wrapperStyle: PropTypes.object,

    /** Function to fire when component is pressed */
    onPress: PropTypes.func.isRequired,

    /** Icon to display on the left side of component */
    icon: PropTypes.elementType,

    /** Icon Height */
    iconWidth: PropTypes.number,

    /** Icon Height */
    iconHeight: PropTypes.number,

    /** Text to display for the item */
    title: PropTypes.string.isRequired,

    /** Boolean whether to display the right icon */
    shouldShowRightIcon: PropTypes.bool,

    /** A boolean flag that gives the icon a green fill if true */
    success: PropTypes.bool,

    /** Overrides the icon for shouldShowRightIcon */
    iconRight: PropTypes.elementType,

    /** A description text to show under the title */
    description: PropTypes.string,

    /** Any additional styles to pass to the icon container. */
    iconStyles: PropTypes.arrayOf(PropTypes.object),

    /** The fill color to pass into the icon. */
    iconFill: PropTypes.string,

    /** Whether item is focused or active */
    focused: PropTypes.bool,
};

const defaultProps = {
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
};

const MenuItem = ({
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
}) => (
    <Pressable
        onPress={onPress}
        style={({hovered, pressed}) => ([
            styles.createMenuItem,
            getButtonBackgroundColorStyle(getButtonState(focused || hovered, pressed)),
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
                            ...iconStyles,
                        ]}
                    >
                        <Icon
                            src={icon}
                            width={iconWidth}
                            height={iconHeight}
                            fill={iconFill || getIconFillColor(getButtonState(focused || hovered, pressed, success))}
                        />
                    </View>
                    )}
                    <View style={[styles.justifyContentCenter, styles.menuItemTextContainer]}>
                        <Text style={[styles.createMenuText, styles.ml3]}>
                            {title}
                        </Text>
                        {description && (
                            <Text style={[styles.createMenuDescription, styles.ml3, styles.mt1]}>
                                {description}
                            </Text>
                        )}
                    </View>
                </View>
                {shouldShowRightIcon && (
                <View style={styles.createMenuIcon}>
                    <Icon src={iconRight} fill={getIconFillColor(getButtonState(focused || hovered, pressed))} />
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
