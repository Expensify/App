import _ from 'underscore';
import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Popover from '../Popover';
import styles from '../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import MenuItem from '../MenuItem';
import {
    propTypes as createMenuPropTypes,
    defaultProps as defaultCreateMenuPropTypes,
} from './popoverMenuPropTypes';
import ArrowKeyFocusManager from '../ArrowKeyFocusManager';
import Text from '../Text';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import CONST from '../../CONST';

const propTypes = {
    /** Callback fired when the menu is completely closed */
    onMenuHide: PropTypes.func,

    ...createMenuPropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    ...defaultCreateMenuPropTypes,
    onMenuHide: () => {},
};

class BasePopoverMenu extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            focusedIndex: -1,
        };
        this.updateFocusedIndex = this.updateFocusedIndex.bind(this);
        this.resetFocusAndHideModal = this.resetFocusAndHideModal.bind(this);
        this.removeKeyboardListener = this.removeKeyboardListener.bind(this);
        this.attachKeyboardListener = this.attachKeyboardListener.bind(this);
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

    attachKeyboardListener() {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        this.unsubscribeEnterKey = KeyboardShortcut.subscribe(shortcutConfig.shortcutKey, () => {
            if (this.state.focusedIndex === -1) {
                return;
            }
            this.props.onItemSelected(this.props.menuItems[this.state.focusedIndex]);
            this.updateFocusedIndex(-1); // Reset the focusedIndex on selecting any menu
        }, shortcutConfig.descriptionKey, shortcutConfig.modifiers, true);
    }

    removeKeyboardListener() {
        if (!this.unsubscribeEnterKey) {
            return;
        }
        this.unsubscribeEnterKey();
    }

    /**
     * @param {Number} index
     */
    updateFocusedIndex(index) {
        this.setState({focusedIndex: index});
    }

    resetFocusAndHideModal() {
        this.updateFocusedIndex(-1); // Reset the focusedIndex on modal hide
        this.removeKeyboardListener();
        this.props.onMenuHide();
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
                        onFocusedIndexChanged={this.updateFocusedIndex}
                    >
                        {_.map(this.props.menuItems, (item, menuIndex) => (
                            <MenuItem
                                key={item.text}
                                icon={item.icon}
                                iconWidth={item.iconWidth}
                                iconHeight={item.iconHeight}
                                title={item.text}
                                description={item.description}
                                onPress={() => this.props.onItemSelected(item)}
                                focused={this.state.focusedIndex === menuIndex}
                            />
                        ))}
                    </ArrowKeyFocusManager>
                </View>
            </Popover>
        );
    }
}

BasePopoverMenu.propTypes = propTypes;
BasePopoverMenu.defaultProps = defaultProps;
export default withWindowDimensions(BasePopoverMenu);
