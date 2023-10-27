import React from 'react';
import {View} from 'react-native';
import Text from '../../../components/Text';

const propTypes = {};

function PersonalInfo(props) {
    return (
        <View>
            <Text>Personal Info step</Text>
        </View>
    );
}

PersonalInfo.propTypes = propTypes;
PersonalInfo.displayName = 'PersonalInfo';

export default PersonalInfo;
