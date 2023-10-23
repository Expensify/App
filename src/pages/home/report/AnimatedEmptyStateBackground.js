import React from 'react';
import Animated, {SensorType, useAnimatedSensor, useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import * as NumberUtils from '../../../libs/NumberUtils';
import EmptyStateBackgroundImage from '../../../../assets/images/empty-state_background-fade.png';
import * as StyleUtils from '../../../styles/StyleUtils';
import variables from '../../../styles/variables';
import CONST from '../../../CONST';

const IMAGE_OFFSET_Y = 75;

function AnimatedEmptyStateBackground() {
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    const IMAGE_OFFSET_X = windowWidth / 2;

    // If window width is greater than the max background width, repeat the background image
    const maxBackgroundWidth = variables.sideBarWidth + CONST.EMPTY_STATE_BACKGROUND.ASPECT_RATIO * CONST.EMPTY_STATE_BACKGROUND.WIDE_SCREEN.IMAGE_HEIGHT;

    // Get data from phone rotation sensor and prep other variables for animation
    const animatedSensor = useAnimatedSensor(SensorType.GYROSCOPE);
    const xOffset = useSharedValue(0);
    const yOffset = useSharedValue(0);

    // Apply data to create style object
    const animatedStyles = useAnimatedStyle(() => {
        if (!isSmallScreenWidth) {
            return {};
        }
        /*
         * We use x and y gyroscope velocity and add it to position offset to move background based on device movements.
         * Position the phone was in while entering the screen is the initial position for background image.
         */
        const {x, y} = animatedSensor.sensor.value;
        // The x vs y here seems wrong but is the way to make it feel right to the user
        xOffset.value = NumberUtils.clampWorklet(xOffset.value + y, -IMAGE_OFFSET_X, IMAGE_OFFSET_X);
        yOffset.value = NumberUtils.clampWorklet(yOffset.value - x, -IMAGE_OFFSET_Y, IMAGE_OFFSET_Y);
        return {
            transform: [{translateX: withSpring(-IMAGE_OFFSET_X - xOffset.value)}, {translateY: withSpring(yOffset.value)}],
        };
    }, []);

    return (
        <Animated.Image
            source={EmptyStateBackgroundImage}
            style={[StyleUtils.getReportWelcomeBackgroundImageStyle(isSmallScreenWidth), animatedStyles]}
            resizeMode={windowWidth > maxBackgroundWidth ? 'repeat' : 'cover'}
        />
    );
}

AnimatedEmptyStateBackground.displayName = 'AnimatedEmptyStateBackground';
export default AnimatedEmptyStateBackground;
