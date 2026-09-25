import React from 'react';
import {TouchableOpacity} from 'react-native';

// react-native-a11y/has-valid-accessibility-descriptors: touchable with no a11y props
function Probe() {
    return <TouchableOpacity onPress={() => undefined} />;
}

export default Probe;
