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
import ExpensifyText from '../ExpensifyText';

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
            >
                <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                    {!_.isEmpty(this.props.headerText) && (
                        <View style={styles.createMenuItem}>
                            <ExpensifyText
                                style={[styles.createMenuHeaderText, styles.ml3]}
                            >
                                {this.props.headerText}
                            </ExpensifyText>
                        </View>
                    )}
                    {_.map(this.props.menuItems, item => (
                        <MenuItem
                            key={item.text}
                            icon={item.icon}
                            iconWidth={item.iconWidth}
                            iconHeight={item.iconHeight}
                            title={item.text}
                            description={item.description}
                            onPress={() => this.props.onItemSelected(item)}
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
