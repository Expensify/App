import type {SharedValue} from 'react-native-reanimated';
import type {MenuItemProps} from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import type {ToggleSettingOptionRowProps} from '@pages/workspace/workflows/ToggleSettingsOptionRow';

type MenuItemWithSubscribedSettings = Pick<MenuItem, 'type' | 'description' | 'title' | 'onPress' | 'shouldHide'> & {subscribedSettings?: string[]};

type ToggleItemWithKey = ToggleItem & {key: string};

type ExtendedMenuItemWithSubscribedSettings = MenuItemToRender | ToggleItemWithKey | AccordionItem;

type MenuItemToRender = MenuItemWithSubscribedSettings & {
    /** Optional hint text passed to the MenuItemWithTopDescription */
    hintText?: string;
};

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
    /** Type of the item */
    type: 'accordion';

    /** Items nested inside the accordion */
    children: MenuItemToRender[];

    /** Whether the item should be hidden */
    shouldHide: boolean;

    /** Indicates if the accordion is expanded */
    shouldExpand: SharedValue<boolean>;

    /** Indicates if the accordion opening and closing should be animated */
    shouldAnimateSection: SharedValue<boolean>;
};

export type {MenuItem, ToggleItem, MenuItemWithSubscribedSettings, AccordionItem, ExtendedMenuItemWithSubscribedSettings, MenuItemToRender};
