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
    }

    /**
     * @param {Number} index
     */
    updateFocusedIndex(index) {
        this.setState({focusedIndex: index});
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
                    <ArrowKeyFocusManager
                        focusedIndex={this.state.focusedIndex}
                        maxIndex={this.props.menuItems.length - 1}
                        onFocusedIndexChanged={this.props.enableArrowKeysActions ? this.updateFocusedIndex : () => { }}
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
                                onFocus={() => this.updateFocusedIndex(menuIndex)}
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
