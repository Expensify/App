import React, {Component} from 'react';
import BaseCreateMenu from './BaseCreateMenu';
import createMenuPropTypes from './CreateMenuPropTypes';

/**
 * The mobile native implementation of the CreateMenu needs to trigger actions after the popup closes
 * We need to wait for the modal to close otherwise menu actions that trigger another modal
 * would not work
 */
class CreateMenu extends Component {
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
            <BaseCreateMenu
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                onMenuHide={this.onMenuHide}
                onItemSelected={item => this.selectItem(item)}
            />
        );
    }
}

CreateMenu.propTypes = createMenuPropTypes;

export default CreateMenu;
