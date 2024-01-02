import React, {ReactNode} from 'react';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ChildrenProps from '@src/types/utils/ChildrenProps';
import HeaderPageLayout from './HeaderPageLayout';
import HeaderWithBackButtonProps from './HeaderWithBackButton/types';
import Lottie from './Lottie';
import DotLottieAnimation from './LottieAnimations/types';

type IllustratedHeaderPageLayoutProps = ChildrenProps &
    HeaderWithBackButtonProps & {
        /** The illustration to display in the header. Can be a JSON object representing a Lottie animation. */
        illustration: DotLottieAnimation;

        /** The background color to apply in the upper half of the screen. */
        backgroundColor?: string;

        /** Overlay content to display on top of animation */
        overlayContent?: () => ReactNode;
    };

function IllustratedHeaderPageLayout({backgroundColor, children, illustration, overlayContent, ...rest}: IllustratedHeaderPageLayoutProps) {
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
            {...rest}
        >
            {children}
        </HeaderPageLayout>
    );
}

IllustratedHeaderPageLayout.displayName = 'IllustratedHeaderPageLayout';

export default IllustratedHeaderPageLayout;
