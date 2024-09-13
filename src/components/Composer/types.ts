import type {NativeSyntheticEvent, StyleProp, TextInputProps, TextInputSelectionChangeEventData, TextStyle} from 'react-native';
import type {FileObject} from '@components/AttachmentModal';

type TextSelection = {
    start: number;
    end?: number;
    positionX?: number;
    positionY?: number;
};
type CustomSelectionChangeEvent = NativeSyntheticEvent<TextInputSelectionChangeEventData> & {
    positionX?: number;
    positionY?: number;
};

type ComposerProps = Omit<TextInputProps, 'onClear'> & {
    /** identify id in the text input */
    id?: string;

    /** Indicate whether input is multiline */
    multiline?: boolean;

    /** Maximum number of lines in the text input */
    maxLines?: number;

    /** The default value of the comment box */
    defaultValue?: string;

    /** The value of the comment box */
    value?: string;

    /**
     * Callback when the input was cleared using the .clear ref method.
     * The text parameter will be the value of the text that was cleared.
     */
    onClear?: (text: string) => void;

    /** Callback method handle when the input is changed  */
    onChangeText?: (numberOfLines: string) => void;

    /** Callback method to handle pasting a file */
    onPasteFile?: (file: FileObject) => void;

    /** General styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    style?: StyleProp<TextStyle>;

    /** Whether or not this TextInput is disabled. */
    isDisabled?: boolean;

    /** Set focus to this component the first time it renders.
  Override this in case you need to set focus on one field out of many, or when you want to disable autoFocus */
    autoFocus?: boolean;

    /** Update selection position on change */
    onSelectionChange?: (event: CustomSelectionChangeEvent) => void;

    /** Selection Object */
    selection?: TextSelection;

    /** Whether the full composer can be opened */
    isFullComposerAvailable?: boolean;

    /** Allow the full composer to be opened */
    setIsFullComposerAvailable?: (value: boolean) => void;

    /** Should we calculate the caret position */
    shouldCalculateCaretPosition?: boolean;

    /** Function to check whether composer is covered up or not */
    checkComposerVisibility?: () => boolean;

    /** Whether the sull composer is open */
    isComposerFullSize?: boolean;

    /** Should make the input only scroll inside the element avoid scroll out to parent */
    shouldContainScroll?: boolean;

    /** Indicates whether the composer is in a group policy report. Used for disabling report mentioning style in markdown input */
    isGroupPolicyReport?: boolean;

    showSoftInputOnFocus?: boolean;
};

export type {TextSelection, ComposerProps, CustomSelectionChangeEvent};
