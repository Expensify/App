import React from 'react';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import HeaderPageLayout, {HeaderPageLayoutProps} from './HeaderPageLayout';
import Lottie from './Lottie';
import DotLottieAnimation from './LottieAnimations/types';

type IllustratedHeaderPageLayoutProps = {
    /** Children to display in the lower half of the page (below the header section w/ an animation) */
    children?: React.ReactNode;

    /** The illustration to display in the header. Can be a JSON object representing a Lottie animation. */
    illustration: DotLottieAnimation;

    /** The background color to apply in the upper half of the screen. */
    backgroundColor?: string;

    /** Overlay content to display on top of animation */
    overlayContent?: () => React.ReactNode;

    propsToPassToHeader: HeaderPageLayoutProps;
};

function IllustratedHeaderPageLayout({backgroundColor, children, illustration, overlayContent, propsToPassToHeader}: IllustratedHeaderPageLayoutProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <HeaderPageLayout
            backgroundColor={backgroundColor ?? theme.appBG}
            headerContent={
                <>
                    <Lottie
                        source={illustration}
                        style={styles.w100}
                        webStyle={styles.w100}
                        autoPlay
                        loop
                    />
                    {overlayContent?.()}
                </>
            }
            headerContainerStyles={[styles.justifyContentCenter, styles.w100]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsToPassToHeader}
        >
            {children}
        </HeaderPageLayout>
    );
}

IllustratedHeaderPageLayout.displayName = 'IllustratedHeaderPageLayout';

export default IllustratedHeaderPageLayout;
