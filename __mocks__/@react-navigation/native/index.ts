/* eslint-disable import/prefer-default-export, import/no-import-module-exports */
import type * as ReactNavigation from '@react-navigation/native';
import createAddListenerMock from '../../../tests/utils/createAddListenerMock';

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
    navigate: isJestEnv ? jest.fn() : () => {},
    getState: () => ({
        routes: [],
    }),
    addListener,
});

type NativeNavigationMock = typeof ReactNavigation & {
    triggerTransitionEnd: () => void;
};

export * from '@react-navigation/core';
const Link = isJestEnv ? realReactNavigation.Link : () => null;
const LinkingContext = isJestEnv ? realReactNavigation.LinkingContext : () => null;
const NavigationContainer = isJestEnv ? realReactNavigation.NavigationContainer : () => null;
const ServerContainer = isJestEnv ? realReactNavigation.ServerContainer : () => null;
const DarkTheme = isJestEnv ? realReactNavigation.DarkTheme : {};
const DefaultTheme = isJestEnv ? realReactNavigation.DefaultTheme : {};
const ThemeProvider = isJestEnv ? realReactNavigation.ThemeProvider : () => null;
const useLinkBuilder = isJestEnv ? realReactNavigation.useLinkBuilder : () => null;
const useLinkProps = isJestEnv ? realReactNavigation.useLinkProps : () => null;
const useLinkTo = isJestEnv ? realReactNavigation.useLinkTo : () => null;
const useScrollToTop = isJestEnv ? realReactNavigation.useScrollToTop : () => null;
export {
    // Overriden modules
    useIsFocused,
    useTheme,
    useNavigation,
    triggerTransitionEnd,

    // Theme modules are left alone
    Link,
    LinkingContext,
    NavigationContainer,
    ServerContainer,
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
    useLinkBuilder,
    useLinkProps,
    useLinkTo,
    useScrollToTop,
};

export type {NativeNavigationMock};
