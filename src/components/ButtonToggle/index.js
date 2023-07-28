import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import Button from '../Button';

const propTypes = {
    /** Key of the currently active toggle */
    activeToggle: PropTypes.string.isRequired,

    /** Array of all possible items to toggle through */
    toggleItems: PropTypes.arrayOf(PropTypes.shape({
        /** Text label for the button */
        text: PropTypes.string,

        /** Unique key for rendering and search purposes */
        key: PropTypes.string,

        /** An icon element displayed on the left side */
        icon: PropTypes.func,

        /** Function to be called when button is clicked */
        action: PropTypes.func,
    })).isRequired,

    /** Additional styles to add after local styles. */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    style: []
};

function ButtonToggle({ activeToggle, toggleItems, style }) {

    const setToggle = (toggleKey) => {
        const activatedToggle = _.find(toggleItems, (toggle) => (
            toggle.key === toggleKey
        ))

        if (activeToggle !== activatedToggle) {
            activatedToggle.action()
        }
    }

    return (
        <>
            <View style={[styles.flexRow, ...style]}>
                {_.map(toggleItems, (toggle) => (
                    <Button
                        key={toggle.key}
                        text={toggle.text}
                        onPress={() => setToggle(toggle.key)}
                        icon={toggle.icon}
                        iconFill={themeColors.iconMenu}
                        style={styles.flexGrow1}
                        transparent={activeToggle !== toggle.key}
                        centered
                        medium
                    />
                ))}
            </View>
        </>
    )
}

ButtonToggle.propTypes = propTypes;
ButtonToggle.defaultProps = defaultProps;

export default ButtonToggle;
