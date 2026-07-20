import Button from '@components/ButtonComposed';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ProductMarketingAnnouncementVariant} from '@libs/ProductMarketingWindowUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {Image, View} from 'react-native';

type ProductMarketingWindowProps = {
    /** Content variant to display, already resolved for the user's audience. */
    variant: ProductMarketingAnnouncementVariant;

    /** Resolved illustration asset for illustration-backed variants. Typed optional to match ImageSVG's src. */
    illustration: IconAsset | undefined;

    /** Called when the primary CTA is pressed. */
    onCtaPress: () => void;

    /** Called when the Dismiss button is pressed. */
    onDismiss: () => void;
};

function ProductMarketingWindow({variant, illustration, onCtaPress, onDismiss}: ProductMarketingWindowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const shouldUseLightMarketingWindow = theme.colorScheme === CONST.COLOR_SCHEME.DARK;
    const buttonSize = shouldUseNarrowLayout ? CONST.BUTTON_SIZE.MEDIUM : CONST.BUTTON_SIZE.SMALL;

    return (
        <View
            style={[
                styles.productMarketingWindowContainer,
                shouldUseLightMarketingWindow ? styles.productMarketingWindowContainerLight : styles.productMarketingWindowContainerDark,
                styles.p5,
                shouldUseNarrowLayout
                    ? [styles.productMarketingWindowContainerNarrow, {bottom: variables.productMarketingWindowOffsetNarrow + insets.bottom}]
                    : styles.productMarketingWindowContainerWide,
            ]}
            testID={ProductMarketingWindow.displayName}
        >
            <View
                style={[
                    styles.productMarketingWindowIllustrationContainer,
                    shouldUseLightMarketingWindow ? styles.productMarketingWindowIllustrationContainerLight : styles.productMarketingWindowIllustrationContainerDark,
                    styles.mb4,
                ]}
                testID="ProductMarketingWindowVisual"
            >
                {variant.visual.type === 'image' ? (
                    <Image
                        source={variant.visual.source}
                        style={styles.productMarketingWindowImage}
                        resizeMode="cover"
                        accessibilityIgnoresInvertColors
                        testID="ProductMarketingWindowImage"
                    />
                ) : (
                    <ImageSVG
                        src={illustration}
                        width={variables.productMarketingWindowIllustrationSize}
                        height={variables.productMarketingWindowIllustrationSize}
                        contentFit="contain"
                    />
                )}
            </View>
            <Text style={[styles.textStrong, shouldUseLightMarketingWindow ? styles.productMarketingWindowHeadingLight : styles.productMarketingWindowHeadingDark]}>
                {translate(variant.heading)}
            </Text>
            <Text style={[styles.textLabel, shouldUseLightMarketingWindow ? styles.productMarketingWindowBodyLight : styles.productMarketingWindowBodyDark, styles.mt0Half]}>
                {translate(variant.body)}
            </Text>
            <View
                style={[styles.flexRow, styles.gap3, styles.mt4]}
                testID="ProductMarketingWindowActions"
            >
                <Button
                    size={buttonSize}
                    style={styles.flex1}
                    innerStyles={shouldUseLightMarketingWindow ? styles.productMarketingWindowDismissButtonLight : styles.productMarketingWindowDismissButtonDark}
                    hoverStyles={styles.productMarketingWindowDismissButtonHovered}
                    onPress={onDismiss}
                    sentryLabel={CONST.SENTRY_LABEL.PRODUCT_MARKETING_WINDOW.DISMISS}
                    testID="ProductMarketingWindowDismiss"
                >
                    <Button.Text style={shouldUseLightMarketingWindow ? styles.productMarketingWindowDismissButtonTextLight : styles.productMarketingWindowDismissButtonTextDark}>
                        {translate('common.dismiss')}
                    </Button.Text>
                </Button>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={buttonSize}
                    style={styles.flex1}
                    onPress={onCtaPress}
                    sentryLabel={CONST.SENTRY_LABEL.PRODUCT_MARKETING_WINDOW.CTA}
                    testID="ProductMarketingWindowCTA"
                >
                    <Button.Text>{translate(variant.ctaLabel)}</Button.Text>
                </Button>
            </View>
        </View>
    );
}

ProductMarketingWindow.displayName = 'ProductMarketingWindow';

export default ProductMarketingWindow;
