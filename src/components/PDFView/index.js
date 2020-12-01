import React from 'react';
import PropTypes from 'prop-types';
import {WebView} from 'react-native-webview';
import CONST from '../../CONST';

const propTypes = {
    // URL to full-sized image
    sourceURL: PropTypes.string,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    sourceURL: '',
    style: {},
};

/**
 * On web, we use a WebView pointed to a pdf renderer
 *
 * @param props
 * @returns {JSX.Element}
 */

const PDFView = props => (
    <WebView
        source={{uri: `${CONST.MOZILLA_PDF_VIEWER_URL}?file=${encodeURIComponent(props.sourceURL)}`}}
        style={props.style}
    />
);

PDFView.propTypes = propTypes;
PDFView.defaultProps = defaultProps;
PDFView.displayName = 'PDFView';

export default PDFView;
