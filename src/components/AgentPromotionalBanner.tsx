import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';
import Badge from './Badge';
import Button from './Button';
import Text from './Text';

type AgentPromotionalBannerProps = {
    /** Title shown next to the bot illustration. */
    title: string;

    /** Supporting copy under the title. */
    subtitle: string;

    /** Called when the dismiss (X) button is pressed. */
    onDismiss: () => void;

    /** Sentry label for the dismiss button. */
    dismissSentryLabel: string;

    /** Optional CTA text. When omitted, the CTA is not rendered. */
    ctaText?: string;

    /** Called when the CTA is pressed. Required when `ctaText` is set. */
    onCtaPress?: () => void;

    /** Sentry label for the CTA. Required when `ctaText` is set. */
    ctaSentryLabel?: string;

    /** Extra styles applied to the outer container. */
    style?: StyleProp<ViewStyle>;
};

function AgentPromotionalBanner({title, subtitle, onDismiss, dismissSentryLabel, ctaText, onCtaPress, ctaSentryLabel, style}: AgentPromotionalBannerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['AiBot']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);

    const hasCta = !!ctaText && !!onCtaPress;

    const titleNode = useMemo(
        () => (
            <View style={[styles.flexRow, styles.flexShrink1]}>
                <Text style={[styles.textStrong]}>
                    {title}
                    <Badge
                        badgeStyles={styles.agentPromotionalBannerBadge}
                        success
                        isStrong
                        isCondensed
                        text={translate('common.new')}
                    />
                </Text>
            </View>
        ),
        [title, styles, translate],
    );

    const rightComponent = useMemo(() => {
        if (!hasCta) {
            return null;
        }
        if (shouldUseNarrowLayout && !isInLandscapeMode) {
            return (
                <View style={[styles.flex0, styles.flexBasis100, styles.maxWidth100Percentage, styles.justifyContentCenter]}>
                    <Button
                        success
                        medium
                        text={ctaText}
                        onPress={onCtaPress}
                        sentryLabel={ctaSentryLabel}
                    />
                </View>
            );
        }
        return (
            <Button
                success
                small
                text={ctaText}
                onPress={onCtaPress}
                sentryLabel={ctaSentryLabel}
            />
        );
    }, [hasCta, shouldUseNarrowLayout, isInLandscapeMode, ctaText, onCtaPress, ctaSentryLabel, styles]);

    return (
        <View style={style}>
            <BillingBanner
                icon={illustrations.AiBot}
                title={titleNode}
                subtitle={subtitle}
                subtitleStyle={[styles.mt1]}
                style={[styles.borderRadiusComponentLarge, styles.gap4]}
                rightIcon={expensifyIcons.Close}
                onRightIconPress={onDismiss}
                rightIconAccessibilityLabel={translate('common.dismiss')}
                rightIconSentryLabel={dismissSentryLabel}
                rightComponent={rightComponent}
            />
        </View>
    );
}

AgentPromotionalBanner.displayName = 'AgentPromotionalBanner';

export default AgentPromotionalBanner;
