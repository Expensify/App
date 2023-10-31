import {Styles} from '@styles/styles';
import variables from '@styles/variables';

export default (styles: Styles, windowWidth: number) => {
    if (windowWidth > variables.mobileResponsiveWidthBreakpoint) {
        return [styles.popoverMenuItem, styles.contextMenuItemPopoverMaxWidth];
    }
    return [styles.popoverMenuItem];
};
