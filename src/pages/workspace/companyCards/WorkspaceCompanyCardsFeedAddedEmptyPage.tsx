import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Illustrations from '@components/Icon/Illustrations';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function WorkspaceCompanyCardsFeedAddedEmptyPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <EmptyStateComponent
            SkeletonComponent={TableListItemSkeleton}
            headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
            headerMedia={Illustrations.EmptyAddedFeedState}
            headerStyles={styles.emptyCompanyCardsFolderBG}
            headerContentStyles={styles.emptyStateCompanyCardsIconSize}
            title={translate('workspace.moreFeatures.companyCards.emptyAddedFeedTitle')}
            subtitle={translate('workspace.moreFeatures.companyCards.emptyAddedFeedDescription')}
        />
    );
}

WorkspaceCompanyCardsFeedAddedEmptyPage.displayName = 'WorkspaceCompanyCardsFeedAddedEmptyPage';

export default WorkspaceCompanyCardsFeedAddedEmptyPage;
