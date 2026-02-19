import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type WorkspaceCompanyCardsFeedAddedEmptyPageProps = {
    /** Whether to disable GB disclaimer */
    shouldShowGBDisclaimer?: boolean;
};

function WorkspaceCompanyCardsFeedAddedEmptyPage({shouldShowGBDisclaimer}: WorkspaceCompanyCardsFeedAddedEmptyPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['LaptopAssignCard']);

    return (
        <ScrollView
            contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}
            addBottomSafeAreaPadding
        >
            <EmptyStateComponent
                headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                headerMedia={illustrations.LaptopAssignCard}
                containerStyles={styles.mt5}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                headerContentStyles={styles.emptyStateCardIllustration}
                title={translate('workspace.moreFeatures.companyCards.emptyAddedFeedTitle')}
                subtitle={translate('workspace.moreFeatures.companyCards.emptyAddedFeedDescription')}
            />
            {!!shouldShowGBDisclaimer && <Text style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.companyCards.ukRegulation')}</Text>}
        </ScrollView>
    );
}

export default WorkspaceCompanyCardsFeedAddedEmptyPage;
