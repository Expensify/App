import React from 'react';
import PropTypes from 'prop-types';
import {View, Text, Pressable} from 'react-native';
import Modal from './Modal';
import styles from '../styles/styles';
import CONST from '../CONST';
import themeColors from '../styles/themes/default';
import colors from '../styles/colors';

const propTypes = {
    // Callback to fire on request to modal close
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the create menu or not
    isVisible: PropTypes.bool.isRequired,

    // The data array containing the icon, text and callback information of each item
    menuItemData: PropTypes.arrayOf(PropTypes.shape({
        // The icon component of the item
        icon: PropTypes.func.isRequired,

        // The text content of the item
        text: PropTypes.string.isRequired,

        // Callback to fire on item press
        onPress: PropTypes.func.isRequired,
    })).isRequired,
};

const CreateMenu = props => (
    <Modal
        onClose={props.onClose}
        isVisible={props.isVisible}
        type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
    >
        {props.menuItemData.map(item => (
            <Pressable
                key={item.text}
                onPress={item.onPress}
                style={({hovered}) => ([
                    styles.sidebarCreateMenuItem,
                    {backgroundColor: hovered ? themeColors.buttonHoveredBG : colors.transparent},
                ])}
            >
                <View style={styles.sidebarCreateMenuIcon}>
                    <item.icon width={24} height={24} />
                </View>
                <View style={styles.justifyContentCenter}>
                    <Text style={[styles.sidebarCreateMenuText, styles.ml3]}>
                        {item.text}
                    </Text>

                </View>
            </Pressable>
        ))}
    </Modal>
);

CreateMenu.propTypes = propTypes;
CreateMenu.displayName = 'CreateMenu';
export default CreateMenu;
