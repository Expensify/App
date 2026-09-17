import type {MenuItemProps} from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import type {SelectorType} from '@components/SelectionScreen';

import type {SubPageProps} from '@hooks/useSubPage/types';

import type {ToggleSettingOptionRowProps} from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import type CONST from '@src/CONST';
import type {NetSuiteCustomFieldForm} from '@src/types/form';
import type {Policy} from '@src/types/onyx';
import type {NetSuiteCustomList, NetSuiteCustomSegment} from '@src/types/onyx/Policy';

import type {SharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';

type MenuItemWithSubscribedSettings = Pick<MenuItem, 'type' | 'description' | 'title' | 'onPress' | 'shouldHide' | 'hintText'> & {subscribedSettings?: string[]};

type MenuItemToRender = MenuItemWithSubscribedSettings & {
    /** Optional hint text passed to the MenuItemWithTopDescription */
    hintText?: string;
};

type ExtendedMenuItemWithSubscribedSettings = MenuItemToRender | ToggleItem | DividerLineItem | AccordionItem;

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

type DividerLineItem = {
    type: 'divider';
    key: string;
    shouldHide?: boolean;
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

type ExpenseRouteParams = {
    expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    policyID: string;
};

type CustomFieldSubPageWithPolicy = SubPageProps & {
    /** Current policy in the form steps */
    policy: Policy | undefined;

    /** Policy ID from the parent route's URL params (set before the policy Onyx record finishes hydrating) */
    policyIDParam?: string;

    /** Whether the page is a custom segment or custom list */
    importCustomField: ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;

    /** Whether the record is custom segment or custom record  */
    customSegmentType?: ValueOf<typeof CONST.NETSUITE_CUSTOM_RECORD_TYPES>;

    setCustomSegmentType?: (segmentType: ValueOf<typeof CONST.NETSUITE_CUSTOM_RECORD_TYPES>) => void;
    netSuiteCustomFieldFormValues: NetSuiteCustomFieldForm;
    customSegments?: NetSuiteCustomSegment[];

    customLists?: NetSuiteCustomList[];
};

type CustomListSelectorType = SelectorType & {
    id: string;
};

type CustomSubPageTokenInputProps = SubPageProps & {policyID: string | undefined};

export type {
    MenuItem,
    MenuItemToRender,
    DividerLineItem,
    ToggleItem,
    ExpenseRouteParams,
    CustomFieldSubPageWithPolicy,
    CustomListSelectorType,
    ExtendedMenuItemWithSubscribedSettings,
    CustomSubPageTokenInputProps,
};
