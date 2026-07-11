import {useTableContext} from '@components/Table/TableContext';
import TextInput from '@components/TextInput';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';

/**
 * Renders a search input that filters table data.
 */
type TableSearchBarProps = {
    /** Label and accessibility label for the search input. */
    label: string;
};

function TableSearchBar({label}: TableSearchBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const inputRef = useRef<BaseTextInputRef>(null);
    const [inputFocused, setInputFocused] = useState(false);

    const {
        activeSearchString,
        shouldUseNarrowTableLayout,
        scrollInputIntoView,
        tableMethods: {updateSearchString},
    } = useTableContext();

    const hasActiveSearchString = activeSearchString.length > 0;

    useLayoutEffect(() => {
        if (!hasActiveSearchString || isTextInputFocused(inputRef)) {
            return;
        }

        inputRef.current?.focus?.();
    }, [hasActiveSearchString]);

    useEffect(() => {
        return () => updateSearchString('');
        // We only want the cleanup to run on unmount to reset the search state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const containerStyles = shouldUseNarrowTableLayout && styles.flex1;

    const touchableInputWrapperStyle = [styles.mnw200, !shouldUseNarrowTableLayout ? styles.h8 : styles.h11];

    const textInputContainerStyles = [styles.border, styles.borderRadiusComponentNormal, styles.appBG, styles.p2, inputFocused && styles.borderColorFocus];

    return (
        <TextInput
            ref={inputRef}
            hideFocusedState
            multiline={false}
            spellCheck={false}
            autoCorrect={false}
            placeholder={label}
            value={activeSearchString}
            role={CONST.ROLE.SEARCHBOX}
            inputMode={CONST.INPUT_MODE.TEXT}
            placeholderTextColor={theme.textSupporting}
            inputStyle={styles.textLabel}
            containerStyles={containerStyles}
            textInputContainerStyles={textInputContainerStyles}
            touchableInputWrapperStyle={touchableInputWrapperStyle}
            accessibilityLabel={label}
            shouldHideClearButton={false}
            clearButtonStyle={shouldUseNarrowTableLayout ? undefined : styles.mr0}
            clearButtonIconSize={shouldUseNarrowTableLayout ? undefined : variables.iconSizeSmall}
            onBlur={() => setInputFocused(false)}
            onFocus={() => {
                setInputFocused(true);
                // Keep the input visible above the keyboard when it is focused inside the scrolling table list.
                scrollInputIntoView(inputRef.current);
            }}
            onChangeText={(text) => updateSearchString(text)}
        />
    );
}

export default TableSearchBar;
