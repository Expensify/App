import React from 'react';
import PropTypes from 'prop-types';
import EReceiptBGImage from '../../../assets/images/eReceipt-BGImage.svg';

const propTypes = {
    /* Background color */
    backgroundColor: PropTypes.string.isRequired,

    /* Building overlay color */
    fill: PropTypes.string.isRequired,
};

function EReceiptBackgroundImage({backgroundColor, fill}) {
    return <EReceiptBGImage style={{backgroundColor, color: fill}} />;
}

EReceiptBackgroundImage.displayName = 'EReceiptBackgroundImage';
EReceiptBackgroundImage.propTypes = propTypes;

export default EReceiptBackgroundImage;
