import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Illustrations from '@components/Icon/Illustrations';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function EmptySearchView() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <EmptyStateComponent
            SkeletonComponent={SearchRowSkeleton}
            headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
            headerMedia={Illustrations.EmptyState}
            headerStyles={styles.emptyFolderBG}
            headerContentStyles={styles.emptyStateFolderIconSize}
            title={translate('search.searchResults.emptyResults.title')}
            subtitle={translate('search.searchResults.emptyResults.subtitle')}
        />
    );
}

EmptySearchView.displayName = 'EmptySearchView';

export default EmptySearchView;
