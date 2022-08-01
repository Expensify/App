import React, {Component} from 'react';
import BasePDFViewNative from './BasePDFViewNative';
import * as pdfViewPropTypes from './pdfViewPropTypes';
import compose from '../../libs/compose';
import withWindowDimensions from '../withWindowDimensions';
import withKeyboardState from '../withKeyboardState';

class PDFView extends Component {
    componentDidUpdate() {
        // Alert the parent component that it may be necessary to adjust the UI
        // to accommodate the keyboard.
        this.props.onAvoidKeyboard(this.props.isShown);
    }

    render() {
        return (
            <BasePDFViewNative
                sourceURL={this.props.sourceURL}
                style={this.props.style}
            />
        );
    }
}

PDFView.propTypes = pdfViewPropTypes.propTypes;
PDFView.defaultProps = pdfViewPropTypes.defaultProps;

export default compose(
    withWindowDimensions,
    withKeyboardState,
)(PDFView);
