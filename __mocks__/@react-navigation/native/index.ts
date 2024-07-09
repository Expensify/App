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
    navigate: jest.fn(),
    getState: () => ({
        routes: [],
    }),
    addListener,
});

type NativeNavigationMock = typeof ReactNavigation & {
    triggerTransitionEnd: () => void;
};

export * from '@react-navigation/core';
const Link = realReactNavigation.Link;
const LinkingContext = realReactNavigation.LinkingContext;
const NavigationContainer = realReactNavigation.NavigationContainer;
const ServerContainer = realReactNavigation.ServerContainer;
const DarkTheme = realReactNavigation.DarkTheme;
const DefaultTheme = realReactNavigation.DefaultTheme;
const ThemeProvider = realReactNavigation.ThemeProvider;
const useLinkBuilder = realReactNavigation.useLinkBuilder;
const useLinkProps = realReactNavigation.useLinkProps;
const useLinkTo = realReactNavigation.useLinkTo;
const useScrollToTop = realReactNavigation.useScrollToTop;
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
