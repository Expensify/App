import React, {ForwardedRef, useCallback, useEffect, useMemo, useRef} from 'react';
import {StyleProp, StyleSheet, TextInput, TextStyle} from 'react-native';
import RNTextInput from '@components/RNTextInput';
import * as ComposerUtils from '@libs/ComposerUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';

type ComposerProps = {
    /** If the input should clear, it actually gets intercepted instead of .clear() */
    shouldClear?: boolean;

    /** When the input has cleared whoever owns this input should know about it */
    onClear?: () => void;

    /** Set focus to this component the first time it renders.
     * Override this in case you need to set focus on one field out of many, or when you want to disable autoFocus */
    autoFocus?: boolean;

    /** Prevent edits and interactions like focus for this input. */
    isDisabled?: boolean;

    /** Selection Object */
    selection?: {
        start: number;
        end?: number;
    };

    /** Whether the full composer can be opened */
    isFullComposerAvailable?: boolean;

    /** Maximum number of lines in the text input */
    maxLines?: number;

    /** Allow the full composer to be opened */
    setIsFullComposerAvailable?: () => void;

    /** Whether the composer is full size */
    isComposerFullSize?: boolean;

    /** General styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    style: StyleProp<TextStyle>;
};

function Composer(
    {
        shouldClear = false,
        onClear = () => {},
        isDisabled = false,
        maxLines,
        isComposerFullSize = false,
        setIsFullComposerAvailable = () => {},
        autoFocus = false,
        isFullComposerAvailable = false,
        style,
        ...props
    }: ComposerProps,
    ref: ForwardedRef<TextInput>,
) {
    // const textInput = useRef<React.Component<AnimatedProps<TextInputProps>>>();
    const textInput = useRef<TextInput>();

    const styles = useThemeStyles();
    const themeColors = useTheme();

    /**
     * Set the TextInput Ref
     * @param {Element} el
     */
    const setTextInputRef = useCallback((el: TextInput) => {
        textInput.current = el;
        if (typeof ref !== 'function' || textInput.current === null) {
            return;
        }

        // This callback prop is used by the parent component using the constructor to
        // get a ref to the inner textInput element e.g. if we do
        // <constructor ref={el => this.textInput = el} /> this will not
        // return a ref to the component, but rather the HTML element by default
        ref(textInput.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!shouldClear) {
            return;
        }
        textInput.current?.clear();
        onClear();
    }, [shouldClear, onClear]);

    /**
     * Set maximum number of lines
     * @return {Number}
     */
    const maxNumberOfLines = useMemo(() => {
        if (isComposerFullSize) {
            return;
        }
        return maxLines;
    }, [isComposerFullSize, maxLines]);

    const composerStyles = useMemo(() => StyleSheet.flatten(style), [style]);

    // On native layers we like to have the Text Input not focused so the
    // user can read new chats without the keyboard in the way of the view.
    // On Android the selection prop is required on the TextInput but this prop has issues on IOS
    const {selection, ...propsToPass} = props;

    return (
        <RNTextInput
            autoComplete="off"
            placeholderTextColor={themeColors.placeholderText}
            ref={setTextInputRef}
            onContentSizeChange={(e) => ComposerUtils.updateNumberOfLines({maxLines, isComposerFullSize, isDisabled, setIsFullComposerAvailable}, e)}
            rejectResponderTermination={false}
            smartInsertDelete={false}
            style={[composerStyles, styles.verticalAlignMiddle]}
            maxNumberOfLines={maxNumberOfLines}
            readOnly={isDisabled}
            autoFocus={autoFocus}
            isFullComposerAvailable={isFullComposerAvailable}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...propsToPass}
        />
    );
}

Composer.displayName = 'Composer';

const ComposerWithRef = React.forwardRef(Composer);

export default ComposerWithRef;
