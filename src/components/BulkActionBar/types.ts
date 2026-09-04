import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import type {RefObject} from 'react';
import type {GestureResponderEvent, StyleProp, View, ViewStyle} from 'react-native';

type BulkActionBarProps<TValueType> = {
    /** How many rows the selection covers. Rendered as the bar's leading "N selected" label. */
    selectedCount: number;

    /**
     * The actions the selection supports, in priority order. The first `CONST.BULK_ACTION_BAR.MAX_INLINE_ACTIONS` are
     * rendered as buttons in the bar and the rest are moved into the bar's "More" menu.
     */
    options: Array<DropdownOption<TValueType>>;

    /**
     * Whether `selectedCount` is still being resolved — a "select all matching" selection only learns its real size
     * once the server reports it. The bar shows a spinner in place of the count while this is true, rather than a
     * number that is about to change.
     */
    isSelectedCountLoading?: boolean;

    /** Called when the bar's close button is pressed. Expected to clear the selection, which unmounts the bar. */
    onClearSelection: () => void;

    /**
     * Called when an item inside an action's sub-menu, or inside the "More" menu, is selected. Mirrors the callback of
     * the same name on `ButtonWithDropdownMenu`, which callers such as Search's bulk pay flow already rely on.
     */
    onSubItemSelected?: (item: PopoverMenuItem, index: number, event?: GestureResponderEvent | KeyboardEvent) => void;

    /**
     * Anchor for popovers a caller opens against the bar, such as the KYC wall Search puts behind its pay action.
     * Attached to the bar itself, since which button opened the flow is not something the bar exposes.
     */
    barRef?: RefObject<View | null>;

    /**
     * Extra styles for the absolutely positioned layer the bar floats in. Pass a `bottom` here to lift the bar above
     * content pinned to the bottom of the same container, such as a totals footer.
     */
    style?: StyleProp<ViewStyle>;
};

type BulkActionBarButtonProps<TValueType> = Pick<BulkActionBarProps<TValueType>, 'onSubItemSelected'> & {
    /** The action this button performs. Rendered with a dropdown caret when it carries `subMenuItems`. */
    option: DropdownOption<TValueType>;
};

export type {BulkActionBarProps, BulkActionBarButtonProps};
