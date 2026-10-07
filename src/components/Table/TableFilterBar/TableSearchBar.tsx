import {useTableContext} from '@components/Table/TableContext';
import TextInput from '@components/TextInput';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getShouldSuppressBackgroundInputFocus, subscribeToShouldSuppressBackgroundInputFocus} from '@libs/ModalFocusManager';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore} from 'react';

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
    const shouldSuppressPopoverFocus = useSyncExternalStore(subscribeToShouldSuppressBackgroundInputFocus, getShouldSuppressBackgroundInputFocus, getShouldSuppressBackgroundInputFocus);
    const wasSuppressingPopoverFocus = usePrevious(shouldSuppressPopoverFocus);

    const {
        activeSearchString,
        isEmptyResult,
        listRef,
        shouldUseNarrowTableLayout,
        scrollInputIntoView,
        onSearchStringChange,
        tableMethods: {updateSearchString},
    } = useTableContext();

    const hasActiveSearchString = activeSearchString.length > 0;

    useLayoutEffect(() => {
        if (!hasActiveSearchString || shouldSuppressPopoverFocus || wasSuppressingPopoverFocus || isTextInputFocused(inputRef)) {
            return;
        }

        inputRef.current?.focus?.();
    }, [hasActiveSearchString, shouldSuppressPopoverFocus, wasSuppressingPopoverFocus]);

    useLayoutEffect(() => {
        if (!wasSuppressingPopoverFocus || shouldSuppressPopoverFocus) {
            return;
        }

        inputRef.current?.blur?.();
    }, [shouldSuppressPopoverFocus, wasSuppressingPopoverFocus]);

    useEffect(() => {
        return () => updateSearchString('');
        // We only want the cleanup to run on unmount to reset the search state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isEmptyResult || !isTextInputFocused(inputRef)) {
            return;
        }

        // Filtering to zero rows collapses the list below the persistent page header. Reset the
        // old row offset so the focused input stays in the viewport while the keyboard remains open.
        listRef.current?.scrollToOffset({offset: 0, animated: false});
    }, [isEmptyResult, listRef]);

    const handleSearchStringChange = (text: string) => {
        updateSearchString(text);
        onSearchStringChange?.(text);
    };

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
            editable={!shouldSuppressPopoverFocus}
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
            onChangeText={handleSearchStringChange}
        />
    );
}

export default TableSearchBar;
