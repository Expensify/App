import React from 'react';
import {KeyboardAvoidingView} from 'react-native';
import CONST from '../../CONST';
import BasePDFViewNative from './BasePDFViewNative';
import * as pdfViewPropTypes from './pdfViewPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import styles from '../../styles/styles';

const PDFView = (props) => {
    const keyboardVerticalOffset = props.isSmallScreenWidth
        ? CONST.PDF_PASSWORD_FORM.KEYBOARD_VERTICAL_OFFSET.SMALL_SCREEN
        : CONST.PDF_PASSWORD_FORM.KEYBOARD_VERTICAL_OFFSET.DEFAULT;

    const keyboardAvoidingViewStyles = [
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        styles.w100,
    ];

    return (
        <KeyboardAvoidingView
            style={keyboardAvoidingViewStyles}
            contentContainerStyle={keyboardAvoidingViewStyles}
            behavior="position"
            keyboardVerticalOffset={keyboardVerticalOffset}
        >
            <BasePDFViewNative
                sourceURL={props.sourceURL}
                style={[props.style, styles.w100]}
            />
        </KeyboardAvoidingView>
    );
};

PDFView.propTypes = pdfViewPropTypes.propTypes;
PDFView.defaultProps = pdfViewPropTypes.defaultProps;
PDFView.displayName = 'PDFView';

export default withWindowDimensions(PDFView);
