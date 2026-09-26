import {useEffect} from 'react';

import {useStoryRouter} from './storyRouter';

const noop = () => {};

const staticRoute = {key: 'story', name: 'StoryFlow', params: {}};
const staticNavigation = {
    navigate: noop,
    goBack: noop,
    setParams: noop,
    canGoBack: () => false,
    getState: () => ({routes: []}),
    isFocused: () => true,
    addListener: () => noop,
};

/** Inside a StoryRouterProvider the route comes from the story's stack; elsewhere no story mounts a navigator */
function useRoute() {
    const router = useStoryRouter();
    return router ? {...staticRoute, params: router.current} : staticRoute;
}

function useNavigation() {
    const router = useStoryRouter();
    if (!router) {
        return staticNavigation;
    }
    return {...staticNavigation, setParams: router.setParams, goBack: router.pop, canGoBack: () => true};
}

const useIsFocused = () => true;
const useTheme = () => ({});
const useLocale = () => ({});
const useNavigationState = () => undefined;
const usePreventRemove = noop;
const triggerTransitionEnd = noop;
const useFocusEffect = (callback: () => (() => void) | void) => {
    useEffect(() => callback(), [callback]);
};
function Link() {
    return null;
}
function LinkingContext() {
    return null;
}
function NavigationContainer() {
    return null;
}
function ServerContainer() {
    return null;
}
function ThemeProvider() {
    return null;
}
const DarkTheme = {};
const DefaultTheme = {};
const useLinkBuilder = () => null;
const useLinkProps = () => null;
const useLinkTo = () => null;
const useScrollToTop = () => null;

// Everything a story does not override comes from the navigation core, as in the Jest mock this replaces
export * from '@react-navigation/core';
export {
    useRoute,
    useNavigation,
    useIsFocused,
    useTheme,
    useLocale,
    useNavigationState,
    usePreventRemove,
    triggerTransitionEnd,
    useFocusEffect,
    Link,
    LinkingContext,
    NavigationContainer,
    ServerContainer,
    ThemeProvider,
    DarkTheme,
    DefaultTheme,
    useLinkBuilder,
    useLinkProps,
    useLinkTo,
    useScrollToTop,
};
