import React from 'react';
import Button from '@components/Button';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';

type GetStartedTravelInvoicingProps = {
    /** The policyID for the workspace */
    policyID: string;

    /** Callback when the CTA button is pressed */
    onCtaPress?: (policyID: string) => void;
};

function GetStartedTravelInvoicing({policyID, onCtaPress}: GetStartedTravelInvoicingProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['EmptyStateTravel', 'FastMoney', 'Abacus', 'CalendarMonthly'] as const);

    const handleCtaPress = () => {
        // TODO: Navigate to Travel Invoicing setup flow
        // This will be implemented when the setup flow is ready
        onCtaPress?.(policyID);
    };

    const travelInvoicingFeatures: FeatureListItem[] = [
        {
            icon: illustrations.FastMoney,
            translationKey: 'travel.features.easyPayments',
        },
        {
            icon: illustrations.Abacus,
            translationKey: 'travel.features.travelSpendLimits',
        },
        {
            icon: illustrations.CalendarMonthly,
            translationKey: 'travel.features.invoicedMonthlyWeekly',
        },
    ];

    return (
        <FeatureList
            menuItems={travelInvoicingFeatures}
            title={translate('workspace.moreFeatures.travel.travelInvoicing.setup.title')}
            subtitle={translate('workspace.moreFeatures.travel.travelInvoicing.setup.subtitle')}
            onCtaPress={handleCtaPress}
            illustrationBackgroundColor={colors.blue600}
            illustration={illustrations.EmptyStateTravel}
            illustrationStyle={styles.travelCardIllustration}
            illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter]}
            titleStyles={styles.textHeadlineH1}
            footer={
                <Button
                    success
                    large
                    text={translate('workspace.moreFeatures.travel.travelInvoicing.setup.ctaText')}
                    onPress={handleCtaPress}
                    pressOnEnter
                />
            }
        />
    );
}

GetStartedTravelInvoicing.displayName = 'GetStartedTravelInvoicing';

export default GetStartedTravelInvoicing;
