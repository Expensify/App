import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';

import type {SharedSearchBarProps} from './BaseSearchBar';

import BaseSearchBar from './BaseSearchBar';

type SearchBarProps = SharedSearchBarProps & {
    /** Icon shown inside the input while it is empty. Defaults to the magnifying glass. */
    icon?: IconAsset;

    /** Whether to show the icon while the input is empty */
    shouldShowIcon?: boolean;
};

function SearchBar({ref, label, style, icon, shouldShowIcon = true, inputValue, onChangeText, onSubmitEditing, shouldShowEmptyState, emptyStateContainerStyle}: SearchBarProps) {
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);

    return (
        <BaseSearchBar
            ref={ref}
            label={label}
            style={style}
            inputValue={inputValue}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
            shouldShowEmptyState={shouldShowEmptyState}
            emptyStateContainerStyle={emptyStateContainerStyle}
            textInputProps={{
                label,
                icon: inputValue?.length || !shouldShowIcon ? undefined : (icon ?? expensifyIcons.MagnifyingGlass),
                iconContainerStyle: styles.p0,
            }}
        />
    );
}

export default SearchBar;
