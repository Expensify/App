import React from 'react';
import _ from 'underscore';
import {Text, View, Button} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import styles from './styles/styles';

// Onyx.connect({
//     key: 'demoCounter',
//     callback: (data) => {
//         console.log('demoCounter FROM Onyx.connect()', data);
//     }
// });
//
// const OnyxDemo = (props) => (
//     <View style={[styles.ph4, styles.pv4]}>
//         <Text>Count: {props.count}</Text>
//
//         <View style={[styles.mt4]}>
//             <Button
//                 onPress={() => {
//                     Onyx.merge('demoCounter', props.count + 1);
//                 }}
//                 title="Increase"
//             />
//         </View>
//
//         <View style={[styles.mt4]}>
//             <Button
//                 onPress={() => {
//                     Onyx.merge('demoCounter', props.count - 1);
//                 }}
//                 title="Decrease"
//             />
//         </View>
//     </View>
// );
//
// export default withOnyx({
//     count: {
//         key: 'demoCounter',
//     },
// })(OnyxDemo);

Onyx.connect({
    key: 'demoCollection_',
    // waitForCollectionCallback: true,
    callback: (data) => {
        console.log('demoCollection_ FROM Onyx.connect()', data);
    }
});
const OnyxCollectionDemo = (props) => (
    <View style={[styles.ph4, styles.pv4]}>
        <View style={[styles.mt4]}>
            <Button
                onPress={() => {
                    const fakeID = Math.floor(Math.random() * 100000);
                    Onyx.mergeCollection('demoCollection_', {
                        [`demoCollection_${fakeID}`]: {id: fakeID, name: 'test'},
                    });
                }}
                title="Add"
            />
        </View>

        <View style={[styles.mt4]}>
            <Button
                onPress={() => {
                    Onyx.clear();
                }}
                title="Clear"
            />
        </View>

        {props.things && _.size(props.things) && _.map(props.things, (thing) => thing && (
            <View key={thing.id}>
                <Text>{thing.name} - {thing.id}</Text>
            </View>
        ))}
    </View>
);

export default withOnyx({
    things: {
        key: 'demoCollection_',
    },
})(OnyxCollectionDemo);
