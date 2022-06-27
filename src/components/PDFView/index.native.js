import React from 'react';
import BasePDFViewNative from './BasePDFViewNative';
import * as pdfViewPropTypes from './pdfViewPropTypes';
import withWindowDimensions from '../withWindowDimensions';

const PDFView = props => (
    <BasePDFViewNative
        sourceURL={props.sourceURL}
        style={props.style}
    />
);

PDFView.propTypes = pdfViewPropTypes.propTypes;
PDFView.defaultProps = pdfViewPropTypes.defaultProps;
PDFView.displayName = 'PDFView';

export default withWindowDimensions(PDFView);
