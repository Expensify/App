/**
 * Unlike web browsers, native clients can't inject HTML straight into the DOM so there needs to be a native way
 * of accomplishing that.
 */
import React from 'react';
import PropTypes from 'prop-types';
import HTML from 'react-native-render-html';
import {Linking} from 'react-native';
import {webViewStyles} from '../../style/StyleSheet';

const propTypes = {
    html: PropTypes.string,
};
const defaultProps = {
    html: '',
};

const WebView = ({html}) => (
    <HTML
        baseFontStyle={webViewStyles.baseFontStyle}
        tagsStyles={webViewStyles.tagStyles}
        onLinkPress={(event, href) => Linking.openURL(href)}
        html={html}
    />
);

WebView.propTypes = propTypes;
WebView.defaultProps = defaultProps;
WebView.displayName = 'WebView';

export default WebView;
