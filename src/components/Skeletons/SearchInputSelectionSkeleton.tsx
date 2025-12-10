import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';

function SearchInputSelectionSkeleton() {
    const theme = useTheme();
    const styles = useThemeStyles();
    useSkeletonSpan('SearchInputSelectionSkeleton');

    return (
        <View style={[styles.searchRouterTextInputContainer, styles.searchAutocompleteInputResults, styles.br2, styles.justifyContentCenter]}>
            <SkeletonViewContentLoader
                height={variables.searchAutocompleteInputSkeletonHeight}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                style={[styles.ml1]}
            >
                <Rect
                    width={variables.searchAutocompleteInputSkeletonWidth}
                    height={variables.searchAutocompleteInputSkeletonHeight}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default SearchInputSelectionSkeleton;
