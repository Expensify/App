import React, {Component} from 'react';
import Popover from "./Popover";
import PropTypes from 'prop-types';
import {ChatBubble, Users} from './Icon/Expensicons';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from "./withWindowDimensions";
import MenuItem from './MenuItem';

const propTypes = {
    // State that determines whether to display the create menu or not
    isVisible: PropTypes.bool.isRequired,

    // 
    onClose: PropTypes.func.isRequired,

    ...windowDimensionsPropTypes,
};

class VideoChatMenu extends Component {
    constructor(props) {
        super(props)


    }

    render() {
        const menuItemData = [
            {
                icon: ChatBubble,
                text: 'New Chat',
                onPress: () => console.log('new chat'),
            },
            {
                icon: Users,
                text: 'New Group',
                onPress: () => console.log('new group'),
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
                {menuItemData.map(({icon, text, onPress}) => (
                    <MenuItem
                        key={text}
                        icon={icon}
                        title={text}
                        onPress={onPress}
                    />
                ))}
             </Popover>
        )
    }
}

VideoChatMenu.propTypes = propTypes;
VideoChatMenu.displayName = 'VideoChatMenu';
export default withWindowDimensions(VideoChatMenu);