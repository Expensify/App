import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Illustrations from '@components/Icon/Illustrations';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function EmptySearchView() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <EmptyStateComponent
            SkeletonComponent={SearchRowSkeleton}
            headerMediaType="illustration"
            headerMedia={Illustrations.EmptyState}
            headerStyles={styles.emptyFolderBG}
            headerContentStyles={{width: 184, height: 112}}
            title={translate('search.searchResults.emptyResults.title')}
            subtitle={translate('search.searchResults.emptyResults.subtitle')}
        />
    );
}

EmptySearchView.displayName = 'EmptySearchView';

export default EmptySearchView;
