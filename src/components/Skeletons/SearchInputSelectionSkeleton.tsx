import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function SearchInputSelectionSkeleton() {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.searchRouterTextInputContainer, styles.searchAutocompleteInputResults, styles.br2, styles.justifyContentCenter]}>
            <SkeletonViewContentLoader
                height={variables.searchAutocompleteInputSkeletonHeight}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                style={[styles.ml1]}
            >
                <Rect
                    x="0"
                    y="0"
                    width={variables.searchAutocompleteInputSkeletonWidth}
                    height={variables.searchAutocompleteInputSkeletonHeight}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default SearchInputSelectionSkeleton;
