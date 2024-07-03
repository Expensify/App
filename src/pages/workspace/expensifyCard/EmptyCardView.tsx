import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Illustrations from '@components/Icon/Illustrations';
import CardRowSkeleton from '@components/Skeletons/CardRowSkeleton';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function EmptyCardView() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <EmptyStateComponent
            SkeletonComponent={CardRowSkeleton}
            headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
            headerMedia={Illustrations.EmptyState}
            headerStyles={styles.emptyFolderBG}
            headerContentStyles={styles.emptyStateFolderIconSize}
            title={translate('workspace.expensifyCard.issueAndManageCards')}
            subtitle={translate('workspace.expensifyCard.getStartedIssuing')}
        />
    );
}

EmptyCardView.displayName = 'EmptyCardView';

export default EmptyCardView;
