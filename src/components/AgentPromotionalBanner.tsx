import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Badge from './Badge';
import Button from './Button';
import Icon from './Icon';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
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

    /** Sentry label for the CTA. */
    ctaSentryLabel?: string;

    /** Extra styles applied to the outer container. */
    style?: StyleProp<ViewStyle>;
};

function AgentPromotionalBanner({title, subtitle, onDismiss, dismissSentryLabel, ctaText, onCtaPress, ctaSentryLabel, style}: AgentPromotionalBannerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['AiBot']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);

    const hasCta = !!ctaText && !!onCtaPress;
    const shouldShowCtaBelow = hasCta && shouldUseNarrowLayout;
    const shouldShowCtaInline = hasCta && !shouldUseNarrowLayout;

    return (
        <View style={[styles.borderRadiusComponentLarge, styles.agentsPromoBannerBackgroundColor, styles.ph5, styles.pv4, style]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap4]}>
                <Icon
                    src={illustrations.AiBot}
                    width={variables.iconSizeAgentsPromoBanner}
                    height={variables.iconSizeAgentsPromoBanner}
                />
                <View style={[styles.flex1, styles.gap1]}>
                    <Text style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                        <Text style={[styles.textStrong, styles.agentsPromoBannerText, styles.flexShrink1]}>{title}</Text>
                        <View style={[styles.badgeHigher]}>
                            <Badge
                                success
                                isStrong
                                isCondensed
                                text={translate('common.new')}
                            />
                        </View>
                    </Text>
                    <Text style={[styles.textLabel, styles.agentsPromoBannerText]}>{subtitle}</Text>
                </View>
                {shouldShowCtaInline && (
                    <Button
                        success
                        small
                        text={ctaText}
                        onPress={onCtaPress}
                        sentryLabel={ctaSentryLabel}
                    />
                )}
                <PressableWithoutFeedback
                    onPress={onDismiss}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.dismiss')}
                    sentryLabel={dismissSentryLabel}
                >
                    <Icon
                        src={expensifyIcons.Close}
                        fill={theme.iconColorfulBackground}
                    />
                </PressableWithoutFeedback>
            </View>
            {shouldShowCtaBelow && (
                <Button
                    success
                    large
                    text={ctaText}
                    onPress={onCtaPress}
                    sentryLabel={ctaSentryLabel}
                    style={styles.mt4}
                />
            )}
        </View>
    );
}

AgentPromotionalBanner.displayName = 'AgentPromotionalBanner';

export default AgentPromotionalBanner;
