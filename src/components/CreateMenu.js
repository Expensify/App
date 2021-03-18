import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Popover from './Popover';
import styles from '../styles/styles';
import {ChatBubble, Users} from './Icon/Expensicons';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import MenuItem from './MenuItem';

const propTypes = {
    // Callback to fire on request to modal close
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the create menu or not
    isVisible: PropTypes.bool.isRequired,

    // Callback to fire when a CreateMenu item is selected
    onItemSelected: PropTypes.func.isRequired,

    ...windowDimensionsPropTypes,
};

class CreateMenu extends PureComponent {
    constructor(props) {
        super(props);

        this.setOnModalHide = this.setOnModalHide.bind(this);
        this.resetOnModalHide = this.resetOnModalHide.bind(this);
        this.onModalHide = () => {};
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
        // This format allows to set individual callbacks to each item
        // while including mutual callbacks first
        const menuItemData = [
            {
                icon: ChatBubble,
                text: 'New Chat',
                onPress: () => this.setOnModalHide(() => Navigation.navigate(ROUTES.NEW_CHAT)),
            },
            {
                icon: Users,
                text: 'New Group',
                onPress: () => this.setOnModalHide(() => Navigation.navigate(ROUTES.NEW_GROUP)),
            },
        ].map(item => ({
            ...item,
            onPress: () => {
                this.props.onItemSelected();
                item.onPress();
            },
        }));

        return (
            <Popover
                onClose={this.props.onClose}
                isVisible={this.props.isVisible}
                onModalHide={() => {
                    this.onModalHide();
                    this.resetOnModalHide();
                }}
                anchorPosition={styles.createMenuPosition}
            >
                <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                    {menuItemData.map(({icon, text, onPress}) => (
                        <MenuItem
                            key={text}
                            icon={icon}
                            title={text}
                            onPress={onPress}
                        />
                    ))}
                </View>
            </Popover>
        );
    }
}

CreateMenu.propTypes = propTypes;
CreateMenu.displayName = 'CreateMenu';
export default withWindowDimensions(CreateMenu);
