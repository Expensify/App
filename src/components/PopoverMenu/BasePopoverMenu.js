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
import Text from '../Text';

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
            activeMenuIndex: -1,
        };
    }

    componentDidMount() {
        if (!this.props.allowKeyboardNavigation) {
            return;
        }
        this.setupEventHandlers();
    }

    componentWillUnmount() {
        if (!this.props.allowKeyboardNavigation) {
            return;
        }
        this.cleanupEventHandlers();
    }

    setupEventHandlers() {
        if (!document) {
            return;
        }

        this.keyDownHandler = (keyBoardEvent) => {
            if (keyBoardEvent.key.startsWith('Arrow')) {
                this.highlightActiveMenu(keyBoardEvent.key);
                return;
            }

            if (keyBoardEvent.key === 'Enter' && this.state.activeMenuIndex !== -1) {
                this.props.onItemSelected(this.props.menuItems[this.state.activeMenuIndex]);
            }
        };
    }

    highlightActiveMenu(arrowKey) {
        let activeMenuIndex = this.state.activeMenuIndex;
        if (arrowKey !== 'ArrowDown' && arrowKey !== 'ArrowUp') {
            return;
        }

        if (arrowKey === 'ArrowDown') {
            if (activeMenuIndex === -1 || activeMenuIndex === this.props.menuItems.length - 1) {
                activeMenuIndex = 0;
            } else {
                activeMenuIndex += 1;
            }
        }

        if (arrowKey === 'ArrowUp') {
            if (activeMenuIndex === -1 || activeMenuIndex === 0) {
                activeMenuIndex = this.props.menuItems.length - 1;
            } else {
                activeMenuIndex -= 1;
            }
        }
        this.setState(() => ({activeMenuIndex}));
    }

    cleanupEventHandlers() {
        if (!document) {
            return;
        }
        document.removeEventListener('keydown', this.keyDownHandler, true);
    }

    render() {
        return (
            <Popover
                anchorPosition={this.props.anchorPosition}
                onClose={this.props.onClose}
                isVisible={this.props.isVisible}
                onModalHide={this.props.onMenuHide}
                animationIn={this.props.animationIn}
                animationOut={this.props.animationOut}
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
                    {_.map(this.props.menuItems, (item, index) => (
                        <MenuItem
                            key={item.text}
                            icon={item.icon}
                            iconWidth={item.iconWidth}
                            iconHeight={item.iconHeight}
                            title={item.text}
                            description={item.description}
                            onPress={() => this.props.onItemSelected(item)}
                            focused={index === this.state.activeMenuIndex}
                        />
                    ))}
                </View>
            </Popover>
        );
    }
}

BasePopoverMenu.propTypes = propTypes;
BasePopoverMenu.defaultProps = defaultProps;
export default withWindowDimensions(BasePopoverMenu);
