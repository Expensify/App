import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {GPS_DISTANCE_INTERVAL_METERS} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';

import ImageSVG from '@src/components/ImageSVG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

type SliderProps = {
    onSliderRatioChange: (ratio: number) => void;
};

function Slider({onSliderRatioChange}: SliderProps) {
    const styles = useThemeStyles();

    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MapStopWaypoint']);

    const totalDistanceMeters = gpsDraftDetails?.distanceInMeters ?? 0;

    // If the user already trimmed and came back to edit again, restore the previous trim position
    const initialRatio = totalDistanceMeters > 0 && !!gpsDraftDetails?.modifiedDistance ? gpsDraftDetails.modifiedDistance / totalDistanceMeters : 1;

    const minRatio = totalDistanceMeters > 0 ? GPS_DISTANCE_INTERVAL_METERS / totalDistanceMeters : 0;

    const sliderRatio = useSharedValue(initialRatio);
    const minSliderRatio = useSharedValue(minRatio);
    const sliderWidthShared = useSharedValue(0);

    const panGesture = Gesture.Pan().onChange((e) => {
        'worklet';

        if (sliderWidthShared.get() === 0) {
            return;
        }

        const newRatio = Math.min(1, Math.max(minSliderRatio.get(), sliderRatio.get() + e.changeX / sliderWidthShared.get()));
        sliderRatio.set(newRatio);
        scheduleOnRN(onSliderRatioChange, newRatio);
    });

    const thumbStyle = useAnimatedStyle(() => ({
        transform: [{translateX: sliderRatio.get() * sliderWidthShared.get()}],
    }));

    const filledStyle = useAnimatedStyle(() => ({
        width: sliderRatio.get() * sliderWidthShared.get(),
    }));

    return (
        <View style={[{height: 64}, styles.ph5, styles.justifyContentCenter]}>
            <View
                style={styles.sliderBar}
                onLayout={(e) => {
                    sliderWidthShared.set(e.nativeEvent.layout.width);
                }}
            >
                <Animated.View style={[styles.editStopSliderFilled, filledStyle]} />
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.editedStopSliderKnob, thumbStyle]}>
                        <ImageSVG
                            src={expensifyIcons.MapStopWaypoint}
                            width={CONST.MAP_MARKER_SIZES.STOP_WAYPOINT.width}
                            height={CONST.MAP_MARKER_SIZES.STOP_WAYPOINT.height}
                        />
                    </Animated.View>
                </GestureDetector>
            </View>
        </View>
    );
}

export default Slider;
