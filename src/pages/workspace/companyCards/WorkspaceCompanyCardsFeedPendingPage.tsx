import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import ScrollView from '@components/ScrollView';
import CardRowSkeleton from '@components/Skeletons/CardRowSkeleton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat} from '@libs/actions/Report';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function WorkspaceCompanyCardsFeedPendingPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {CompanyCardsPendingState} = useMemoizedLazyIllustrations(['CompanyCardsPendingState']);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

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
                    <TextLink onPress={() => navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, false)}> {CONST.CONCIERGE_CHAT_NAME}</TextLink>.
                </Text>
            </EmptyStateComponent>
        </ScrollView>
    );
}

export default WorkspaceCompanyCardsFeedPendingPage;
