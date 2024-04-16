import type {ImageSourcePropType} from 'react-native';
import type {Svg} from 'react-native-svg';
import type {QRCodeLogoMarginRatio, QRCodeLogoRatio} from '@components/QRCode';

type QRShareProps = {
    /**
     * The QR code URL
     */
    url: string;

    /**
     * The title that is displayed below the QR Code (usually the user or report name)
     */
    title: string;

    /**
     * The subtitle which will be shown below the title (usually user email or workspace name)
     * */
    subtitle?: string;

    /**
     * The logo which will be display in the middle of the QR code
     */
    logo?: ImageSourcePropType;

    /**
     * The size ratio of logo to QR code
     */
    logoRatio?: QRCodeLogoRatio;

    /**
     * The size ratio of margin around logo to QR code
     */
    logoMarginRatio?: QRCodeLogoMarginRatio;
};

type QRShareHandle = {
    getSvg: () => Svg | undefined;
};

export type {QRShareHandle, QRShareProps};
