import React from 'react';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import BillingBanner from './BillingBanner';
import type {BillingBannerProps} from './BillingBanner';

type SubscriptionBillingBannerProps = Omit<BillingBannerProps, 'titleStyle' | 'subtitleStyle' | 'style' | 'brickRoadIndicator' | 'icon'> & {
    /** Indicates whether there is an error */
    isError?: boolean;

    /** An optional icon prop */
    icon?: IconAsset;
};

function SubscriptionBillingBanner({title, subtitle, rightIcon, icon, isError = false, onRightIconPress, rightIconAccessibilityLabel}: SubscriptionBillingBannerProps) {
    const styles = useThemeStyles();

    const illustrations = useMemoizedLazyIllustrations(['CreditCardEyes', 'CheckmarkCircle'] as const);

    const iconAsset = (icon ?? isError) ? illustrations.CreditCardEyes : illustrations.CheckmarkCircle;

    return (
        <BillingBanner
            title={title}
            subtitle={subtitle}
            icon={iconAsset}
            brickRoadIndicator={isError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : CONST.BRICK_ROAD_INDICATOR_STATUS.INFO}
            subtitleStyle={styles.textSupporting}
            style={styles.hoveredComponentBG}
            rightIcon={rightIcon}
            onRightIconPress={onRightIconPress}
            rightIconAccessibilityLabel={rightIconAccessibilityLabel}
        />
    );
}

SubscriptionBillingBanner.displayName = 'SubscriptionBillingBanner';

export default SubscriptionBillingBanner;
