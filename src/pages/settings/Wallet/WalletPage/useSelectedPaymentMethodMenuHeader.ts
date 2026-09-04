import type {PopoverMenuItem} from '@components/PopoverMenu';

import type {FormattedSelectedPaymentMethod} from '@hooks/usePaymentMethodState/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

/**
 * On narrow layouts the three-dots popover is mounted from the bottom of the screen, so it starts with a
 * non-interactive row describing the payment method the menu belongs to. Wide layouts anchor the popover
 * next to the row and need no header.
 */
function useSelectedPaymentMethodMenuHeader(formattedSelectedPaymentMethod: FormattedSelectedPaymentMethod): PopoverMenuItem[] {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (!shouldUseNarrowLayout) {
        return [];
    }

    // Read leaf values only: the icon object is rebuilt on every row press, so depending on it would rebuild the
    // header (and the menu items array that spreads it) even when nothing visible changed.
    return [
        {
            text: formattedSelectedPaymentMethod.title,
            icon: formattedSelectedPaymentMethod.icon?.icon,
            iconHeight: formattedSelectedPaymentMethod.icon?.iconHeight ?? formattedSelectedPaymentMethod.icon?.iconSize,
            iconWidth: formattedSelectedPaymentMethod.icon?.iconWidth ?? formattedSelectedPaymentMethod.icon?.iconSize,
            iconStyles: formattedSelectedPaymentMethod.icon?.iconStyles,
            description: formattedSelectedPaymentMethod.description,
            wrapperStyle: [styles.mb4, styles.ph5, styles.pt3],
            interactive: false,
            displayInDefaultIconColor: true,
        },
    ];
}

export default useSelectedPaymentMethodMenuHeader;
