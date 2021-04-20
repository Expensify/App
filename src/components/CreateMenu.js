import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Popover from './Popover';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import MenuItem from './MenuItem';

const propTypes = {
    // Callback to fire on request to modal close
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the create menu or not
    isVisible: PropTypes.bool.isRequired,

    // Callback to fire when a CreateMenu item is selected
    onItemSelected: PropTypes.func.isRequired,

    // Menu items to be rendered on the list
    menuItems: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.func.isRequired,
            text: PropTypes.string.isRequired,
            onSelected: PropTypes.func.isRequired,
        }),
    ).isRequired,

    // The anchor position of the CreateMenu popover
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,

    // A react-native-animatable animation definition for the modal display animation.
    animationIn: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),

    // A react-native-animatable animation definition for the modal hide animation.
    animationOut: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    animationIn: 'fadeIn',
    animationOut: 'fadeOut',
};

class CreateMenu extends PureComponent {
    constructor(props) {
        super(props);
        this.onModalHide = () => {};
        this.setOnModalHide = this.setOnModalHide.bind(this);
        this.resetOnModalHide = this.resetOnModalHide.bind(this);
    }

    /**
     * Sets a new function to execute when the modal hides
     * @param {Function} callback The function to be called on modal hide
     */
    setOnModalHide(callback) {
        this.onModalHide = callback;
    }

    /**
     * After the modal hides, reset the onModalHide to an empty function
     */
    resetOnModalHide() {
        this.onModalHide = () => {};
    }

    render() {
        return (
            <Popover
                anchorPosition={this.props.anchorPosition}
                onClose={this.props.onClose}
                isVisible={this.props.isVisible}
                onModalHide={() => {
                    this.onModalHide();
                    this.resetOnModalHide();
                }}
                animationIn={this.props.animationIn}
                animationOut={this.props.animationOut}
            >
                <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                    {this.props.menuItems.map(({
                        icon,
                        text,
                        onSelected = () => {},
                    }) => (
                        <MenuItem
                            key={text}
                            icon={icon}
                            title={text}
                            onPress={() => {
                                this.props.onItemSelected();
                                this.setOnModalHide(onSelected);
                            }}
                        />
                    ))}
                </View>
            </Popover>
        );
    }
}

CreateMenu.propTypes = propTypes;
CreateMenu.defaultProps = defaultProps;

export default withWindowDimensions(CreateMenu);
