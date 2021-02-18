import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    View, Text, Pressable,
} from 'react-native';
import Modal from './Modal';
import styles from '../styles/styles';
import CONST from '../CONST';
import themeColors from '../styles/themes/default';
import Icon from './Icon';
import {ChatBubble, Users} from './Icon/Expensicons';
import {redirect} from '../libs/actions/App';
import ROUTES from '../ROUTES';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

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
                onPress: () => this.setOnModalHide(() => redirect(ROUTES.NEW_CHAT)),
            },
            {
                icon: Users,
                text: 'New Group',
                onPress: () => this.setOnModalHide(() => redirect(ROUTES.NEW_GROUP)),
            },
        ].map(item => ({
            ...item,
            onPress: () => {
                this.props.onItemSelected();
                item.onPress();
            },
        }));

        return (
            <Modal
                onClose={this.props.onClose}
                isVisible={this.props.isVisible}
                onModalHide={() => {
                    this.onModalHide();
                    this.resetOnModalHide();
                }}
                type={
                    this.props.isSmallScreenWidth
                        ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED
                        : CONST.MODAL.MODAL_TYPE.POPOVER
                }
                anchorPosition={styles.createMenuPosition}
            >
                <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                    {menuItemData.map(({icon, text, onPress}) => (
                        <Pressable
                            key={text}
                            onPress={onPress}
                            style={({hovered}) => ([
                                styles.createMenuItem,
                                hovered && {backgroundColor: themeColors.buttonHoveredBG},
                            ])}
                        >
                            <View style={styles.createMenuIcon}>
                                <Icon src={icon} />
                            </View>
                            <View style={styles.justifyContentCenter}>
                                <Text style={[styles.createMenuText, styles.ml3]}>
                                    {text}
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </Modal>
        );
    }
}

CreateMenu.propTypes = propTypes;
CreateMenu.displayName = 'CreateMenu';
export default withWindowDimensions(CreateMenu);
