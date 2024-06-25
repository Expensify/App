import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import LottieAnimations from '@components/LottieAnimations';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function EmptySearchView() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <EmptyStateComponent
            SkeletonComponent={SearchRowSkeleton}
            headerMediaType="animation"
            headerMedia={LottieAnimations.Coin}
            headerStyles={styles.activeComponentBG}
            title={translate('search.searchResults.emptyResults.title')}
            subtitle={translate('search.searchResults.emptyResults.subtitle')}
        />
    );
}

EmptySearchView.displayName = 'EmptySearchView';

export default EmptySearchView;
