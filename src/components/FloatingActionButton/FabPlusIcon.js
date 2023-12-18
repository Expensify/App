import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import Animated, {createAnimatedPropAdapter, Easing, interpolateColor, processColor, useAnimatedProps, useSharedValue, withTiming} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import useTheme from '@hooks/useTheme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const propTypes = {
    /* Current state (active or not active) of the component */
    isActive: PropTypes.bool.isRequired,
};

function FabPlusIcon({isActive}) {
    const {textLight, textDark} = useTheme();
    const sharedValue = useSharedValue(isActive ? 1 : 0);

    useEffect(() => {
        sharedValue.value = withTiming(isActive ? 1 : 0, {
            duration: 340,
            easing: Easing.inOut(Easing.ease),
        });
    }, [isActive, sharedValue]);

    // Adapting fill and stroke properties from react-native-svg to be able to animate them with Reanimated
    const adapter = createAnimatedPropAdapter(
        (props) => {
            const modifiedProps = {...props};
            if (_.keys(modifiedProps).includes('fill')) {
                modifiedProps.fill = {type: 0, payload: processColor(modifiedProps.fill)};
            }
            if (_.keys(modifiedProps).includes('stroke')) {
                modifiedProps.stroke = {type: 0, payload: processColor(modifiedProps.stroke)};
            }
        },
        ['fill', 'stroke'],
    );
    adapter.propTypes = {
        fill: PropTypes.any,
        stroke: PropTypes.any,
    };

    const animatedProps = useAnimatedProps(
        () => {
            const fill = interpolateColor(sharedValue.value, [0, 1], [textLight, textDark]);

            return {
                fill,
            };
        },
        [],
        adapter,
    );

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
