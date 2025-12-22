import React, {useCallback, useContext, useMemo} from 'react';
import {View} from 'react-native';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasIssuedExpensifyCard} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import {clearAddNewCardFlow} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import WorkspaceCompanyCardExpensifyCardPromotionBanner from './WorkspaceCompanyCardExpensifyCardPromotionBanner';

type WorkspaceCompanyCardPageEmptyStateProps = {
    policy: Policy | undefined;
    shouldShowGBDisclaimer?: boolean;
};

function WorkspaceCompanyCardPageEmptyState({policy, shouldShowGBDisclaimer}: WorkspaceCompanyCardPageEmptyStateProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const [allWorkspaceCards] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const shouldShowExpensifyCardPromotionBanner = !hasIssuedExpensifyCard(policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID, allWorkspaceCards);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const illustrations = useMemoizedLazyIllustrations(['CreditCardsNew', 'HandCard', 'MagnifyingGlassMoney', 'CompanyCardsEmptyState']);

    const companyCardFeatures = useMemo(() => {
        const features = [
            {
                icon: illustrations.CreditCardsNew,
                translationKey: 'workspace.moreFeatures.companyCards.feed.features.support' as const,
            },

            {
                icon: illustrations.HandCard,
                translationKey: 'workspace.moreFeatures.companyCards.feed.features.assignCards' as const,
            },

            {
                icon: illustrations.MagnifyingGlassMoney,
                translationKey: 'workspace.moreFeatures.companyCards.feed.features.automaticImport' as const,
            },
        ];
        return features
            .filter((feature) => feature.icon !== null)
            .map((feature) => ({
                icon: feature.icon,
                translationKey: feature.translationKey,
            }));
    }, [illustrations.CreditCardsNew, illustrations.HandCard, illustrations.MagnifyingGlassMoney]);

    const handleCtaPress = useCallback(() => {
        if (!policy?.id) {
            return;
        }
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        clearAddNewCardFlow();
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policy.id));
    }, [policy?.id, isActingAsDelegate, showDelegateNoAccessModal]);

    return (
        <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            {shouldShowExpensifyCardPromotionBanner && <WorkspaceCompanyCardExpensifyCardPromotionBanner policy={policy} />}
            <FeatureList
                menuItems={companyCardFeatures as FeatureListItem[]}
                title={translate('workspace.moreFeatures.companyCards.feed.title')}
                subtitle={translate('workspace.moreFeatures.companyCards.feed.subtitle')}
                ctaText={translate('workspace.companyCards.addCards')}
                ctaAccessibilityLabel={translate('workspace.companyCards.addCards')}
                onCtaPress={handleCtaPress}
                illustrationBackgroundColor={colors.blue700}
                illustration={illustrations.CompanyCardsEmptyState}
                illustrationStyle={styles.emptyStateCardIllustration}
                illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart]}
                titleStyles={styles.textHeadlineH1}
                isButtonDisabled={workspaceAccountID === CONST.DEFAULT_NUMBER_ID}
            />
            {!!shouldShowGBDisclaimer && <Text style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.companyCards.ukRegulation')}</Text>}
        </View>
    );
}

export default WorkspaceCompanyCardPageEmptyState;
