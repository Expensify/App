import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {Platform} from 'react-native';
import Animated, {createAnimatedPropAdapter, Easing, interpolateColor, processColor, useAnimatedProps, useSharedValue, withTiming} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import variables from '@styles/variables';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const adapter = createAnimatedPropAdapter(
    (props) => {
        // eslint-disable-next-line rulesdir/prefer-underscore-method
        if (Object.keys(props).includes('fill')) {
            // eslint-disable-next-line no-param-reassign
            props.fill = {type: 0, payload: processColor(props.fill)};
        }
        // eslint-disable-next-line rulesdir/prefer-underscore-method
        if (Object.keys(props).includes('stroke')) {
            // eslint-disable-next-line no-param-reassign
            props.stroke = {type: 0, payload: processColor(props.stroke)};
        }
    },
    ['fill', 'stroke'],
);
adapter.propTypes = {
    fill: PropTypes.string,
    stroke: PropTypes.string,
};

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

    const animatedProps = useAnimatedProps(
        () => {
            const fill = interpolateColor(sharedValue.value, [0, 1], [textLight, textDark]);

            return {
                fill,
            };
        },
        undefined,
        Platform.OS === 'web' ? undefined : adapter,
    );

    return (
        <Svg
            width={variables.iconSizeNormal}
            height={variables.iconSizeNormal}
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
