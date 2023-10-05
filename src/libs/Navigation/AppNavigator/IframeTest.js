import React from 'react';
import PropTypes from 'prop-types';

import {Text, View} from 'react-native';

import {withNavigationPropTypes} from '../../../components/withNavigation';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen */
        params: PropTypes.shape({
            /** If the admin room should be opened */
        }),
    }).isRequired,

    ...withNavigationPropTypes,
};

function IframeTest(props) {
    return (
        <View>
            <Text style={{fontSize: 50, color: 'white'}}>{props.route.name}</Text>
            <Text style={{fontSize: 20, color: 'white'}}>{JSON.stringify(props.route.params)}</Text>
        </View>
    );
}

IframeTest.propTypes = propTypes;
IframeTest.displayName = 'IframeTest';

export default IframeTest;
