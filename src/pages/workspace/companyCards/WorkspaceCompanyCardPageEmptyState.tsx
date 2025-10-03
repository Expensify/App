import React, {useCallback, useContext, useMemo} from 'react';
import {View} from 'react-native';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import Text from '@components/Text';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasIssuedExpensifyCard} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import colors from '@styles/theme/colors';
import {clearAddNewCardFlow} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import WorkspaceCompanyCardExpensifyCardPromotionBanner from './WorkspaceCompanyCardExpensifyCardPromotionBanner';

type WorkspaceCompanyCardPageEmptyStateProps = {
    shouldShowGBDisclaimer?: boolean;
} & WithPolicyAndFullscreenLoadingProps;

function WorkspaceCompanyCardPageEmptyState({policy, shouldShowGBDisclaimer}: WorkspaceCompanyCardPageEmptyStateProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const [allWorkspaceCards] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const shouldShowExpensifyCardPromotionBanner = !hasIssuedExpensifyCard(policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID, allWorkspaceCards);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const {asset: CreditCardsIcon} = useMemoizedLazyAsset(() => loadIllustration('CreditCardsNew'));
    const {asset: HandCardIcon} = useMemoizedLazyAsset(() => loadIllustration('HandCard'));
    const {asset: MagnifyingGlassIcon} = useMemoizedLazyAsset(() => loadIllustration('MagnifyingGlassMoney'));
    const {asset: CompanyCardsEmptyStateIcon} = useMemoizedLazyAsset(() => loadIllustration('CompanyCardsEmptyState'));

    const companyCardFeatures = useMemo(() => {
        const features = [
            {
                icon: CreditCardsIcon,
                translationKey: 'workspace.moreFeatures.companyCards.feed.features.support' as const,
            },

            {
                icon: HandCardIcon,
                translationKey: 'workspace.moreFeatures.companyCards.feed.features.assignCards' as const,
            },

            {
                icon: MagnifyingGlassIcon,
                translationKey: 'workspace.moreFeatures.companyCards.feed.features.automaticImport' as const,
            },
        ];
        return features
            .filter((feature) => feature.icon !== null)
            .map((feature) => ({
                icon: feature.icon,
                translationKey: feature.translationKey,
            }));
    }, [CreditCardsIcon, HandCardIcon, MagnifyingGlassIcon]);

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
    }, [policy, isActingAsDelegate, showDelegateNoAccessModal]);

    return (
        <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            {shouldShowExpensifyCardPromotionBanner && <WorkspaceCompanyCardExpensifyCardPromotionBanner policy={policy} />}
            <FeatureList
                menuItems={companyCardFeatures as FeatureListItem[]}
                title={translate('workspace.moreFeatures.companyCards.feed.title')}
                subtitle={translate('workspace.moreFeatures.companyCards.subtitle')}
                ctaText={translate('workspace.companyCards.addCards')}
                ctaAccessibilityLabel={translate('workspace.companyCards.addCards')}
                onCtaPress={handleCtaPress}
                illustrationBackgroundColor={colors.blue700}
                illustration={CompanyCardsEmptyStateIcon}
                illustrationStyle={styles.emptyStateCardIllustration}
                illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart]}
                titleStyles={styles.textHeadlineH1}
                isButtonDisabled={workspaceAccountID === CONST.DEFAULT_NUMBER_ID}
            />
            {!!shouldShowGBDisclaimer && <Text style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.companyCards.ukRegulation')}</Text>}
        </View>
    );
}

WorkspaceCompanyCardPageEmptyState.displayName = 'WorkspaceCompanyCardPageEmptyState';

export default withPolicyAndFullscreenLoading(WorkspaceCompanyCardPageEmptyState);
