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
    const clearScrollFrameRef = useRef<number | null>(null);
    const inputFocusedRef = useRef(false);
    const [inputFocused, setInputFocused] = useState(false);
    const shouldSuppressPopoverFocus = useSyncExternalStore(subscribeToShouldSuppressBackgroundInputFocus, getShouldSuppressBackgroundInputFocus, getShouldSuppressBackgroundInputFocus);
    const wasSuppressingPopoverFocus = usePrevious(shouldSuppressPopoverFocus);

    const {
        activeSearchString,
        hasSearchString,
        isEmptyResult,
        listRef,
        searchInputUpdate,
        shouldUseNarrowTableLayout,
        scrollInputIntoView,
        tableListMetadata,
        onSearchStringChange,
        searchInputActions: {updateSearchStringFromInput, getNextSearchInputSequence, getLatestSearchEffectiveQuery},
    } = useTableContext();

    const previousCommittedSearchStringRef = useRef(activeSearchString);
    const [inputState, setInputState] = useState({value: activeSearchString, searchString: activeSearchString, revision: searchInputUpdate.revision, sequence: 0});
    if (inputState.searchString !== activeSearchString || inputState.revision !== searchInputUpdate.revision) {
        const localEffectiveQuery = inputState.value.trim();
        const isLocalInputLatest = inputState.sequence > searchInputUpdate.sequence;
        const isMatchingInputCommit = searchInputUpdate.source === 'input' && inputState.sequence === searchInputUpdate.sequence && localEffectiveQuery.length > 0;
        const shouldPreserveLocalValue = localEffectiveQuery === activeSearchString.trim() && (isLocalInputLatest || isMatchingInputCommit);
        setInputState({
            value: shouldPreserveLocalValue ? inputState.value : activeSearchString,
            searchString: activeSearchString,
            revision: searchInputUpdate.revision,
            sequence: inputState.sequence,
        });
    }
    const hasActiveSearchString = activeSearchString.length > 0;
    const previouslyHadSearchString = usePrevious(hasSearchString);

    useLayoutEffect(() => {
        if (!hasActiveSearchString || shouldSuppressPopoverFocus || wasSuppressingPopoverFocus || isTextInputFocused(inputRef)) {
            return;
        }

        inputFocusedRef.current = true;
        inputRef.current?.focus?.();
    }, [hasActiveSearchString, shouldSuppressPopoverFocus, wasSuppressingPopoverFocus]);

    useLayoutEffect(() => {
        if (!wasSuppressingPopoverFocus || shouldSuppressPopoverFocus) {
            return;
        }

        inputFocusedRef.current = false;
        inputRef.current?.blur?.();
    }, [shouldSuppressPopoverFocus, wasSuppressingPopoverFocus]);

    useLayoutEffect(() => {
        const previousCommittedSearchString = previousCommittedSearchStringRef.current;
        previousCommittedSearchStringRef.current = activeSearchString;
        const hadOrHasEffectiveSearch = previousCommittedSearchString.trim().length > 0 || activeSearchString.trim().length > 0;
        const isInputFocused = inputFocusedRef.current || !!isTextInputFocused(inputRef);

        if (searchInputUpdate.source === 'imperative' && hadOrHasEffectiveSearch && isInputFocused) {
            // Imperative search updates bypass the input change handler. Correct their retained offset
            // before paint so a restored, focused search cannot remain outside the viewport.
            listRef.current?.scrollToOffset({offset: 0, animated: false});
        }
    }, [activeSearchString, listRef, searchInputUpdate.revision, searchInputUpdate.source]);

    useEffect(() => {
        return () => updateSearchStringFromInput('', getNextSearchInputSequence());
        // We only want the cleanup to run on unmount to reset the search state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(
        () => () => {
            if (clearScrollFrameRef.current === null) {
                return;
            }
            cancelAnimationFrame(clearScrollFrameRef.current);
        },
        [],
    );

    useEffect(() => {
        if (!isEmptyResult || !isTextInputFocused(inputRef)) {
            return;
        }

        // Filtering to zero rows collapses the list below the persistent page header. Reset the
        // old row offset so the focused input stays in the viewport while the keyboard remains open.
        listRef.current?.scrollToOffset({offset: 0, animated: false});
    }, [isEmptyResult, listRef]);

    useEffect(() => {
        const isClearTransition = previouslyHadSearchString === true && !hasSearchString;
        if (!isClearTransition || isEmptyResult || !isTextInputFocused(inputRef)) {
            return;
        }

        // Clearing expands the filtered data again. Wait until the new list layout is committed so
        // browser scroll anchoring cannot leave the page header at a residual offset.
        clearScrollFrameRef.current = requestAnimationFrame(() => {
            clearScrollFrameRef.current = null;
            listRef.current?.scrollToOffset({offset: 0, animated: false});
        });
    }, [hasSearchString, isEmptyResult, listRef, previouslyHadSearchString]);

    const handleSearchStringChange = (text: string) => {
        const inputSequence = getNextSearchInputSequence();
        const previousEffectiveQuery = getLatestSearchEffectiveQuery();
        const nextEffectiveQuery = text.trim();
        const shouldUpdateSearch = previousEffectiveQuery !== nextEffectiveQuery;
        const shouldResetBeforeCommit =
            !!isTextInputFocused(inputRef) && (previousEffectiveQuery.length > 0 || nextEffectiveQuery.length > 0) && (shouldUpdateSearch || tableListMetadata.hasPageHeader);

        if (clearScrollFrameRef.current !== null) {
            cancelAnimationFrame(clearScrollFrameRef.current);
            clearScrollFrameRef.current = null;
        }

        if (shouldResetBeforeCommit) {
            // Move the focused search into view before React commits the new controlled value or
            // filtered data. This prevents the browser and FlashList from competing over a stale
            // deep offset after the update, while preserving input identity and focus.
            listRef.current?.scrollToOffset({offset: 0, animated: false});
        }

        setInputState((currentInputState) => ({...currentInputState, value: text, sequence: inputSequence}));
        if (shouldUpdateSearch) {
            const committedSearchString = nextEffectiveQuery.length === 0 ? '' : text;
            updateSearchStringFromInput(committedSearchString, inputSequence);
        }
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
            value={inputState.value}
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
            onBlur={() => {
                inputFocusedRef.current = false;
                setInputFocused(false);
            }}
            onFocus={() => {
                inputFocusedRef.current = true;
                setInputFocused(true);
                // Keep the input visible above the keyboard when it is focused inside the scrolling table list.
                scrollInputIntoView(inputRef.current);
            }}
            onChangeText={handleSearchStringChange}
        />
    );
}

export default TableSearchBar;
