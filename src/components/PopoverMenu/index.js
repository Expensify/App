import _ from 'underscore';
import React, {PureComponent} from 'react';
import {View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import Popover from '../Popover';
import styles from '../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import MenuItem from '../MenuItem';
import {
    propTypes as createMenuPropTypes,
    defaultProps,
} from './popoverMenuPropTypes';
import ArrowKeyFocusManager from '../ArrowKeyFocusManager';
import Text from '../Text';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import CONST from '../../CONST';

const propTypes = {
    ...createMenuPropTypes,
    ...windowDimensionsPropTypes,
};

class PopoverMenu extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            focusedIndex: -1,
        };
        this.resetFocusAndHideModal = this.resetFocusAndHideModal.bind(this);
        this.removeKeyboardListener = this.removeKeyboardListener.bind(this);
        this.attachKeyboardListener = this.attachKeyboardListener.bind(this);
        this.selectedItem = null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.isVisible === prevProps.isVisible) {
            return;
        }

        if (this.props.isVisible) {
            this.attachKeyboardListener();
        } else {
            this.removeKeyboardListener();
        }
    }

    componentWillUnmount() {
        this.removeKeyboardListener();
    }

    /**
     * Set item to local variable to fire `onSelected` action after the menu popup closes
     * @param {Object} item
     */
    selectItem(item) {
        this.selectedItem = item;
        this.props.onItemSelected(item);
    }

    attachKeyboardListener() {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        this.unsubscribeEnterKey = KeyboardShortcut.subscribe(shortcutConfig.shortcutKey, () => {
            if (this.state.focusedIndex === -1) {
                return;
            }
            this.selectItem(this.props.menuItems[this.state.focusedIndex]);
            this.setState({focusedIndex: -1}); // Reset the focusedIndex on selecting any menu
        }, shortcutConfig.descriptionKey, shortcutConfig.modifiers, true);
    }

    removeKeyboardListener() {
        if (!this.unsubscribeEnterKey) {
            return;
        }
        this.unsubscribeEnterKey();
    }

    resetFocusAndHideModal() {
        this.setState({focusedIndex: -1}); // Reset the focusedIndex on modal hide
        this.removeKeyboardListener();
        if (this.selectedItem) {
            this.selectedItem.onSelected();
            this.selectedItem = null;
        }
    }

    render() {
        return (
            <Popover
                anchorPosition={this.props.anchorPosition}
                onClose={this.props.onClose}
                isVisible={this.props.isVisible}
                onModalHide={this.resetFocusAndHideModal}
                animationIn={this.props.animationIn}
                animationOut={this.props.animationOut}
                animationInTiming={this.props.animationInTiming}
                disableAnimation={this.props.disableAnimation}
                fromSidebarMediumScreen={this.props.fromSidebarMediumScreen}
            >
                <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                    {!_.isEmpty(this.props.headerText) && (
                        <View style={styles.createMenuItem}>
                            <Text
                                style={[styles.createMenuHeaderText, styles.ml3]}
                            >
                                {this.props.headerText}
                            </Text>
                        </View>
                    )}
                    <ArrowKeyFocusManager
                        focusedIndex={this.state.focusedIndex}
                        maxIndex={this.props.menuItems.length - 1}
                        onFocusedIndexChanged={index => this.setState({focusedIndex: index})}
                    >
                        {_.map(this.props.menuItems, (item, menuIndex) => (
                            <Animated.View entering={FadeIn} key={item.text}>
                                <MenuItem
                                    key={item.text}
                                    icon={item.icon}
                                    iconWidth={item.iconWidth}
                                    iconHeight={item.iconHeight}
                                    title={item.text}
                                    description={item.description}
                                    onPress={() => this.selectItem(item)}
                                    focused={this.state.focusedIndex === menuIndex}
                                />
                            </Animated.View>
                        ))}
                    </ArrowKeyFocusManager>
                </View>
            </Popover>
        );
    }
}

PopoverMenu.propTypes = propTypes;
PopoverMenu.defaultProps = defaultProps;

export default withWindowDimensions(PopoverMenu);
