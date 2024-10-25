import type {MenuItemProps} from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import type {ToggleSettingOptionRowProps} from '@pages/workspace/workflows/ToggleSettingsOptionRow';

type MenuItem = MenuItemProps & {
    /** Type of the item */
    type: 'menuitem';

    /** The type of action that's pending  */
    pendingAction: OfflineWithFeedbackProps['pendingAction'];

    /** Whether the item should be hidden */
    shouldHide?: boolean;

    /** Any error message to show */
    errors: OfflineWithFeedbackProps['errors'];

    /** Callback to close the error messages */
    onCloseError: OfflineWithFeedbackProps['onClose'];
};

type ToggleItem = ToggleSettingOptionRowProps & {
    /** Type of the item */
    type: 'toggle';

    /** Whether the item should be hidden */
    shouldHide?: boolean;
};

export type {MenuItem, ToggleItem};
