import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import {CompanyCardsPendingState} from '@components/Icon/Illustrations';
import ScrollView from '@components/ScrollView';
import CardRowSkeleton from '@components/Skeletons/CardRowSkeleton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat} from '@libs/actions/Report';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

function WorkspaceCompanyCardsFeedPendingPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <EmptyStateComponent
                SkeletonComponent={CardRowSkeleton}
                containerStyles={styles.mt5}
                headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                headerMedia={CompanyCardsPendingState}
                headerStyles={[styles.emptyStateCardIllustrationContainer, {backgroundColor: colors.ice800}]}
                headerContentStyles={styles.pendingStateCardIllustration}
                title={translate('workspace.moreFeatures.companyCards.pendingFeedTitle')}
            >
                <Text>
                    {translate('workspace.moreFeatures.companyCards.pendingFeedDescription')}
                    <TextLink onPress={() => navigateToConciergeChat()}> {CONST.CONCIERGE_CHAT_NAME}</TextLink>.
                </Text>
            </EmptyStateComponent>
        </ScrollView>
    );
}

WorkspaceCompanyCardsFeedPendingPage.displayName = 'WorkspaceCompanyCardsFeedPendingPage';

export default WorkspaceCompanyCardsFeedPendingPage;
