import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import BillingBanner from './BillingBanner';
import type {BillingBannerProps} from './BillingBanner';

type SubscriptionBillingBannerProps = Omit<BillingBannerProps, 'titleStyle' | 'subtitleStyle' | 'style' | 'brickRoadIndicator' | 'icon'> & {
    isTrialActive?: boolean;
    isError?: boolean;
    icon?: IconAsset;
};

function SubscriptionBillingBanner({
    title,
    subtitle,
    rightIcon,
    icon,
    isTrialActive,
    isError,
}: SubscriptionBillingBannerProps) {
    const styles = useThemeStyles();

    const backgroundStyle = isTrialActive ? styles.trialBannerBackgroundColor : styles.hoveredComponentBG;

    const subtitleStyle = isTrialActive ? [] : styles.textSupporting;

    const iconAsset = icon ?? isError ? Illustrations.CreditCardEyes : Illustrations.CheckmarkCircle;

    return (
        <BillingBanner
            title={title}
            subtitle={subtitle}
            icon={iconAsset}
            brickRoadIndicator={isError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : CONST.BRICK_ROAD_INDICATOR_STATUS.INFO}
            subtitleStyle={subtitleStyle}
            style={backgroundStyle}
            rightIcon={rightIcon}
        />
    );
}

SubscriptionBillingBanner.displayName = 'SubscriptionBillingBanner';

export default SubscriptionBillingBanner;
