import React from 'react';
import BasePDFViewNative from './BasePDFViewNative';
import * as pdfViewPropTypes from './pdfViewPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import styles from '../../styles/styles';

const PDFView = props => (
    <BasePDFViewNative
        sourceURL={props.sourceURL}
        style={[props.style, styles.w100]}
    />
);

PDFView.propTypes = pdfViewPropTypes.propTypes;
PDFView.defaultProps = pdfViewPropTypes.defaultProps;
PDFView.displayName = 'PDFView';

export default withWindowDimensions(PDFView);
