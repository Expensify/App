import * as React from 'react';
import {StyleSheet, Pressable} from 'react-native';

import Animated, {
    useSharedValue, useAnimatedStyle, withRepeat, withTiming,
} from 'react-native-reanimated';

export default function Card({
    index, key, card, onPress, isDisabled, isInactive, isFlipped,
}) {
    const [isOn, setIsOn] = React.useState(false);

    const sv = useSharedValue(0);

    const handlePress = () => {
        console.log('flip', isOn);
        setIsOn(!isOn);

        if (onPress) {
            onPress();
        }
    };

    React.useEffect(() => {
        sv.value = withRepeat(withTiming(90, {duration: 500}), 2, true);
    }, [isOn]);

    const style = useAnimatedStyle(() => ({
        transform: [{rotateY: `${-sv.value}deg`}],
    }));

    return (
        <Animated.View style={style}>
            <Pressable disabled={isDisabled} style={[styles.container]} onPress={handlePress} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        height: 100,
        backgroundColor: 'green',
    },
});
