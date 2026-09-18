// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

// The alias points the package name at this file, so the real module has to be reached by path, which has no declaration
// @ts-expect-error -- see above
// eslint-disable-next-line import/no-relative-packages
export * from '../../node_modules/@react-navigation/stack/lib/module/index.js';

const presented = new Animated.Value(1);
const idle = new Animated.Value(0);

/** No story mounts a stack screen, so every modal is treated as fully presented */
function useCardAnimation() {
    return {
        current: {progress: presented},
        next: undefined,
        closing: idle,
        swiping: idle,
        inverted: presented,
        index: 0,
        layouts: {screen: {width: 0, height: 0}},
        insets: {top: 0, right: 0, bottom: 0, left: 0},
    };
}

export {useCardAnimation};
