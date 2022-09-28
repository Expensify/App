import React, {Component} from 'react';
import {TouchableWithoutFeedback, View, KeyboardAvoidingView} from 'react-native';
import PDF from 'react-native-pdf';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import PDFPasswordForm from './PDFPasswordForm';
import * as pdfViewPropTypes from './pdfViewPropTypes';
import compose from '../../libs/compose';
import withWindowDimensions from '../withWindowDimensions';
import withKeyboardState from '../withKeyboardState';

/**
 * On the native layer, we use a pdf library to display PDFs
 *
 * @param props
 * @returns {JSX.Element}
 */

const PDFView = props => (
    <TouchableWithoutFeedback style={[styles.flex1, props.style]}>
        <PDF
            trustAllCerts={false}
            activityIndicator={<FullScreenLoadingIndicator />}
            source={{uri: props.sourceURL}}
            style={[
                styles.imageModalPDF,
                StyleUtils.getWidthAndHeightStyle(props.windowWidth, props.windowHeight),
            ]}
        />
    </TouchableWithoutFeedback>
);

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;
PDFView.displayName = 'PDFView';

export default withWindowDimensions(PDFView);
