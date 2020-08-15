/**
 * Unlike web browsers, native clients can't inject HTML straight into the DOM so there needs to be a native way
 * of accomplishing that.
 */
import React from 'react';
import PropTypes from 'prop-types';
import HTML from 'react-native-render-html';
import {View, Linking} from 'react-native';
import styles, {webViewStyles} from '../../style/StyleSheet';

const propTypes = {
    html: PropTypes.string,
};
const defaultProps = {
    html: '',
};

const WebView = ({html}) => (
    <View style={[styles.flex1, styles.flexRow]}>
        <HTML
            baseFontStyle={webViewStyles.baseFontStyle}
            tagsStyles={webViewStyles.tagStyles}
            onLinkPress={(event, href) => Linking.openURL(href)}
            html={html}
        />
    </View>
);

WebView.propTypes = propTypes;
WebView.defaultProps = defaultProps;
WebView.displayName = 'WebView';

export default WebView;
