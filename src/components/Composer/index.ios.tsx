import React, {ForwardedRef, useCallback, useEffect, useMemo, useRef} from 'react';
import {StyleSheet, TextInput} from 'react-native';
import RNTextInput from '@components/RNTextInput';
import * as ComposerUtils from '@libs/ComposerUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import {ComposerProps} from './types';

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
    const textInput = useRef<TextInput>();

    const styles = useThemeStyles();
    const themeColors = useTheme();

    /**
     * Set the TextInput Ref
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

export default React.forwardRef(Composer);
