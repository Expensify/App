import React from 'react';
import {Text, View, Button} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import styles from './styles/styles';

Onyx.connect({
    key: 'demoCounter',
    callback: (data) => {
        console.log('demoCounter FROM Onyx.connect()', data);
    }
});

const OnyxDemo = (props) => (
    <View style={[styles.ph4, styles.pv4]}>
        <Text>Count: {props.count}</Text>

        <View style={[styles.mt4]}>
            <Button
                onPress={() => {
                    Onyx.set('demoCounter', props.count + 1);
                }}
                title="Increase"
            />
        </View>

        <View style={[styles.mt4]}>
            <Button
                onPress={() => {
                    Onyx.set('demoCounter', props.count - 1);
                }}
                title="Decrease"
            />
        </View>
    </View>
);

export default withOnyx({
    count: {
        key: 'demoCounter',
    },
})(OnyxDemo);
