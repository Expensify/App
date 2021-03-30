import React from 'react';
import {
    View, Text, Pressable,
} from 'react-native';
import PropTypes from 'prop-types';

import styles from '../styles/styles';
import Icon from './Icon';
import {ArrowRight} from './Icon/Expensicons';

const propTypes = {
    // Function to fire when component is pressed
    onPress: PropTypes.func.isRequired,

    // Icon to display on the left side of component
    icon: PropTypes.func.isRequired,

    // Text to display for the item
    title: PropTypes.string.isRequired,

    // Boolean whether to display the ArrowRight icon
    shouldShowRightArrow: PropTypes.bool,
};

const defaultProps = {
    shouldShowRightArrow: false,
};

const MenuItem = ({
    onPress,
    icon,
    title,
    shouldShowRightArrow,
}) => (
    <Pressable
        onPress={onPress}
        style={({hovered}) => ([
            styles.createMenuItem,
            hovered && styles.hoveredButton,
        ])}
    >
        <View style={styles.flexRow}>
            <View style={styles.createMenuIcon}>
                <Icon src={icon} />
            </View>
            <View style={styles.justifyContentCenter}>
                <Text style={[styles.createMenuText, styles.ml3]}>
                    {title}
                </Text>
            </View>
        </View>
        {shouldShowRightArrow && (
            <View style={styles.createMenuIcon}>
                <Icon src={ArrowRight} />
            </View>
        )}
    </Pressable>
);

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;
MenuItem.displayName = 'MenuItem';

export default MenuItem;
