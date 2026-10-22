import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import Button from './Button';

type WiseGlobalReimbursementsBannerProps = {
    /** Opens the global reimbursements intro page */
    onGetStartedPress: () => void;

    /** Hides the banner for good */
    onDismissPress: () => void;

    /** Sentry labels of the "Get started" and close buttons */
    sentryLabels: {CTA: string; DISMISS: string};
};

/** The "Pay people worldwide" banner promoting Wise global reimbursements. Callers decide when it shows and what its buttons do */
function WiseGlobalReimbursementsBanner({onGetStartedPress, onDismissPress, sentryLabels}: WiseGlobalReimbursementsBannerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['EarthWithCoins']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);

    const shouldDisplayButtonInSeparateLine = shouldUseNarrowLayout && !isInLandscapeMode;

    return (
        <BillingBanner
            icon={illustrations.EarthWithCoins}
            title={translate('walletPage.wiseGlobalReimbursementsBanner.title')}
            subtitle={translate('walletPage.wiseGlobalReimbursementsBanner.subtitle')}
            subtitleStyle={[styles.mt1, styles.textLabel]}
            style={styles.borderRadiusComponentLarge}
            rightIcon={expensifyIcons.Close}
            onRightIconPress={onDismissPress}
            rightIconAccessibilityLabel={translate('common.dismiss')}
            rightIconTooltipText={translate('common.close')}
            rightIconSentryLabel={sentryLabels.DISMISS}
            rightComponent={
                <View style={shouldDisplayButtonInSeparateLine ? [styles.flex0, styles.flexBasis100, styles.maxWidth100Percentage, styles.justifyContentCenter] : undefined}>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={onGetStartedPress}
                        sentryLabel={sentryLabels.CTA}
                    >
                        <Button.Text>{translate('walletPage.wiseGlobalReimbursementsIntro.getStarted')}</Button.Text>
                    </Button>
                </View>
            }
        />
    );
}

export default WiseGlobalReimbursementsBanner;
