import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {enableExpensifyCard} from '@libs/actions/Policy/Policy';
import {navigateToExpensifyCardPage} from '@libs/PolicyUtils';
import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';
import type {Policy} from '@src/types/onyx';

type WorkspaceCompanyCardExpensifyCardPromotionBannerProps = {
    policy: OnyxEntry<Policy>;
    canWriteCompanyCards: boolean;
    canWriteMoreFeatures: boolean;
    onReadOnlyAction: () => void;
};

function WorkspaceCompanyCardExpensifyCardPromotionBanner({policy, canWriteCompanyCards, canWriteMoreFeatures, onReadOnlyAction}: WorkspaceCompanyCardExpensifyCardPromotionBannerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const policyID = policy?.id;
    const areExpensifyCardsEnabled = policy?.areExpensifyCardsEnabled;
    const canUseLearnMore = areExpensifyCardsEnabled ? canWriteCompanyCards : canWriteMoreFeatures;

    const illustrations = useMemoizedLazyIllustrations(['CreditCardsNewGreen']);

    const handleLearnMore = useCallback(() => {
        if (!policyID) {
            return;
        }

        if (areExpensifyCardsEnabled) {
            navigateToExpensifyCardPage(policyID);
            return;
        }

        enableExpensifyCard(policyID, true, true);
    }, [policyID, areExpensifyCardsEnabled]);

    const rightComponent = useMemo(() => {
        const smallScreenStyle = shouldUseNarrowLayout && !isInLandscapeMode ? [styles.flex0, styles.flexBasis100, styles.maxWidth100Percentage, styles.justifyContentCenter] : [];
        return (
            <View style={[styles.flexRow, styles.gap2, smallScreenStyle]}>
                <Button
                    success
                    onPress={canUseLearnMore ? handleLearnMore : onReadOnlyAction}
                    style={shouldUseNarrowLayout && !isInLandscapeMode && styles.flex1}
                    innerStyles={!canUseLearnMore ? styles.buttonOpacityDisabled : undefined}
                    hoverStyles={!canUseLearnMore ? styles.buttonOpacityDisabled : undefined}
                    text={translate('workspace.moreFeatures.companyCards.expensifyCardBannerLearnMoreButton')}
                    accessibilityLabel={`${translate('workspace.moreFeatures.companyCards.expensifyCardBannerLearnMoreButton')}, ${translate('workspace.moreFeatures.companyCards.expensifyCardBannerTitle')}`}
                />
            </View>
        );
    }, [styles, shouldUseNarrowLayout, isInLandscapeMode, translate, canUseLearnMore, handleLearnMore, onReadOnlyAction]);

    return (
        <View style={[styles.ph4, styles.mb4]}>
            <BillingBanner
                icon={illustrations.CreditCardsNewGreen}
                title={translate('workspace.moreFeatures.companyCards.expensifyCardBannerTitle')}
                titleStyle={StyleUtils.getTextColorStyle(theme.text)}
                subtitle={translate('workspace.moreFeatures.companyCards.expensifyCardBannerSubtitle')}
                subtitleStyle={[styles.mt1, styles.textLabel]}
                style={[styles.borderRadiusComponentLarge]}
                rightComponent={rightComponent}
            />
        </View>
    );
}

export default WorkspaceCompanyCardExpensifyCardPromotionBanner;
