import {createContext} from 'react';

/**
 * Hover background color for MenuItems rendered inside a container card (e.g. Section), so a hovered row
 * stands out from the card background. Undefined outside a card, where MenuItems use their default hover.
 */
const MenuItemHoverBackgroundContext = createContext<string | undefined>(undefined);

export default MenuItemHoverBackgroundContext;
