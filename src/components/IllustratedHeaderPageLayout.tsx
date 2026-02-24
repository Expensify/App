import React from 'react';
import type {ReactNode} from 'react';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import HeaderPageLayout from './HeaderPageLayout';
import type {HeaderPageLayoutProps} from './HeaderPageLayout';
import Lottie from './Lottie';
import type DotLottieAnimation from './LottieAnimations/types';

type IllustratedHeaderPageLayoutProps = HeaderPageLayoutProps & {
    /** The illustration to display in the header. Can be a JSON object representing a Lottie animation. */
    illustration: DotLottieAnimation;

    /** The background color to apply in the upper half of the screen. */
    backgroundColor?: string;

    /** Overlay content to display on top of animation */
    overlayContent?: () => ReactNode;

    /** TestID to apply to the whole section container */
    testID: string;
};

function IllustratedHeaderPageLayout({backgroundColor, children, illustration, testID, overlayContent, ...rest}: IllustratedHeaderPageLayoutProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const shouldLimitHeight = !rest.shouldShowBackButton;

    return (
        <HeaderPageLayout
            backgroundColor={backgroundColor ?? theme.appBG}
            headerContent={
                <>
                    <Lottie
                        source={illustration}
                        style={styles.w100}
                        webStyle={shouldLimitHeight ? styles.h100 : styles.w100}
                        autoPlay
                        loop
                    />
                    {overlayContent?.()}
                </>
            }
            testID={testID}
            headerContainerStyles={[styles.justifyContentCenter, styles.w100, shouldLimitHeight && styles.centralPaneAnimation]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {children}
        </HeaderPageLayout>
    );
}

export default IllustratedHeaderPageLayout;
