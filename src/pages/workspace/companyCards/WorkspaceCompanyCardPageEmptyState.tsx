import React, {useCallback} from 'react';
import {View} from 'react-native';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import colors from '@styles/theme/colors';

const companyCardFeatures: FeatureListItem[] = [
    {
        icon: Illustrations.CreditCardsNew,
        translationKey: 'workspace.moreFeatures.companyCards.feed.features.support',
    },
    {
        icon: Illustrations.HandCard,
        translationKey: 'workspace.moreFeatures.companyCards.feed.features.assignCards',
    },
    {
        icon: Illustrations.MagnifyingGlassMoney,
        translationKey: 'workspace.moreFeatures.companyCards.feed.features.automaticImport',
    },
];

function WorkspaceCompanyCardPageEmptyState() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const startFlow = useCallback(() => {
        // TODO: Add Card Feed Flow https://github.com/Expensify/App/issues/47376
    }, []);

    return (
        <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            <FeatureList
                menuItems={companyCardFeatures}
                title={translate('workspace.moreFeatures.companyCards.feed.title')}
                subtitle={translate('workspace.moreFeatures.companyCards.subtitle')}
                ctaText={translate('workspace.moreFeatures.companyCards.feed.ctaTitle')}
                ctaAccessibilityLabel={translate('workspace.moreFeatures.companyCards.feed.ctaTitle')}
                onCtaPress={startFlow}
                illustrationBackgroundColor={colors.blue700}
                illustration={Illustrations.CompanyCardsEmptyState}
                illustrationStyle={styles.emptyStateCardIllustration}
                illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart]}
                titleStyles={styles.textHeadlineH1}
            />
        </View>
    );
}

WorkspaceCompanyCardPageEmptyState.displayName = 'WorkspaceCompanyCardPageEmptyState';

export default withPolicyAndFullscreenLoading(WorkspaceCompanyCardPageEmptyState);
