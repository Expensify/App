/**
 * Unlike web browsers, native clients can't inject HTML straight into the DOM so there needs to be a native way
 * of accomplishing that.
 */
import React from 'react';
import {Text} from 'react-native';
import Str from '../../lib/Str';
import PropTypes from 'prop-types';

const propTypes = {
    html: PropTypes.string,
};
const defaultProps = {
    html: '',
};

// @TODO native clients don't support directly injecting HTML so a method needs to be found to do this reliably
const WebView = ({html}) => (
    <Text>{Str.htmlDecode(html)}</Text>
);

WebView.propTypes = propTypes;
WebView.defaultProps = defaultProps;
WebView.displayName = 'WebView';

export default WebView;
