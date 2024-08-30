import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import colors from '@styles/theme/colors';
import * as CompanyCards from '@userActions/CompanyCards';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

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

type WorkspaceCompanyCardPageEmptyStateProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW>;

function WorkspaceCompanyCardPageEmptyState({route}: WorkspaceCompanyCardPageEmptyStateProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const policyID = route.params.policyID ?? '-1';

    const startFlow = useCallback(() => {
        CompanyCards.clearAddNewCardFlow();
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policyID));
    }, [policyID]);

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
