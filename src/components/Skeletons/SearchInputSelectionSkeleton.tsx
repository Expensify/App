import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

function SearchInputSelectionSkeleton() {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.searchRouterTextInputContainer, styles.searchAutocompleteInputResults, styles.searchInputSkeleton]}>
            <SkeletonViewContentLoader
                height={variables.searchAutocompleteInputSkeletonHeight}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                style={[styles.ml1]}
            >
                <SkeletonRect
                    width={variables.searchAutocompleteInputSkeletonWidth}
                    height={variables.searchAutocompleteInputSkeletonHeight}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default SearchInputSelectionSkeleton;
