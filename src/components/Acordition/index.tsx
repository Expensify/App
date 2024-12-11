// import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';

// const style = StyleSheet.create({
//
//     animatedView: {
//         overflow: 'hidden',
//     },
// });

function AccordionItem({isExpanded, children, duration = 300}: {isExpanded: SharedValue<boolean>; children: any; duration?: number}) {
    const height = useSharedValue(0);

    const derivedHeight = useDerivedValue(() =>
        withTiming(height.get() * Number(isExpanded.get()), {
            duration,
        }),
    );
    const bodyStyle = useAnimatedStyle(() => ({
        height: derivedHeight.value,
    }));

    return (
        <Animated.View style={[bodyStyle]}>
            <View
                onLayout={(e) => {
                    height.set(e.nativeEvent.layout.height);
                }}
                style={{position: 'absolute', left: 0, right: 0, top: 0}}
            >
                {children}
            </View>
        </Animated.View>
    );
}

export default AccordionItem;
