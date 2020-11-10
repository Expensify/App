import React from 'react';
import PropTypes from 'prop-types';
import {View, Text} from 'react-native';

const propTypes = {
    text: PropTypes.string.isRequired,
};

const ViewWithText = props => (
    <View>
        <Text>{props.text}</Text>
    </View>
);

ViewWithText.propTypes = propTypes;
export default ViewWithText;
