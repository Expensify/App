import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Popover from '../Popover';
import styles from '../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import MenuItem from '../MenuItem';

const propTypes = {
    // Callback to fire on request to modal close
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the create menu or not
    isVisible: PropTypes.bool.isRequired,

    // Callback to fire when a CreateMenu item is selected
    onItemSelected: PropTypes.func.isRequired,

    // Menu items to be rendered on the list
    menuItems: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.func.isRequired,
            text: PropTypes.string.isRequired,
            onSelected: PropTypes.func.isRequired,
        }),
    ).isRequired,

    ...windowDimensionsPropTypes,

    // Trigger the item `onSelected` action immediately after press or after the modal hides
    invokeActionImmediately: PropTypes.bool,
};

const defaultProps = {
    invokeActionImmediately: false,
};

class BaseCreateMenu extends PureComponent {
    constructor(props) {
        super(props);
        this.triggerSelectedItem = this.triggerSelectedItem.bind(this);
    }

    /**
     * Trigger the selected item `onSelected` callback when the modal closes
     */
    triggerSelectedItem() {
        if (this.selectedItem) {
            this.selectedItem.onSelected();
        }

        this.selectedItem = null;
    }

    render() {
        return (
            <Popover
                onClose={this.props.onClose}
                isVisible={this.props.isVisible}
                onModalHide={this.triggerSelectedItem}
                anchorPosition={styles.createMenuPosition}
            >
                <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                    {this.props.menuItems.map(item => (
                        <MenuItem
                            key={item.text}
                            icon={item.icon}
                            title={item.text}
                            onPress={() => {
                                this.props.onItemSelected(item);
                                if (this.props.invokeActionImmediately) {
                                    item.onSelected();
                                } else {
                                    this.selectedItem = item;
                                }
                            }}
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
