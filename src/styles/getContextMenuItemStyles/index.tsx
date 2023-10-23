import styles from '../styles';
import variables from '../variables';

export default (windowWidth) => {
    if (windowWidth > variables.mobileResponsiveWidthBreakpoint) {
        return [styles.popoverMenuItem, styles.contextMenuItemPopoverMaxWidth];
    }
    return [styles.popoverMenuItem];
};
