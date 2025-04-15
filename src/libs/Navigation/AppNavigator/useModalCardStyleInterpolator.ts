import type {StackCardInterpolatedStyle, StackCardInterpolationProps} from '@react-navigation/stack';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanel from '@hooks/useSidePanel';
import useStyleUtils from '@hooks/useStyleUtils';
import variables from '@styles/variables';

type ModalCardStyleInterpolatorProps = {
    isOnboardingModal?: boolean;
    isFullScreenModal?: boolean;
    shouldFadeScreen?: boolean;
    shouldAnimateSidePanel?: boolean;
    props: StackCardInterpolationProps;
    outputRangeMultiplier?: number;
};

type ModalCardStyleInterpolator = (props: ModalCardStyleInterpolatorProps) => StackCardInterpolatedStyle;

const useModalCardStyleInterpolator = (): ModalCardStyleInterpolator => {
    const {shouldUseNarrowLayout, onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    const {sidePanelOffset} = useSidePanel();

    const modalCardStyleInterpolator: ModalCardStyleInterpolator = ({
        props: {
            current: {progress},
            inverted,
            layouts: {screen},
        },
        isOnboardingModal = false,
        isFullScreenModal = false,
        shouldFadeScreen = false,
        shouldAnimateSidePanel = false,
        outputRangeMultiplier = 1,
    }) => {
        if (isOnboardingModal ? onboardingIsMediumOrLargerScreenWidth : shouldFadeScreen) {
            return {
                cardStyle: {opacity: progress},
            };
        }

        const translateX = Animated.multiply(
            progress.interpolate({
                inputRange: [0, 1],
                outputRange: [outputRangeMultiplier * (shouldUseNarrowLayout ? screen.width : variables.sideBarWidth), 0],
                extrapolate: 'clamp',
            }),
            inverted,
        );

        const cardStyle = StyleUtils.getCardStyles(screen.width);

        if (!isFullScreenModal || shouldUseNarrowLayout) {
            cardStyle.transform = [{translateX}];
        }

        if (shouldAnimateSidePanel) {
            cardStyle.paddingRight = sidePanelOffset.current;
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

export default useModalCardStyleInterpolator;
