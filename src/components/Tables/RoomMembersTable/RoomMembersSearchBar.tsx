import SearchBar from '@components/SearchBar';
import {useTableContext} from '@components/Table/TableContext';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';

import React, {useEffect, useLayoutEffect, useRef} from 'react';

type RoomMembersSearchBarProps = {
    /** Label and accessibility label for the search input. */
    label: string;
};

function RoomMembersSearchBar({label}: RoomMembersSearchBarProps) {
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);
    const inputRef = useRef<BaseTextInputRef>(null);
    const {
        activeSearchString,
        processedData,
        tableMethods: {updateSearchString},
    } = useTableContext();

    const hasActiveSearchString = activeSearchString.length > 0;

    useLayoutEffect(() => {
        if (!hasActiveSearchString || isTextInputFocused(inputRef)) {
            return;
        }

        inputRef.current?.focus?.();
    }, [hasActiveSearchString, processedData]);

    useEffect(() => {
        updateUserSearchPhrase(activeSearchString);
    }, [activeSearchString]);

    useEffect(() => {
        return () => updateSearchString('');
        // We only want the cleanup to run on unmount to reset the search state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SearchBar
            ref={inputRef}
            label={label}
            style={styles.mnw200}
            inputValue={activeSearchString}
            icon={activeSearchString.length === 0 ? expensifyIcons.MagnifyingGlass : undefined}
            onChangeText={(text) => updateSearchString(text)}
        />
    );
}

export default RoomMembersSearchBar;
