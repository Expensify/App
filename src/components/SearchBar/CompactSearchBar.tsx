import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {SharedSearchBarProps} from './BaseSearchBar';

import BaseSearchBar from './BaseSearchBar';

type CompactSearchBarProps = SharedSearchBarProps;

/**
 * The compact list-style search input (placeholder instead of a floating label), matching the one used above selection lists.
 */
function CompactSearchBar({ref, label, style, inputValue, onChangeText, onSubmitEditing, shouldShowEmptyState, emptyStateContainerStyle}: CompactSearchBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    // The compact search input is sized by the physical device width (`isSmallScreenWidth`), not `shouldUseNarrowLayout`, so
    // it stays compact when rendered inside an RHP/narrow pane on web/desktop and only grows to the tall size on mobile.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

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
                placeholder: label,
                placeholderTextColor: theme.textSupporting,
                touchableInputWrapperStyle: isSmallScreenWidth ? styles.listSearchInputNarrowWrapper : styles.listSearchInputWideWrapper,
                textInputContainerStyles: [styles.pb0, isSmallScreenWidth ? styles.ph3 : styles.ph2],
                inputStyle: [styles.w100, styles.lineHeightUndefined, isSmallScreenWidth ? undefined : styles.fontSizeLabel],
            }}
        />
    );
}

export default CompactSearchBar;
