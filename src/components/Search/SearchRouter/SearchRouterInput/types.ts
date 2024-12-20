import type {ReactNode, RefObject} from 'react';
import type {StyleProp, TextInputProps, ViewStyle} from 'react-native';
import type {SelectionListHandle} from '@components/SelectionList/types';

type SearchRouterInputProps = {
    /** Value of TextInput */
    value: string;

    /** Callback to update search in SearchRouter */
    onSearchQueryChange: (searchTerm: string) => void;

    /** Callback invoked when the user submits the input */
    onSubmit?: () => void;

    /** SearchRouterList ref for managing TextInput and SearchRouterList focus */
    routerListRef?: RefObject<SelectionListHandle>;

    /** Whether the input is full width */
    isFullWidth: boolean;

    /** Whether the input is disabled */
    disabled?: boolean;

    /** Whether the offline message should be shown */
    shouldShowOfflineMessage?: boolean;

    /** Callback to call when the input gets focus */
    onFocus?: () => void;

    /** Callback to call when the input gets blur */
    onBlur?: () => void;

    /** Any additional styles to apply */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Any additional styles to apply when input is focused */
    wrapperFocusedStyle?: StyleProp<ViewStyle>;

    /** Any additional styles to apply to text input along with FormHelperMessage */
    outerWrapperStyle?: StyleProp<ViewStyle>;

    /** Component to be displayed on the right */
    rightComponent?: ReactNode;

    /** Whether the search reports API call is running  */
    isSearchingForReports?: boolean;
} & Pick<TextInputProps, 'caretHidden' | 'autoFocus' | 'selection'>;

export default SearchRouterInputProps;
