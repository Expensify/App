import React, {Ref} from 'react';
import QRCodeLibrary from 'react-native-qrcode-svg';
import {ImageSourcePropType} from 'react-native';
import defaultTheme from '../../styles/themes/default';
import CONST from '../../CONST';

type LogoRatio = typeof CONST.QR.DEFAULT_LOGO_SIZE_RATIO | typeof CONST.QR.EXPENSIFY_LOGO_SIZE_RATIO;

type LogoMarginRatio = typeof CONST.QR.DEFAULT_LOGO_MARGIN_RATIO | typeof CONST.QR.EXPENSIFY_LOGO_MARGIN_RATIO;

type QRCodeProps = {
    /** The QR code URL */
    url: string;

    /**
     * The logo which will be displayed in the middle of the QR code.
     * Follows ImageProps href from react-native-svg that is used by react-native-qrcode-svg.
     */
    logo?: ImageSourcePropType;

    /** The size ratio of logo to QR code */
    logoRatio?: LogoRatio;

    /** The size ratio of margin around logo to QR code */
    logoMarginRatio?: LogoMarginRatio;

    /** The QRCode size */
    size?: number;

    /** The QRCode color */
    color?: string;

    /** The QRCode background color */
    backgroundColor?: string;

    /**
     * Function to retrieve the internal component ref and be able to call it's
     * methods
     */
    getRef?: (ref: Ref<SVGElement>) => Ref<SVGElement>;
};

function QRCode({
    url,
    logo,
    getRef,
    size = 120,
    color = defaultTheme.text,
    backgroundColor = defaultTheme.highlightBG,
    logoRatio = CONST.QR.DEFAULT_LOGO_SIZE_RATIO,
    logoMarginRatio = CONST.QR.DEFAULT_LOGO_MARGIN_RATIO,
}: QRCodeProps) {
    return (
        <QRCodeLibrary
            getRef={getRef}
            value={url}
            size={size}
            logo={logo}
            logoBackgroundColor={backgroundColor}
            logoSize={size * logoRatio}
            logoMargin={size * logoMarginRatio}
            logoBorderRadius={size}
            backgroundColor={backgroundColor}
            color={color}
        />
    );
}

QRCode.displayName = 'QRCode';

export default QRCode;
