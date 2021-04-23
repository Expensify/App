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
} from './CreateMenuPropTypes';

const propTypes = {
    // Callback fired when the menu is completely closed
    onMenuHide: PropTypes.func,

    ...createMenuPropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    ...defaultCreateMenuPropTypes,
    onMenuHide: () => {},
};

class BaseCreateMenu extends PureComponent {
    render() {
        return (
            <Popover
                anchorPosition={this.props.anchorPosition}
                onClose={this.props.onClose}
                isVisible={this.props.isVisible}
                onModalHide={this.props.onMenuHide}
                animationIn={this.props.animationIn}
                animationOut={this.props.animationOut}
            >
                <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                    {this.props.menuItems.map(item => (
                        <MenuItem
                            key={item.text}
                            icon={item.icon}
                            title={item.text}
                            onPress={() => this.props.onItemSelected(item)}
                        />
                    ))}
                </View>
            </Popover>
        );
    }
}

BaseCreateMenu.propTypes = propTypes;
BaseCreateMenu.defaultProps = defaultProps;
export default withWindowDimensions(BaseCreateMenu);
