import React from 'react';
import BasePDFViewNative from './BasePDFViewNative';
import {propTypes, defaultProps} from './pdfViewPropTypes';
import withWindowDimensions from '../withWindowDimensions';

const PDFView = props => (
    <BasePDFViewNative
        sourceURL={props.sourceURL}
        style={props.style}
        dismissKeyboardBeforePdfLoad={false}
        enableKeyboardAvoidingView
    />
);

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;
PDFView.displayName = 'PDFView';

export default withWindowDimensions(PDFView);
