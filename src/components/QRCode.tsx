import React from 'react';
import type {ImageSourcePropType} from 'react-native';
import QRCodeLibrary from 'react-native-qrcode-svg';
import type {Svg, SvgProps} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';

type QRCodeLogoRatio = typeof CONST.QR.DEFAULT_LOGO_SIZE_RATIO | typeof CONST.QR.EXPENSIFY_LOGO_SIZE_RATIO;

type QRCodeLogoMarginRatio = typeof CONST.QR.DEFAULT_LOGO_MARGIN_RATIO | typeof CONST.QR.EXPENSIFY_LOGO_MARGIN_RATIO;

type QRCodeProps = {
    /** The QR code URL */
    url: string;

    /**
     * The logo which will be displayed in the middle of the QR code.
     * Follows ImageProps href from react-native-svg that is used by react-native-qrcode-svg.
     */
    logo?: ImageSourcePropType;

    /**
     * If the logo to be displayed in the middle of the QR code is an SVG, then this prop needs to be used
     * instead of standard `logo`.
     */
    svgLogo?: React.FC<SvgProps>;

    /**
     * Background color to be used for logo.
     */
    logoBackgroundColor?: string;

    /**
     * Fill color to be used for logos of type SVG.
     */
    svgLogoFillColor?: string;

    /** The size ratio of logo to QR code */
    logoRatio?: QRCodeLogoRatio;

    /** The size ratio of margin around logo to QR code */
    logoMarginRatio?: QRCodeLogoMarginRatio;

    /** The QRCode size */
    size?: number;

    /** The QRCode color */
    color?: string;

    /** The QRCode background color */
    backgroundColor?: string;

    /**
     * Function to retrieve the internal component ref and be able to call its
     * methods
     */
    getRef?: (ref: Svg) => Svg;
};

function QRCode({
    url,
    logo,
    svgLogo,
    svgLogoFillColor,
    logoBackgroundColor,
    getRef,
    size = 120,
    color,
    backgroundColor,
    logoRatio = CONST.QR.DEFAULT_LOGO_SIZE_RATIO,
    logoMarginRatio = CONST.QR.DEFAULT_LOGO_MARGIN_RATIO,
}: QRCodeProps) {
    const theme = useTheme();

    return (
        <QRCodeLibrary
            getRef={getRef}
            value={url}
            size={size}
            logo={logo}
            logoSVG={svgLogo}
            logoColor={svgLogoFillColor}
            logoBackgroundColor={logoBackgroundColor ?? theme.highlightBG}
            logoSize={size * logoRatio}
            logoMargin={size * logoMarginRatio}
            logoBorderRadius={size}
            backgroundColor={backgroundColor ?? theme.highlightBG}
            color={color ?? theme.text}
        />
    );
}

QRCode.displayName = 'QRCode';

export default QRCode;
export type {QRCodeLogoMarginRatio, QRCodeLogoRatio};
