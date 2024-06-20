import type * as ReactNavigation from '@react-navigation/native';
import {createAddListenerMock} from '../../../tests/utils/TestHelper';

const isJestEnv = process.env.NODE_ENV === 'test';

const realReactNavigation = isJestEnv ? jest.requireActual<typeof ReactNavigation>('@react-navigation/native') : (require('@react-navigation/native') as typeof ReactNavigation);

const useIsFocused = isJestEnv ? realReactNavigation.useIsFocused : () => true;
const useTheme = isJestEnv ? realReactNavigation.useTheme : () => ({});

const {triggerTransitionEnd, addListener} = isJestEnv
    ? createAddListenerMock()
    : {
          triggerTransitionEnd: () => {},
          addListener: () => {},
      };

const useNavigation = () => ({
    ...realReactNavigation.useNavigation,
    navigate: jest.fn(),
    getState: () => ({
        routes: [],
    }),
    addListener,
});

export * from '@react-navigation/core';
export {useIsFocused, useTheme, useNavigation, triggerTransitionEnd};
