import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {TextInput} from 'react-native';
import {StyleSheet} from 'react-native';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import RNTextInput from '@components/RNTextInput';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ComposerUtils from '@libs/ComposerUtils';
import type {ComposerProps} from './types';

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
        // On native layers we like to have the Text Input not focused so the
        // user can read new chats without the keyboard in the way of the view.
        // On Android the selection prop is required on the TextInput but this prop has issues on IOS
        selection,
        ...props
    }: ComposerProps,
    ref: ForwardedRef<TextInput>,
) {
    const textInput = useRef<AnimatedTextInputRef | null>(null);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    /**
     * Set the TextInput Ref
     * @param {Element} el
     */
    const setTextInputRef = useCallback((el: AnimatedTextInputRef) => {
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

    const maxHeightStyle = useMemo(() => StyleUtils.getComposerMaxHeightStyle(maxLines, isComposerFullSize), [StyleUtils, isComposerFullSize, maxLines]);
    const composerStyle = useMemo(() => StyleSheet.flatten(style), [style]);

    return (
        <RNTextInput
            multiline
            autoComplete="off"
            placeholderTextColor={theme.placeholderText}
            ref={setTextInputRef}
            onContentSizeChange={(e) => ComposerUtils.updateNumberOfLines({maxLines, isComposerFullSize, isDisabled, setIsFullComposerAvailable}, e, styles)}
            rejectResponderTermination={false}
            smartInsertDelete={false}
            textAlignVertical="center"
            style={[composerStyle, maxHeightStyle]}
            autoFocus={autoFocus}
            isFullComposerAvailable={isFullComposerAvailable}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
            readOnly={isDisabled}
        />
    );
}

Composer.displayName = 'Composer';

export default React.forwardRef(Composer);
