const isJestEnv = process.env.NODE_ENV === 'test';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const realReactNavigation = isJestEnv ? jest.requireActual<typeof import('@react-navigation/native')>('@react-navigation/native') : require('@react-navigation/native');

const useIsFocused = isJestEnv ? realReactNavigation.useIsFocused : () => true;
const useTheme = isJestEnv ? realReactNavigation.useTheme : () => ({});

type Listener = () => void;
const transitionEndListeners: Listener[] = [];
const triggerTransitionEnd = isJestEnv
    ? () => {
          transitionEndListeners.forEach((transitionEndListener) => transitionEndListener());
      }
    : realReactNavigation.triggerTransitionEnd;

const addListener = isJestEnv
    ? jest.fn().mockImplementation((listener, callback: Listener) => {
          if (listener === 'transitionEnd') {
              transitionEndListeners.push(callback);
          }
          return () => {
              transitionEndListeners.filter((cb) => cb !== callback);
          };
      })
    : realReactNavigation.addListener;

const useNavigation = () => ({
    navigate: jest.fn(),
    ...realReactNavigation.useNavigation,
    getState: () => ({
        routes: [],
    }),
    addListener,
});

export * from '@react-navigation/core';
export {useIsFocused, useTheme, useNavigation, triggerTransitionEnd};
