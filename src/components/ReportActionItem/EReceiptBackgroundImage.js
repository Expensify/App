import React from 'react';
import PropTypes from 'prop-types';
import EReceiptBGImage from '../../../assets/images/eReceipt-BGImage.svg';


const propTypes = {
    /* Background color */
    primaryColor: PropTypes.string.isRequired,

    /* Building overlay color */
    secondaryColor: PropTypes.string.isRequired,
};

function EReceiptBackgroundImage({primaryColor, secondaryColor}) {
    return (
        <EReceiptBGImage style={{backgroundColor: primaryColor, color: secondaryColor}}/>
    );
}

EReceiptBackgroundImage.displayName = 'EReceiptBackgroundImage';
EReceiptBackgroundImage.propTypes = propTypes;

export default EReceiptBackgroundImage;

