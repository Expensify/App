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
     * Set the item's `onSelected` action to fire after the modal closes
     * @param {{onSelected: function}} item
     */
    selectItem(item) {
        this.onModalHide = () => {
            item.onSelected();

            // Clean up so that open and cancel does not trigger the same action
            this.onModalHide = () => {};
        };

        this.props.onItemSelected(item);
    }

    render() {
        return (
            <BaseCreateMenu
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                onModalHide={this.onModalHide}
                onItemSelected={item => this.selectItem(item)}
            />
        );
    }
}

CreateMenu.propTypes = createMenuPropTypes;

export default CreateMenu;
