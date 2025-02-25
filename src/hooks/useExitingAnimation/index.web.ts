import {useMemo} from 'react';
import {Easing, Keyframe} from 'react-native-reanimated';
import type UseExitingAnimation from './type';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0);

/**
 * Due to issues with react-native-reanimated Keyframes the easing type doesn't account for bezier functions
 * and we also need to use internal .build() function to make the easing apply on each mount.
 *
 * This causes problems with both eslint & Typescript and is going to be fixed in react-native-reanimated 3.17 with these PRs merged:
 * https://github.com/software-mansion/react-native-reanimated/pull/6960
 * https://github.com/software-mansion/react-native-reanimated/pull/6958
 *
 * Once that's added we can apply our changes to files in BottomDockedModal/Backdrop/*.tsx and BottomDockedModal/Container/*.tsx
 */

const useExitingAnimation: UseExitingAnimation = (height: number) => {
    const Exiting = useMemo(() => {
        const SlideOut = new Keyframe({
            from: {
                height,
            },
            to: {
                height: '0',
                // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
                easing,
            },
        });

        return SlideOut.duration(300);
    }, [height]);

    return Exiting;
};

export default useExitingAnimation;
