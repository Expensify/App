import styles from '@styles/styles';
import variables from '@styles/variables';
import GetContextMenuItemStyle from './types';

const getContextMenuItemStyles: GetContextMenuItemStyle = (windowWidth) => {
    if (windowWidth && windowWidth > variables.mobileResponsiveWidthBreakpoint) {
        return [styles.popoverMenuItem, styles.contextMenuItemPopoverMaxWidth];
    }
    return [styles.popoverMenuItem];
};

export default getContextMenuItemStyles;
