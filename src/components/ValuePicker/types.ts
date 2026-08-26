import type {ListItem} from '@components/SelectionList/types';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {ForwardedRef, ReactNode} from 'react';
import type {StyleProp, TextStyle, View} from 'react-native';

type ValuePickerListItem = ListItem & {
    value?: string;
};

type ValuePickerItem = {
    label?: string;
    value?: string;
    description?: string;
    isDisabled?: boolean | null;

    /** Custom node rendered in place of the description (e.g. a description containing an inline link) */
    alternateTextComponent?: ReactNode;

    /** Element to show on the right side of the item */
    rightElement?: ReactNode;

    /** Whether to hide the selection button (radio) entirely */
    shouldHideSelectionButton?: boolean;

    /** Styles applied to the item title */
    titleStyles?: StyleProp<TextStyle>;
};

type ValueSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Items to pick from */
    items?: ValuePickerItem[];

    /** The selected item */
    selectedItem?: ValuePickerItem;

    /** Label for values */
    label?: string;

    /** Function to call when the user selects a item */
    onItemSelected?: (item: ValuePickerListItem) => void;

    /** Function to call when the user closes the modal */
    onClose?: () => void;

    /** Function to call when the user presses on the modal backdrop */
    onBackdropPress?: () => void;

    /** Whether to show the tooltip text */
    shouldShowTooltips?: boolean;

    /** Flag to indicate if the keyboard avoiding view should be enabled */
    shouldEnableKeyboardAvoidingView?: boolean;

    /** Whether to add bottom safe area padding */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to disable keyboard shortcuts */
    disableKeyboardShortcuts?: boolean;

    /** Number of lines to show for alternate text */
    alternateNumberOfSupportedLines?: number;
};

type ValueSelectionListProps = Pick<
    ValueSelectorModalProps,
    'items' | 'selectedItem' | 'onItemSelected' | 'shouldShowTooltips' | 'addBottomSafeAreaPadding' | 'disableKeyboardShortcuts' | 'alternateNumberOfSupportedLines'
> & {
    /** Whether the parent modal is visible */
    isVisible?: boolean;
};

/** Config handed to the parent step so it can render the value selection list inline within the same centered modal. */
type InlineValuePickerConfig = Pick<ValueSelectorModalProps, 'label' | 'items' | 'selectedItem' | 'onItemSelected' | 'shouldShowTooltips'>;

type ValuePickerProps = ForwardedFSClassProps & {
    /** Item to display */
    value?: string;

    /** Label of picker */
    label?: string;

    /** Items to pick from */
    items?: ValuePickerItem[];

    /** A placeholder value to display */
    placeholder?: string;

    /** Form Error description */
    errorText?: string;

    /** Callback to call when the input changes */
    onInputChange?: (value: string | undefined) => void;

    /** Callback to call when the picker begins to open */
    onOpen?: () => void;

    /** Text to display under the main menu item */
    furtherDetails?: string;

    /** Whether to show the tooltip text */
    shouldShowTooltips?: boolean;

    /** Whether to show the selector modal */
    shouldShowModal?: boolean;

    /** Reference to the outer element */
    ref: ForwardedRef<View>;

    /** Whether to add bottom safe area padding */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to disable keyboard shortcuts */
    disableKeyboardShortcuts?: boolean;

    /** Number of lines to show for alternate text */
    alternateNumberOfSupportedLines?: number;

    /** When provided (centered RHP modal), tapping the row asks the parent step to render the selection list inline instead of opening a separate modal. */
    onRequestOpenInline?: (config: InlineValuePickerConfig) => void;
};

export type {ValuePickerItem, ValueSelectorModalProps, ValuePickerProps, ValueSelectionListProps, InlineValuePickerConfig};
