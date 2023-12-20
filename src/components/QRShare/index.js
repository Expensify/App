import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import ExpensifyWordmark from '@assets/images/expensify-wordmark.svg';
import QRCode from '@components/QRCode';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {qrShareDefaultProps, qrSharePropTypes} from './propTypes';

function QRShare({innerRef, url, title, subtitle, logo, logoRatio, logoMarginRatio}) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const [qrCodeSize, setQrCodeSize] = useState(1);
    const svgRef = useRef(null);

    useImperativeHandle(
        innerRef,
        () => ({
            getSvg: () => svgRef.current,
        }),
        [],
    );

    const onLayout = (event) => {
        const containerWidth = event.nativeEvent.layout.width - variables.qrShareHorizontalPadding * 2 || 0;
        setQrCodeSize(Math.max(1, containerWidth));
    };

    return (
        <View
            style={styles.shareCodeContainer}
            onLayout={onLayout}
        >
            <View style={styles.expensifyQrLogo}>
                <ExpensifyWordmark
                    fill={theme.QRLogo}
                    width="100%"
                    height="100%"
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

            {!_.isEmpty(subtitle) && (
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

QRShare.propTypes = qrSharePropTypes;
QRShare.defaultProps = qrShareDefaultProps;
QRShare.displayName = 'QRShare';

const QRShareWithRef = forwardRef((props, ref) => (
    <QRShare
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

QRShareWithRef.displayName = 'QRShareWithRef';

export default QRShareWithRef;
