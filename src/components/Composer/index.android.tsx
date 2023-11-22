import React, {ForwardedRef, useCallback, useEffect, useMemo, useRef} from 'react';
import {StyleProp, StyleSheet, TextInput, TextStyle} from 'react-native';
import RNTextInput from '@components/RNTextInput';
import * as ComposerUtils from '@libs/ComposerUtils';
import themeColors from '@styles/themes/default';

type ComposerProps = {
    /** Maximum number of lines in the text input */
    maxLines: number;

    /** If the input should clear, it actually gets intercepted instead of .clear() */
    shouldClear: boolean;

    /** When the input has cleared whoever owns this input should know about it */
    onClear: () => void;

    /** Set focus to this component the first time it renders.
     * Override this in case you need to set focus on one field out of many, or when you want to disable autoFocus */
    autoFocus: boolean;

    /** Prevent edits and interactions like focus for this input. */
    isDisabled: boolean;

    /** Selection Object */
    selection: {
        start: number;
        end?: number;
    };

    /** Whether the full composer can be opened */
    isFullComposerAvailable: boolean;

    /** Allow the full composer to be opened */
    setIsFullComposerAvailable: () => void;

    /** Whether the composer is full size */
    isComposerFullSize: boolean;

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
        style,
        autoFocus = false,
        selection = {
            start: 0,
            end: 0,
        },
        isFullComposerAvailable = false,
        ...props
    }: ComposerProps,
    ref: ForwardedRef<TextInput>,
) {
    const textInput = useRef<TextInput>();

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
            return 1000000;
        }
        return maxLines;
    }, [isComposerFullSize, maxLines]);

    const composerStyles = useMemo(() => StyleSheet.flatten(style), [style]);

    return (
        <RNTextInput
            autoComplete="off"
            placeholderTextColor={themeColors.placeholderText}
            ref={setTextInputRef}
            onContentSizeChange={(e) => ComposerUtils.updateNumberOfLines({maxLines, isComposerFullSize, isDisabled, setIsFullComposerAvailable}, e)}
            rejectResponderTermination={false}
            // Setting a really high number here fixes an issue with the `maxNumberOfLines` prop on TextInput, where on Android the text input would collapse to only one line,
            // when it should actually expand to the container (https://github.com/Expensify/App/issues/11694#issuecomment-1560520670)
            // @Szymon20000 is working on fixing this (android-only) issue in the in the upstream PR (https://github.com/facebook/react-native/pulls?q=is%3Apr+is%3Aopen+maxNumberOfLines)
            // TODO: remove this comment once upstream PR is merged and available in a future release
            maxNumberOfLines={maxNumberOfLines}
            textAlignVertical="center"
            style={[composerStyles]}
            readOnly={isDisabled}
            autoFocus={autoFocus}
            selection={selection}
            isFullComposerAvailable={isFullComposerAvailable}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
        />
    );
}

Composer.displayName = 'ComposerWithRef';

const ComposerWithRef = React.forwardRef(Composer);

export default ComposerWithRef;
