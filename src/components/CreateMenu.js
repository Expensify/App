import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {
    View, Text, Pressable, useWindowDimensions,
} from 'react-native';
import Modal from './Modal';
import styles from '../styles/styles';
import CONST from '../CONST';
import themeColors from '../styles/themes/default';
import colors from '../styles/colors';
import Icon from './Icon';
import {ChatBubble, Users} from './Icon/Expensicons';
import variables from '../styles/variables';

const propTypes = {
    // Callback to fire on request to modal close
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the create menu or not
    isVisible: PropTypes.bool.isRequired,

    // Callback to fire when a CreateMenu item is selected
    onItemSelected: PropTypes.func.isRequired,
};

const CreateMenu = (props) => {
    const isSmallScreen = useWindowDimensions().width < variables.mobileResponsiveWidthBreakpoint;

    // This format allows to set individual callbacks to each item
    // while including mutual callbacks first
    const menuItemData = [
        {icon: ChatBubble, text: 'New Chat', onPress: () => {}},
        {icon: Users, text: 'New Group', onPress: () => {}},
    ].map(item => ({
        ...item,
        onPress: () => {
            props.onItemSelected();
            item.onPress();
        },
    }));

    return (
        <Modal
            onClose={props.onClose}
            isVisible={props.isVisible}
            type={
                isSmallScreen
                    ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED
                    : CONST.MODAL.MODAL_TYPE.POPOVER
            }
        >
            {menuItemData.map(({icon, text, onPress}) => (
                <Pressable
                    key={text}
                    onPress={onPress}
                    style={({hovered}) => ([
                        styles.createMenuItem,
                        {backgroundColor: hovered ? themeColors.buttonHoveredBG : colors.transparent},
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
};

CreateMenu.propTypes = propTypes;
CreateMenu.displayName = 'CreateMenu';
export default memo(CreateMenu);
