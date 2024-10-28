import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Illustrations from '@components/Icon/Illustrations';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

function WorkspaceCompanyCardsFeedAddedEmptyPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <EmptyStateComponent
            SkeletonComponent={TableListItemSkeleton}
            headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
            headerMedia={Illustrations.CompanyCardsEmptyState}
            containerStyles={styles.mt4}
            headerStyles={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart, {backgroundColor: colors.blue700}]}
            headerContentStyles={styles.emptyStateCardIllustration}
            title={translate('workspace.moreFeatures.companyCards.emptyAddedFeedTitle')}
            subtitle={translate('workspace.moreFeatures.companyCards.emptyAddedFeedDescription')}
        />
    );
}

WorkspaceCompanyCardsFeedAddedEmptyPage.displayName = 'WorkspaceCompanyCardsFeedAddedEmptyPage';

export default WorkspaceCompanyCardsFeedAddedEmptyPage;
