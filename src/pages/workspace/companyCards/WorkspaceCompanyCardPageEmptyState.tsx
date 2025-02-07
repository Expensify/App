import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import colors from '@styles/theme/colors';
import {clearAddNewCardFlow} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import WorkspaceCompanyCardExpensifyCardPromotionBanner from './WorkspaceCompanyCardExpensifyCardPromotionBanner';

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

function WorkspaceCompanyCardPageEmptyState({policy}: WithPolicyAndFullscreenLoadingProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});
    const [hasSeenExpensifyCardPromotion, hasSeenExpensifyCardPromotionResult] = useOnyx(ONYXKEYS.NVP_SEEN_EXPENSIFY_CARD_PROMOTION, {initialValue: false});
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const handleCtaPress = useCallback(() => {
        if (isActingAsDelegate) {
            setIsNoDelegateAccessMenuVisible(true);
            return;
        }
        clearAddNewCardFlow();
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policy?.id ?? String(CONST.DEFAULT_NUMBER_ID)));
    }, [policy, isActingAsDelegate]);

    return (
        <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            {!isLoadingOnyxValue(hasSeenExpensifyCardPromotionResult) && !hasSeenExpensifyCardPromotion && <WorkspaceCompanyCardExpensifyCardPromotionBanner policy={policy} />}
            <FeatureList
                menuItems={companyCardFeatures}
                title={translate('workspace.moreFeatures.companyCards.feed.title')}
                subtitle={translate('workspace.moreFeatures.companyCards.subtitle')}
                ctaText={translate('workspace.companyCards.addCards')}
                ctaAccessibilityLabel={translate('workspace.companyCards.addCards')}
                onCtaPress={handleCtaPress}
                illustrationBackgroundColor={colors.blue700}
                illustration={Illustrations.CompanyCardsEmptyState}
                illustrationStyle={styles.emptyStateCardIllustration}
                illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart]}
                titleStyles={styles.textHeadlineH1}
            />
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </View>
    );
}

WorkspaceCompanyCardPageEmptyState.displayName = 'WorkspaceCompanyCardPageEmptyState';

export default withPolicyAndFullscreenLoading(WorkspaceCompanyCardPageEmptyState);
