import type {SharedValue} from 'react-native-reanimated';
import type {MenuItemProps} from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import type {ToggleSettingOptionRowProps} from '@pages/workspace/workflows/ToggleSettingsOptionRow';

type MenuItemWithSubscribedSettings = Pick<MenuItem, 'type' | 'description' | 'title' | 'onPress' | 'shouldHide'> & {subscribedSettings?: string[]};

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

type AccordionItem = {
    /** Indicates the item type. Here, 'accordion' means that this is used to render an accordion section. */
    type: 'accordion';

    /** Child elements that are displayed inside the accordion. */
    children: MenuItemWithSubscribedSettings[];

    /** Determines whether the entire section should be hidden. */
    shouldHide: boolean;

    /** Controls whether the content of the accordion should be expanded. */
    shouldExpand: SharedValue<boolean>;
};

export type {MenuItem, ToggleItem, MenuItemWithSubscribedSettings, AccordionItem};
