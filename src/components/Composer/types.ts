import type {NativeSyntheticEvent, StyleProp, TextInputProps, TextInputSelectionChangeEventData, TextStyle} from 'react-native';

type TextSelection = {
    start: number;
    end?: number;
};

type ComposerProps = TextInputProps & {
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

    /** Callback method handle when the input is changed  */
    onChangeText?: (numberOfLines: string) => void;

    /** Callback method to handle pasting a file */
    onPasteFile?: (file: File) => void;

    /** General styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    style?: StyleProp<TextStyle>;

    /** If the input should clear, it actually gets intercepted instead of .clear() */
    shouldClear?: boolean;

    /** When the input has cleared whoever owns this input should know about it */
    onClear?: () => void;

    /** Whether or not this TextInput is disabled. */
    isDisabled?: boolean;

    /** Set focus to this component the first time it renders.
  Override this in case you need to set focus on one field out of many, or when you want to disable autoFocus */
    autoFocus?: boolean;

    /** Update selection position on change */
    onSelectionChange?: (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;

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

    /** Whether this is the report action compose */
    isReportActionCompose?: boolean;

    /** Whether the sull composer is open */
    isComposerFullSize?: boolean;

    /** Should make the input only scroll inside the element avoid scroll out to parent */
    shouldContainScroll?: boolean;
};

export type {TextSelection, ComposerProps};
