import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import BillingBanner from '@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner';
import CONST from '@src/CONST';
import Badge from './Badge';
import Button from './Button';
import Icon from './Icon';
import {PressableWithoutFeedback} from './Pressable';
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
    const theme = useTheme();
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

    const dismissIcon = useMemo(
        () => (
            <PressableWithoutFeedback
                onPress={onDismiss}
                style={[styles.touchableButtonImage]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.dismiss')}
                sentryLabel={dismissSentryLabel}
            >
                <Icon
                    src={expensifyIcons.Close}
                    fill={theme.icon}
                />
            </PressableWithoutFeedback>
        ),
        [onDismiss, styles.touchableButtonImage, translate, dismissSentryLabel, expensifyIcons.Close, theme.icon],
    );

    const rightComponent = useMemo(() => {
        if (!hasCta) {
            return dismissIcon;
        }
        if (shouldUseNarrowLayout && !isInLandscapeMode) {
            return (
                <>
                    {dismissIcon}
                    <View style={[styles.flex0, styles.flexBasis100, styles.maxWidth100Percentage, styles.justifyContentCenter]}>
                        <Button
                            success
                            medium
                            text={ctaText}
                            onPress={onCtaPress}
                            sentryLabel={ctaSentryLabel}
                        />
                    </View>
                </>
            );
        }
        return (
            <View style={[styles.flexRow, styles.gap4, styles.alignItemsCenter]}>
                <Button
                    success
                    medium
                    text={ctaText}
                    onPress={onCtaPress}
                    sentryLabel={ctaSentryLabel}
                />
                {dismissIcon}
            </View>
        );
    }, [hasCta, shouldUseNarrowLayout, isInLandscapeMode, ctaText, onCtaPress, ctaSentryLabel, styles, dismissIcon]);

    return (
        <View style={style}>
            <BillingBanner
                icon={illustrations.AiBot}
                title={titleNode}
                subtitle={subtitle}
                subtitleStyle={[styles.mt1, styles.textLabel]}
                style={[styles.borderRadiusComponentLarge]}
                rightComponent={rightComponent}
            />
        </View>
    );
}

AgentPromotionalBanner.displayName = 'AgentPromotionalBanner';

export default AgentPromotionalBanner;
