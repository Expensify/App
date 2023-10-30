import styles from '@styles/styles';
import variables from '@styles/variables';

export default (windowWidth) => {
    if (windowWidth > variables.mobileResponsiveWidthBreakpoint) {
        return [styles.popoverMenuItem, styles.contextMenuItemPopoverMaxWidth];
    }
    return [styles.popoverMenuItem];
};
