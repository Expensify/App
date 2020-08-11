/**
 * Web browsers can just inject HTML straight into the DOM, which is really handy. Unfortunately, native devices
 * will need their own native implementations to allow the display of HTML
 */
import {Text} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import ExpensiMark from '../../lib/ExpensiMark';

const parser = new ExpensiMark();
const propTypes = {
    html: PropTypes.string,
};
const defaultProps = {
    html: '',
};

const WebView = ({html}) => (
    <Text>
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{__html: parser.replace(html)}} />
    </Text>
);

WebView.propTypes = propTypes;
WebView.defaultProps = defaultProps;
WebView.displayName = 'WebView';

export default WebView;
