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

    rightElement?: ReactNode;

    /** Whether to hide the selection button (radio) entirely */
    shouldHideSelectionButton?: boolean;

    titleStyles?: StyleProp<TextStyle>;
};

type ValueSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    items?: ValuePickerItem[];
    selectedItem?: ValuePickerItem;
    label?: string;
    onItemSelected?: (item: ValuePickerListItem) => void;

    /** Function to call when the user closes the modal */
    onClose?: () => void;

    /** Function to call when the user presses on the modal backdrop */
    onBackdropPress?: () => void;

    /** Whether to show the tooltip text */
    shouldShowTooltips?: boolean;

    shouldEnableKeyboardAvoidingView?: boolean;
    addBottomSafeAreaPadding?: boolean;
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

type ValuePickerProps = ForwardedFSClassProps & {
    value?: string;
    label?: string;
    items?: ValuePickerItem[];
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

    ref: ForwardedRef<View>;
    addBottomSafeAreaPadding?: boolean;
    disableKeyboardShortcuts?: boolean;

    /** Number of lines to show for alternate text */
    alternateNumberOfSupportedLines?: number;
};

export type {ValuePickerItem, ValueSelectorModalProps, ValuePickerProps, ValueSelectionListProps};
