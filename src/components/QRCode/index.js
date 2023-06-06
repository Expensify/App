import React from 'react';
import QRCodeLibrary from 'react-native-qrcode-svg';
import PropTypes from 'prop-types';
import defaultTheme from '../../styles/themes/default';
import CONST from '../../CONST';

const propTypes = {
    /**
     * The QR code URL
     */
    url: PropTypes.string.isRequired,
    /**
     * The logo which will be displayed in the middle of the QR code.
     * Follows ImageProps href from react-native-svg that is used by react-native-qrcode-svg.
     */
    logo: PropTypes.oneOfType([PropTypes.shape({uri: PropTypes.string}), PropTypes.number, PropTypes.string]),
    /**
     * The size ratio of logo to QR code
     */
    logoRatio: PropTypes.number,
    /**
     * The size ratio of margin around logo to QR code
     */
    logoMarginRatio: PropTypes.number,
    /**
     * The QRCode size
     */
    size: PropTypes.number,
    /**
     * The QRCode color
     */
    color: PropTypes.string,
    /**
     * The QRCode background color
     */
    backgroundColor: PropTypes.string,
    /**
     * Function to retrieve the internal component ref and be able to call it's
     * methods
     */
    getRef: PropTypes.func,
};

const defaultProps = {
    logo: undefined,
    size: 120,
    color: defaultTheme.text,
    backgroundColor: defaultTheme.highlightBG,
    getRef: undefined,
    logoRatio: CONST.QR.DEFAULT_LOGO_SIZE_RATIO,
    logoMarginRatio: CONST.QR.DEFAULT_LOGO_MARGIN_RATIO,
};

function QRCode(props) {
    return (
        <QRCodeLibrary
            getRef={props.getRef}
            value={props.url}
            size={props.size}
            logo={props.logo}
            logoBackgroundColor={props.backgroundColor}
            logoSize={props.size * props.logoRatio}
            logoMargin={props.size * props.logoMarginRatio}
            logoBorderRadius={props.size}
            backgroundColor={props.backgroundColor}
            color={props.color}
        />
    );
}

QRCode.displayName = 'QRCode';
QRCode.propTypes = propTypes;
QRCode.defaultProps = defaultProps;

export default QRCode;
