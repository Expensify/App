import {Text} from 'react-native';
import Performance from 'react-native-performance';

const onPress = () => {
    const metrics = Performance.getEntries();
    console.log('Devtools collecting performance metrics...', metrics);
    fetch('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify(metrics),
    });
};

// eslint-disable-next-line rulesdir/no-inline-named-export, import/prefer-default-export
export function PerfDevtools() {
    return (
        <Text
            onPress={onPress}
            style={{position: 'absolute', bottom: 0, zIndex: 1000}}
        >
            __reassure__
        </Text>
    );
}
