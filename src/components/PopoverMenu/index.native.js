import React, {Component} from 'react';
import BasePopoverMenu from './BasePopoverMenu';
import {propTypes, defaultProps} from './PopoverMenuPropTypes';

/**
 * The mobile native implementation of the PopoverMenu needs to trigger actions after the popup closes
 * We need to wait for the modal to close otherwise menu actions that trigger another modal
 * would not work
 */
class PopoverMenu extends Component {
    /**
     * Set the item's `onSelected` action to fire after the menu popup closes
     * @param {{onSelected: function}} item
     */
    selectItem(item) {
        this.onMenuHide = () => {
            item.onSelected();

            // Clean up: open and immediately cancel should not re-trigger the last action
            this.onMenuHide = () => {};
        };

        this.props.onItemSelected(item);
    }

    render() {
        return (
            <BasePopoverMenu
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                onMenuHide={this.onMenuHide}
                onItemSelected={item => this.selectItem(item)}
            />
        );
    }
}

PopoverMenu.propTypes = propTypes;
PopoverMenu.defaultProps = defaultProps;

export default PopoverMenu;
