import React from 'react';
import KeyboardAvoidingView from '../KeyboardAvoidingView';
import BasePDFViewNative from './BasePDFViewNative';
import * as pdfViewPropTypes from './pdfViewPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import styles from '../../styles/styles';

const PDFView = props => (
    <KeyboardAvoidingView>
        <BasePDFViewNative
            sourceURL={props.sourceURL}
            style={[props.style, styles.w100]}
        />
    </KeyboardAvoidingView>
);

PDFView.propTypes = pdfViewPropTypes.propTypes;
PDFView.defaultProps = pdfViewPropTypes.defaultProps;
PDFView.displayName = 'PDFView';

export default withWindowDimensions(PDFView);
