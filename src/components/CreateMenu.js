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
import {
    ChatBubble, Users, Receipt, MoneyCircle, Paperclip,
} from './Icon/Expensicons';
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
                onSelected: () => redirect(ROUTES.NEW_CHAT),
            },
            [CONST.MENU_ITEM_KEYS.NEW_GROUP]: {
                icon: Users,
                text: 'New Group',
                onSelected: () => redirect(ROUTES.NEW_GROUP),
            },
            [CONST.MENU_ITEM_KEYS.REQUEST_MONEY]: {
                icon: MoneyCircle,
                text: 'Request Money',
                onSelected: () => redirect(ROUTES.NEW_CHAT),
            },
            [CONST.MENU_ITEM_KEYS.SPLIT_BILL]: {
                icon: Receipt,
                text: 'Split Bill',
                onSelected: () => redirect(ROUTES.NEW_CHAT),
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
            >
                {this.menuItemData.map(({icon, text, onPress}) => (
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
            </Modal>
        );
    }
}

CreateMenu.propTypes = propTypes;
CreateMenu.defaultProps = defaultProps;
CreateMenu.displayName = 'CreateMenu';
export default withWindowDimensions(CreateMenu);
