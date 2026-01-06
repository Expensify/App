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
};

function WorkspaceCompanyCardExpensifyCardPromotionBanner({policy}: WorkspaceCompanyCardExpensifyCardPromotionBannerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const policyID = policy?.id;
    const areExpensifyCardsEnabled = policy?.areExpensifyCardsEnabled;

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
        const smallScreenStyle = shouldUseNarrowLayout ? [styles.flex0, styles.flexBasis100, styles.justifyContentCenter] : [];
        return (
            <View style={[styles.flexRow, styles.gap2, smallScreenStyle]}>
                <Button
                    success
                    onPress={handleLearnMore}
                    style={shouldUseNarrowLayout && styles.flex1}
                    text={translate('workspace.moreFeatures.companyCards.expensifyCardBannerLearnMoreButton')}
                />
            </View>
        );
    }, [styles, shouldUseNarrowLayout, translate, handleLearnMore]);

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
