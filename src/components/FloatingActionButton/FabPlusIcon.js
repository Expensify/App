import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import Animated, {useSharedValue, useAnimatedProps, withTiming, interpolateColor, Easing} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import themeColors from '../../styles/themes/default';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const propTypes = {
    /* Current state (active or not active) of the component */
    isActive: PropTypes.bool.isRequired,
};

function FabPlusIcon({isActive}) {
    const animatedValue = useSharedValue(isActive ? 1 : 0);

    useEffect(() => {
        animatedValue.value = withTiming(isActive ? 1 : 0, {
            duration: 340,
            easing: Easing.inOut(Easing.ease),
        });
    }, [isActive, animatedValue]);

    const animatedProps = useAnimatedProps(() => {
        const fill = interpolateColor(animatedValue.value, [0, 1], [themeColors.textLight, themeColors.textDark]);

        return {
            fill,
        };
    });

    return (
        <Svg
            width={20}
            height={20}
        >
            <AnimatedPath
                d="M12,3c0-1.1-0.9-2-2-2C8.9,1,8,1.9,8,3v5H3c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h5v5c0,1.1,0.9,2,2,2c1.1,0,2-0.9,2-2v-5h5c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2h-5V3z"
                animatedProps={animatedProps}
            />
        </Svg>
    );
}

FabPlusIcon.propTypes = propTypes;
FabPlusIcon.displayName = 'FabPlusIcon';

export default FabPlusIcon;
