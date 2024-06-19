import {createAddListenerMock} from '../../../tests/utils/TestHelper';

const isJestEnv = process.env.NODE_ENV === 'test';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const realReactNavigation = isJestEnv ? jest.requireActual<typeof import('@react-navigation/native')>('@react-navigation/native') : require('@react-navigation/native');

const useIsFocused = isJestEnv ? realReactNavigation.useIsFocused : () => true;
const useTheme = isJestEnv ? realReactNavigation.useTheme : () => ({});

const {triggerTransitionEnd, addListener} = isJestEnv
    ? createAddListenerMock()
    : {
          triggerTransitionEnd: realReactNavigation.triggerTransitionEnd,
          addListener: realReactNavigation.addListener,
      };

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
