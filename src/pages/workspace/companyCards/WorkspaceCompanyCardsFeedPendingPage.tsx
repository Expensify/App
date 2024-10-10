import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Illustrations from '@components/Icon/Illustrations';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import * as ReportInstance from '@userActions/Report';
import CONST from '@src/CONST';

function WorkspaceCompanyCardsFeedPendingPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const subtitle = (
        <Text>
            {translate('workspace.moreFeatures.companyCards.pendingFeedDescription')}
            <TextLink onPress={() => ReportInstance.navigateToConciergeChat()}> {CONST?.CONCIERGE_CHAT_NAME}</TextLink>
        </Text>
    );

    return (
        <EmptyStateComponent
            SkeletonComponent={TableListItemSkeleton}
            containerStyles={styles.mt4}
            headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
            headerMedia={Illustrations.CompanyCardsPendingState}
            headerStyles={[styles.emptyStateCardIllustrationContainer, {backgroundColor: colors.ice800}]}
            headerContentStyles={styles.pendingStateCardIllustration}
            title={translate('workspace.moreFeatures.companyCards.pendingFeedTitle')}
            subtitle={subtitle}
        />
    );
}

WorkspaceCompanyCardsFeedPendingPage.displayName = 'WorkspaceCompanyCardsFeedPendingPage';

export default WorkspaceCompanyCardsFeedPendingPage;
