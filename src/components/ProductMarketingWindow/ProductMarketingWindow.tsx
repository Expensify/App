import Button from '@components/ButtonComposed';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ProductMarketingAnnouncementVariant} from '@libs/ProductMarketingWindowUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

type ProductMarketingWindowProps = {
    /** Content variant to display, already resolved for the user's audience. */
    variant: ProductMarketingAnnouncementVariant;

    /** Resolved illustration asset for the variant (a placeholder while the illustrations chunk loads). Typed optional to match ImageSVG's src. */
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

    return (
        <View
            style={[
                styles.productMarketingWindowContainer,
                styles.p4,
                shouldUseNarrowLayout
                    ? [styles.productMarketingWindowContainerNarrow, {bottom: variables.productMarketingWindowOffsetNarrow + insets.bottom}]
                    : styles.productMarketingWindowContainerWide,
            ]}
            testID={ProductMarketingWindow.displayName}
        >
            <View style={[styles.productMarketingWindowIllustrationContainer, styles.mb4]}>
                <ImageSVG
                    src={illustration}
                    width={variables.productMarketingWindowIllustrationSize}
                    height={variables.productMarketingWindowIllustrationSize}
                    contentFit="contain"
                />
            </View>
            <Text style={[styles.textHeadlineH2, styles.productMarketingWindowHeading]}>{translate(variant.heading)}</Text>
            <Text style={[styles.textLabel, styles.productMarketingWindowBody, styles.mt1]}>{translate(variant.body)}</Text>
            <View style={[styles.flexRow, styles.gap2, styles.mt4]}>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.MEDIUM}
                    style={styles.flex1}
                    onPress={onCtaPress}
                    sentryLabel={CONST.SENTRY_LABEL.PRODUCT_MARKETING_WINDOW.CTA}
                >
                    <Button.Text>{translate(variant.ctaLabel)}</Button.Text>
                </Button>
                <Button
                    size={CONST.BUTTON_SIZE.MEDIUM}
                    style={styles.flex1}
                    innerStyles={styles.productMarketingWindowDismissButton}
                    onPress={onDismiss}
                    sentryLabel={CONST.SENTRY_LABEL.PRODUCT_MARKETING_WINDOW.DISMISS}
                >
                    <Button.Text style={styles.productMarketingWindowDismissButtonText}>{translate('common.dismiss')}</Button.Text>
                </Button>
            </View>
        </View>
    );
}

ProductMarketingWindow.displayName = 'ProductMarketingWindow';

export default ProductMarketingWindow;
