import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import reportPropTypes from '../pages/reportPropTypes';

const propTypes = {
    /** Report object for the current report */
    report: reportPropTypes,

    /** Offline status */
    isOffline: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    report: {reportID: '0'},
};

const JoinRoomPrompt = props => (
    <View>
        
    </View>
);

JoinRoomPrompt.displayName = 'JoinRoomPrompt';
JoinRoomPrompt.propTypes = propTypes;
JoinRoomPrompt.defaultProps = defaultProps;

export default withWindowDimensions()(JoinRoomPrompt);
