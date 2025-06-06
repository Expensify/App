import type {StackCardInterpolatedStyle, StackCardInterpolationProps} from '@react-navigation/stack';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import variables from '@styles/variables';

type RHPCardStyleInterpolator = (props: StackCardInterpolationProps) => StackCardInterpolatedStyle;

const useRHPCardStyleInterpolator = (): RHPCardStyleInterpolator => {
    // we have to use isSmallScreenWidth on safari, otherwise the content of RHP 'jumps' - its width gets set to size of screen and only after rerender gets set to correct value
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();

    const modalCardStyleInterpolator: RHPCardStyleInterpolator = ({current: {progress}, inverted, layouts: {screen}}) => {
        const translateX = Animated.multiply(
            progress.interpolate({
                inputRange: [0, 1],
                outputRange: [shouldUseNarrowLayout ? screen.width : variables.sideBarWidth, 0],
                extrapolate: 'clamp',
            }),
            inverted,
        );

        const cardStyle = StyleUtils.getCardStyles(isSmallScreenWidth ? screen.width : variables.sideBarWidth);

        if (shouldUseNarrowLayout) {
            cardStyle.transform = [{translateX}];
        }

        return {
            containerStyle: {
                overflow: 'hidden',
            },
            cardStyle,
        };
    };

    return modalCardStyleInterpolator;
};

export default useRHPCardStyleInterpolator;
