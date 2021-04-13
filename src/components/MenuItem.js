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
    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    wrapperStyle: PropTypes.object,

    // Function to fire when component is pressed
    onPress: PropTypes.func.isRequired,

    // Icon to display on the left side of component
    icon: PropTypes.elementType.isRequired,

    // Text to display for the item
    title: PropTypes.string.isRequired,

    // Boolean whether to display the ArrowRight icon
    shouldShowRightArrow: PropTypes.bool,

    // A boolean flag that gives the icon a green fill if true
    success: PropTypes.bool,
};

const defaultProps = {
    shouldShowRightArrow: false,
    wrapperStyle: {},
    success: false,
};

const MenuItem = ({
    onPress,
    icon,
    title,
    shouldShowRightArrow,
    wrapperStyle,
    success,
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
                    <View style={styles.createMenuIcon}>
                        <Icon src={icon} fill={getIconFillColor(getButtonState(hovered, pressed, success))} />
                    </View>
                    <View style={styles.justifyContentCenter}>
                        <Text style={[styles.createMenuText, styles.ml3]}>
                            {title}
                        </Text>
                    </View>
                </View>
                {shouldShowRightArrow && (
                    <View style={styles.createMenuIcon}>
                        <Icon src={ArrowRight} fill={getIconFillColor(getButtonState(hovered, pressed))} />
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
