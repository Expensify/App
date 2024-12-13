import {act, renderHook} from '@testing-library/react-native';
import {advanceAnimationByTime} from 'react-native-reanimated';
import useButtonAnimation from '@hooks/useButtonAnimation';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

describe('useButtonAnimation', () => {
    const defaultProps = {
        isRunning: false,
        onFinish: jest.fn(),
        buttonInitialScale: 1,
        buttonTargetScale: 0.5,
        buttonInitialOpacity: 1,
        buttonTargetOpacity: 0.5,
        containerInitialHeight: 100,
        containerTargetHeight: 0,
        containerInitialMarginTop: 10,
        containerTargetMarginTop: 0,
        textInitialScale: 0,
        textTargetScale: 1,
        textInitialOpacity: 0.5,
        textTargetOpacity: 1,
        delay: 2000,
        duration: 500,
    };

    it('should return default animated styles and resetAnimation function', () => {
        const {result} = renderHook(() => useButtonAnimation(defaultProps));

        expect(result.current.animatedButtonStyles).toBeDefined();
        expect(result.current.animatedContainerStyles).toBeDefined();
        expect(result.current.animatedTextStyles).toBeDefined();
        expect(result.current.resetAnimation).toBeInstanceOf(Function);
    });

    it('should reset animation values when resetAnimation is called', () => {
        const {result} = renderHook(() => useButtonAnimation(defaultProps));

        act(() => {
            result.current.resetAnimation();
        });

        // expect(result.current.animatedButtonStyles?.transform?.[0]?.scale).toEqual(defaultProps.buttonInitialScale);
        expect(result.current.animatedTextStyles.opacity).toEqual(defaultProps.textInitialOpacity);
        expect(result.current.animatedContainerStyles.height).toEqual(defaultProps.containerInitialHeight);
    });
    it('should animate values when isRunning is true', () => {
        const {result, rerender} = renderHook((props) => useButtonAnimation(props), {
            initialProps: {...defaultProps, isRunning: false},
        });

        rerender({...defaultProps, isRunning: true});

        expect(result.current.animatedTextStyles.opacity).toEqual(defaultProps.textTargetOpacity);
        expect(result.current.animatedContainerStyles.height).toEqual(defaultProps.containerTargetHeight);
    });

    it('should call onFinish callback after animation is complete', () => {
        const {rerender} = renderHook((props) => useButtonAnimation(props), {
            initialProps: {...defaultProps, isRunning: false},
        });

        rerender({...defaultProps, isRunning: true});
        advanceAnimationByTime(defaultProps.delay + defaultProps.duration);

        expect(defaultProps.onFinish).toHaveBeenCalled();
    });
});
