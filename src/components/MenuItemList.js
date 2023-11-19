import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import useSingleExecution from '@hooks/useSingleExecution';
import {CONTEXT_MENU_TYPES} from '@pages/home/report/ContextMenu/ContextMenuActions';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import MenuItem from './MenuItem';
import menuItemPropTypes from './menuItemPropTypes';

const propTypes = {
    /** An array of props that are pass to individual MenuItem components */
    menuItems: PropTypes.arrayOf(PropTypes.shape(menuItemPropTypes)),

    /** Whether or not to use the single execution hook */
    shouldUseSingleExecution: PropTypes.bool,
};
const defaultProps = {
    menuItems: [],
    shouldUseSingleExecution: false,
};

function MenuItemList(props) {
    let popoverAnchor;
    const {isExecuting, singleExecution} = useSingleExecution();

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
                    disabled={menuItemProps.disabled || isExecuting}
                    onPress={props.shouldUseSingleExecution ? singleExecution(menuItemProps.onPress) : menuItemProps.onPress}
                />
            ))}
        </>
    );
}

MenuItemList.displayName = 'MenuItemList';
MenuItemList.propTypes = propTypes;
MenuItemList.defaultProps = defaultProps;

export default MenuItemList;
