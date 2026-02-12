import React, {useMemo} from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import ScrollView from '@components/ScrollView';
import CardRowSkeleton from '@components/Skeletons/CardRowSkeleton';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import getCompanyCardsEmptyStateIllustrationKey from './companyCardsIllustrationUtils';

type WorkspaceCompanyCardsFeedAddedEmptyPageProps = {
    /** Policy ID for the workspace, used to show locale-specific illustration */
    policyID?: string;
    /** Whether to disable GB disclaimer */
    shouldShowGBDisclaimer?: boolean;
};

function WorkspaceCompanyCardsFeedAddedEmptyPage({policyID, shouldShowGBDisclaimer}: WorkspaceCompanyCardsFeedAddedEmptyPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID ?? '');
    const companyCardsIllustrationKey = useMemo(
        () => getCompanyCardsEmptyStateIllustrationKey(policy?.outputCurrency),
        [policy?.outputCurrency],
    );
    const illustrations = useMemoizedLazyIllustrations([companyCardsIllustrationKey]);
    const companyCardsIllustration = illustrations[companyCardsIllustrationKey];

    return (
        <ScrollView
            contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}
            addBottomSafeAreaPadding
        >
            <EmptyStateComponent
                SkeletonComponent={CardRowSkeleton}
                headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                headerMedia={companyCardsIllustration}
                containerStyles={styles.mt5}
                headerStyles={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart, {backgroundColor: colors.blue700}]}
                headerContentStyles={styles.emptyStateCompanyCardsPromoIllustration}
                title={translate('workspace.moreFeatures.companyCards.emptyAddedFeedTitle')}
                subtitle={translate('workspace.moreFeatures.companyCards.emptyAddedFeedDescription')}
            />
            {!!shouldShowGBDisclaimer && <Text style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.companyCards.ukRegulation')}</Text>}
        </ScrollView>
    );
}

export default WorkspaceCompanyCardsFeedAddedEmptyPage;
