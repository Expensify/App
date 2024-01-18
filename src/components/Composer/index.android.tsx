import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {TextInput} from 'react-native';
import {StyleSheet} from 'react-native';
import RNTextInput from '@components/RNTextInput';
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
    const textInput = useRef<TextInput | null>(null);

    const styles = useThemeStyles();
    const theme = useTheme();

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
            return 1000000;
        }
        return maxLines;
    }, [isComposerFullSize, maxLines]);

    const composerStyles = useMemo(() => StyleSheet.flatten(style), [style]);

    return (
        <RNTextInput
            autoComplete="off"
            placeholderTextColor={theme.placeholderText}
            ref={setTextInputRef}
            onContentSizeChange={(e) => ComposerUtils.updateNumberOfLines({maxLines, isComposerFullSize, isDisabled, setIsFullComposerAvailable}, e, styles)}
            rejectResponderTermination={false}
            // Setting a really high number here fixes an issue with the `maxNumberOfLines` prop on TextInput, where on Android the text input would collapse to only one line,
            // when it should actually expand to the container (https://github.com/Expensify/App/issues/11694#issuecomment-1560520670)
            // @Szymon20000 is working on fixing this (android-only) issue in the in the upstream PR (https://github.com/facebook/react-native/pulls?q=is%3Apr+is%3Aopen+maxNumberOfLines)
            // TODO: remove this comment once upstream PR is merged and available in a future release
            maxNumberOfLines={maxNumberOfLines}
            textAlignVertical="center"
            style={[composerStyles]}
            autoFocus={autoFocus}
            selection={selection}
            isFullComposerAvailable={isFullComposerAvailable}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
            readOnly={isDisabled}
        />
    );
}

Composer.displayName = 'Composer';

export default React.forwardRef(Composer);
