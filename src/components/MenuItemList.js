import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';
import menuItemPropTypes from './menuItemPropTypes';
import * as ReportActionContextMenu from '../pages/home/report/ContextMenu/ReportActionContextMenu';
import {CONTEXT_MENU_TYPES} from '../pages/home/report/ContextMenu/ContextMenuActions';

const propTypes = {
    /** An array of props that are pass to individual MenuItem components */
    menuItems: PropTypes.arrayOf(PropTypes.shape(menuItemPropTypes)),
};
const defaultProps = {
    menuItems: [],
};

const MenuItemList = (props) => {
    let popoverAnchor;

    /**
     * Handle the secondary interaction for a menu item.
     *
     * @param {*} link the menu item link or function to get the link
     * @param {Event} e the interaction event
     */
    const secondaryInteraction = (link, e) => {
        if (typeof link === 'function') {
            link().then((url) => ReportActionContextMenu.showContextMenu(CONTEXT_MENU_TYPES.LINK, e, url, popoverAnchor));
        } else if (!_.isEmpty(link)) {
            ReportActionContextMenu.showContextMenu(CONTEXT_MENU_TYPES.LINK, e, link, popoverAnchor);
        }
    };

    return (
        <>
            {_.map(props.menuItems, (menuItemProps) => (
                <MenuItem
                    key={menuItemProps.title}
                    onSecondaryInteraction={!_.isUndefined(menuItemProps.link) ? (e) => secondaryInteraction(menuItemProps.link, e) : undefined}
                    ref={(el) => (popoverAnchor = el)}
                    shouldBlockSelection={Boolean(menuItemProps.link)}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...menuItemProps}
                />
            ))}
        </>
    );
};

MenuItemList.displayName = 'MenuItemList';
MenuItemList.propTypes = propTypes;
MenuItemList.defaultProps = defaultProps;

export default MenuItemList;
