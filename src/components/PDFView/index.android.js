import React from 'react';
import {Keyboard} from 'react-native';
import BasePDFViewNative from './BasePDFViewNative';
import * as pdfViewPropTypes from './pdfViewPropTypes';
import withWindowDimensions from '../withWindowDimensions';

const PDFView = (props) => {
    /**
     * Hide keyboard before rendering PDF. On Android we need to close the keyboard
     * before rendering the PDF. If the keyboard is open during PDF rendering then
     * react-native-pdf scales the PDF view incorrectly.
     */
    const hideKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <BasePDFViewNative
            sourceURL={props.sourceURL}
            style={props.style}
            onAttemptPdfLoad={hideKeyboard}
        />
    );
};

PDFView.propTypes = pdfViewPropTypes.propTypes;
PDFView.defaultProps = pdfViewPropTypes.defaultProps;
PDFView.displayName = 'PDFView';

export default withWindowDimensions(PDFView);
