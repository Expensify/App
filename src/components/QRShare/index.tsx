import type {ForwardedRef} from 'react';
import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import type {Svg} from 'react-native-svg';
import ExpensifyWordmark from '@assets/images/expensify-wordmark.svg';
import ImageSVG from '@components/ImageSVG';
import QRCode from '@components/QRCode';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {QRShareHandle, QRShareProps} from './types';

function QRShare({url, title, subtitle, logo, logoRatio, logoMarginRatio}: QRShareProps, ref: ForwardedRef<QRShareHandle>) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const [qrCodeSize, setQrCodeSize] = useState(0);
    const svgRef = useRef<Svg>();

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
            style={styles.shareCodeContainer}
            onLayout={onLayout}
        >
            <View style={styles.expensifyQrLogo}>
                <ImageSVG
                    contentFit="contain"
                    src={ExpensifyWordmark}
                    fill={theme.QRLogo}
                />
            </View>

            <QRCode
                getRef={(svg) => (svgRef.current = svg)}
                url={url}
                logo={logo}
                size={qrCodeSize}
                logoRatio={logoRatio}
                logoMarginRatio={logoMarginRatio}
            />

            <Text
                family="EXP_NEW_KANSAS_MEDIUM"
                fontSize={variables.fontSizeXLarge}
                numberOfLines={2}
                style={styles.qrShareTitle}
            >
                {title}
            </Text>

            {!!subtitle && (
                <Text
                    fontSize={variables.fontSizeLabel}
                    numberOfLines={2}
                    style={[styles.mt1, styles.textAlignCenter]}
                    color={theme.textSupporting}
                >
                    {subtitle}
                </Text>
            )}
        </View>
    );
}

QRShare.displayName = 'QRShare';

export default forwardRef(QRShare);
