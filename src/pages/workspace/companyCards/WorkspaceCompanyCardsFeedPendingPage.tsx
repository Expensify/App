import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat} from '@libs/actions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function WorkspaceCompanyCardsFeedPendingPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {LaptopReviewCard} = useMemoizedLazyIllustrations(['LaptopReviewCard']);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    return (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <EmptyStateComponent
                containerStyles={styles.mt5}
                headerMedia={LaptopReviewCard}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                headerContentStyles={styles.pendingStateCardIllustration}
                title={translate('workspace.moreFeatures.companyCards.pendingFeedTitle')}
            >
                <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>
                    {translate('workspace.moreFeatures.companyCards.pendingFeedDescription')}
                    <TextLink onPress={() => navigateToConciergeChat(conciergeReportID, false)}> {CONST.CONCIERGE_CHAT_NAME}</TextLink>.
                </Text>
            </EmptyStateComponent>
        </ScrollView>
    );
}

export default WorkspaceCompanyCardsFeedPendingPage;
