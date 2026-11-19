import Text from '@components/Text';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import CompactSearchBar from './CompactSearchBar';

type ListSearchBarProps = {
    /** Label describing the search input. Also used as its placeholder and accessibility label. */
    label: string;

    searchValue: string;

    onChangeText: (searchValue: string) => void;

    /** Whether to show and announce "No results found" below the input */
    shouldShowNoResultsFound: boolean;

    ref?: React.Ref<BaseTextInputRef>;
};

/**
 * The compact search input pinned above a filterable list, with the plain "No results found" text shown below it when nothing matches.
 */
function ListSearchBar({label, searchValue, onChangeText, shouldShowNoResultsFound, ref}: ListSearchBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const noResultsFoundText = translate('common.noResultsFound');

    useDebouncedAccessibilityAnnouncement(noResultsFoundText, shouldShowNoResultsFound, searchValue);

    return (
        <>
            <CompactSearchBar
                label={label}
                inputValue={searchValue}
                onChangeText={onChangeText}
                style={[styles.mb3, styles.mw100]}
                ref={ref}
            />
            {shouldShowNoResultsFound && (
                <View style={[styles.ph5, styles.pb5]}>
                    <Text
                        style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}
                        aria-hidden
                    >
                        {noResultsFoundText}
                    </Text>
                </View>
            )}
        </>
    );
}

export default ListSearchBar;
