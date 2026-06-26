import React from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

type FeatureTrainingModalTextContentProps = {
    /** Title for the modal */
    title?: string | React.ReactNode;

    /** Subtitle for the modal */
    subtitle?: string;

    /** Describe what is showing */
    description?: string;

    /** Style for the title */
    titleStyles?: StyleProp<TextStyle>;

    /** Styles applied to the inner text container */
    contentInnerContainerStyles?: StyleProp<ViewStyle>;

    /** Whether description is HTML markup */
    shouldRenderHTMLDescription?: boolean;

    /** Children rendered below the description (single-page mode only) */
    children?: React.ReactNode;

    /** onLayout hook — used by the carousel probe to measure the tallest page */
    onLayout?: (event: LayoutChangeEvent) => void;
};

function FeatureTrainingContentBodyText({
    title = '',
    subtitle = '',
    description = '',
    titleStyles,
    contentInnerContainerStyles,
    shouldRenderHTMLDescription = false,
    children,
    onLayout,
}: FeatureTrainingModalTextContentProps) {
    const styles = useThemeStyles();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    if (!title || !description) {
        return null;
    }

    return (
        <View
            style={[onboardingIsMediumOrLargerScreenWidth ? [styles.gap1, styles.mb8] : [shouldRenderHTMLDescription ? styles.mb5 : styles.mb10], contentInnerContainerStyles]}
            onLayout={onLayout}
        >
            {!!subtitle && <Text style={[styles.textLabel, styles.textBold, styles.textSuccess]}>{subtitle}</Text>}
            {typeof title === 'string' ? <Text style={[styles.textHeadlineH1, titleStyles]}>{title}</Text> : title}
            {shouldRenderHTMLDescription ? (
                <View style={[styles.flexRow, styles.w100, styles.mb2, styles.renderHTML]}>
                    <RenderHTML html={description} />
                </View>
            ) : (
                <Text style={styles.textSupporting}>{description}</Text>
            )}
            {children}
        </View>
    );
}

export default FeatureTrainingContentBodyText;
