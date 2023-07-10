import {Text, View, StyleSheet} from 'react-native';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import Styles from '../../../styles/styles';

function ReceiptSelector() {
    const devices = useCameraDevices();
    const device = devices.back;

    if (device == null) {
        return (
            <View>
                <Text style={[Styles.textHero, Styles.textWhite]}>Loading Camera..</Text>
            </View>
        );
    }

    return (
        <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive
        />
    );
}

// ReceiptSelector.defaultProps = defaultProps;
// ReceiptSelector.propTypes = propTypes;
ReceiptSelector.displayName = 'ReceiptSelector';

export default withOnyx({
    // credentials: {key: ONYXKEYS.CREDENTIALS},
    // session: {key: ONYXKEYS.SESSION},
})(ReceiptSelector);
