import React, {Component} from 'react';
import {Keyboard} from 'react-native';
import BasePDFViewNative from './BasePDFViewNative';
import * as pdfViewPropTypes from './pdfViewPropTypes';
import withWindowDimensions from '../withWindowDimensions';

class PDFView extends Component {
    constructor(props) {
        super(props);
        this.hideKeyboard = this.hideKeyboard.bind(this);
    }

    /**
     * Hide keyboard before rendering PDF. On Android we need to close the keyboard
     * before rendering the PDF. If the keyboard is open during PDF rendering, then
     * react-native-pdf doesn't correctly scale the PDF view.
     */
    hideKeyboard() {
        Keyboard.dismiss();
    }

    render() {
        return (
            <BasePDFViewNative
                sourceURL={this.props.sourceURL}
                style={this.props.style}
                onAttemptPdfLoad={this.hideKeyboard}
                onAvoidKeyboard={this.props.onAvoidKeyboard}
            />
        );
    }
}

PDFView.propTypes = pdfViewPropTypes.propTypes;
PDFView.defaultProps = pdfViewPropTypes.defaultProps;

export default withWindowDimensions(PDFView);
