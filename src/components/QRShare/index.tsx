import React, {useImperativeHandle, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import type {Svg} from 'react-native-svg';
import ImageSVG from '@components/ImageSVG';
import QRCode from '@components/QRCode';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import type {QRShareProps} from './types';

function QRShare({
    url,
    title,
    subtitle,
    logo,
    svgLogo,
    svgLogoFillColor,
    logoBackgroundColor,
    logoRatio,
    logoMarginRatio,
    shouldShowExpensifyLogo = true,
    additionalStyles,
    size,
    ref,
}: QRShareProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    const qrCodeContainerWidth = shouldUseNarrowLayout ? windowWidth : variables.sideBarWidth;
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark']);

    const {formatPhoneNumber} = useLocalize();

    const [qrCodeSize, setQrCodeSize] = useState<number>(qrCodeContainerWidth - styles.ph5.paddingHorizontal * 2 - variables.qrShareHorizontalPadding * 2);
    const svgRef = useRef<Svg | undefined>(undefined);

    useImperativeHandle(
        ref,
        () => ({
            getSvg: () => svgRef.current,
        }),
        [],
    );

    const onLayout = (event: LayoutChangeEvent) => {
        const containerWidth = event.nativeEvent.layout.width - variables.qrShareHorizontalPadding * 2 || 0;
        setQrCodeSize(Math.max(1, containerWidth));
    };

    return (
        <View
            style={[styles.shareCodeContainer, additionalStyles]}
            onLayout={onLayout}
        >
            {shouldShowExpensifyLogo && (
                <View style={styles.expensifyQrLogo}>
                    <ImageSVG
                        contentFit="contain"
                        src={icons.ExpensifyWordmark}
                        fill={theme.QRLogo}
                    />
                </View>
            )}

            <QRCode
                getRef={(svg) => (svgRef.current = svg)}
                url={url}
                svgLogo={svgLogo}
                svgLogoFillColor={svgLogoFillColor}
                logoBackgroundColor={logoBackgroundColor}
                logo={logo}
                size={size ?? qrCodeSize}
                logoRatio={logoRatio}
                logoMarginRatio={logoMarginRatio}
            />

            {!!title && (
                <Text
                    family="EXP_NEW_KANSAS_MEDIUM"
                    fontSize={variables.fontSizeXLarge}
                    numberOfLines={2}
                    style={styles.qrShareTitle}
                >
                    {formatPhoneNumber(title)}
                </Text>
            )}

            {!!subtitle && (
                <Text
                    fontSize={variables.fontSizeLabel}
                    numberOfLines={2}
                    style={[styles.mt1, styles.textAlignCenter]}
                    color={theme.textSupporting}
                >
                    {formatPhoneNumber(subtitle)}
                </Text>
            )}
        </View>
    );
}

export default QRShare;
