import variables from '@styles/variables';
import type GetContextMenuItemStyle from './types';

const getContextMenuItemStyles: GetContextMenuItemStyle = (styles, windowWidth) => {
    if (windowWidth && windowWidth > variables.mobileResponsiveWidthBreakpoint) {
        return [styles.popoverMenuItem, styles.contextMenuItemPopoverMaxWidth];
    }
    return [styles.popoverMenuItem];
};

export default getContextMenuItemStyles;
