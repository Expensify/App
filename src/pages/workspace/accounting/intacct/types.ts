import type {MenuItemProps} from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';

import type {ToggleSettingOptionRowProps} from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import type {SharedValue} from 'react-native-reanimated';

type MenuItemWithSubscribedSettings = Pick<MenuItem, 'type' | 'description' | 'title' | 'onPress' | 'shouldHide'> & {subscribedSettings?: string[]};

type ToggleItemWithKey = ToggleItem & {key: string};

type ExtendedMenuItemWithSubscribedSettings = MenuItemToRender | ToggleItemWithKey | AccordionItem;

type MenuItemToRender = MenuItemWithSubscribedSettings & {
    /** Optional hint text passed to the MenuItemWithTopDescription */
    hintText?: string;

    /** Optional muted helper text rendered below the MenuItemWithTopDescription */
    helperText?: string;

    /** Optional error message to surface via OfflineWithFeedback */
    errors?: OfflineWithFeedbackProps['errors'];

    /** Optional callback to clear the surfaced error */
    onCloseError?: OfflineWithFeedbackProps['onClose'];
};

type MenuItem = MenuItemProps & {
    type: 'menuitem';

    /** The type of action that's pending  */
    pendingAction: OfflineWithFeedbackProps['pendingAction'];

    shouldHide?: boolean;

    /** Any error message to show */
    errors: OfflineWithFeedbackProps['errors'];

    /** Callback to close the error messages */
    onCloseError: OfflineWithFeedbackProps['onClose'];
};

type ToggleItem = ToggleSettingOptionRowProps & {
    type: 'toggle';
    shouldHide?: boolean;
};

type AccordionItem = {
    type: 'accordion';

    /** Items nested inside the accordion */
    children: MenuItemToRender[];

    shouldHide: boolean;

    /** Indicates if the accordion is expanded */
    shouldExpand: SharedValue<boolean>;

    /** Indicates if the accordion opening and closing should be animated */
    shouldAnimateSection: SharedValue<boolean>;
};

export type {ExtendedMenuItemWithSubscribedSettings, MenuItemToRender};
