import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Popover from './Popover';
import styles from '../styles/styles';
import {
    ChatBubble, Users, Receipt, MoneyCircle, Paperclip,
} from './Icon/Expensicons';
import ROUTES from '../ROUTES';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import CONST from '../CONST';
import Navigation from '../libs/Navigation/Navigation';
import MenuItem from './MenuItem';

const propTypes = {
    // Callback to fire on request to modal close
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the create menu or not
    isVisible: PropTypes.bool.isRequired,

    // Callback to fire when a CreateMenu item is selected
    onItemSelected: PropTypes.func.isRequired,

    // Menu items to be rendered on the list
    menuOptions: PropTypes.arrayOf(
        PropTypes.oneOf(Object.values(CONST.MENU_ITEM_KEYS)),
    ).isRequired,

    // Callback to fire when a AttachmentPicker item is selected
    onAttachmentPickerSelected: PropTypes.func,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    onAttachmentPickerSelected: () => {},
};

class CreateMenu extends PureComponent {
    constructor(props) {
        super(props);

        this.setOnModalHide = this.setOnModalHide.bind(this);
        this.resetOnModalHide = this.resetOnModalHide.bind(this);
        this.onModalHide = () => {};

        const MENU_ITEMS = {
            [CONST.MENU_ITEM_KEYS.NEW_CHAT]: {
                icon: ChatBubble,
                text: 'New Chat',
                onSelected: () => Navigation.navigate(ROUTES.IOU_BILL),
            },
            [CONST.MENU_ITEM_KEYS.NEW_GROUP]: {
                icon: Users,
                text: 'New Group',
                onSelected: () => Navigation.navigate(ROUTES.NEW_GROUP),
            },
            [CONST.MENU_ITEM_KEYS.REQUEST_MONEY]: {
                icon: MoneyCircle,
                text: 'Request Money',
                onSelected: () => Navigation.navigate(ROUTES.NEW_CHAT),
            },
            [CONST.MENU_ITEM_KEYS.SPLIT_BILL]: {
                icon: Receipt,
                text: 'Split Bill',
                onSelected: () => Navigation.navigate(ROUTES.NEW_CHAT),
            },
            [CONST.MENU_ITEM_KEYS.ATTACHMENT_PICKER]: {
                icon: Paperclip,
                text: 'Add Attachment',
                onSelected: () => this.props.onAttachmentPickerSelected(),
            },
        };

        this.menuItemData = props.menuOptions.map(key => ({
            ...MENU_ITEMS[key],
            onPress: () => {
                props.onItemSelected();
                this.setOnModalHide(() => MENU_ITEMS[key].onSelected());
            },
        }));
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
                onClose={this.props.onClose}
                isVisible={this.props.isVisible}
                onModalHide={() => {
                    this.onModalHide();
                    this.resetOnModalHide();
                }}
                anchorPosition={styles.createMenuPosition}
            >
                <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                    {this.menuItemData.map(({icon, text, onPress}) => (
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
CreateMenu.defaultProps = defaultProps;
CreateMenu.displayName = 'CreateMenu';
export default withWindowDimensions(CreateMenu);
