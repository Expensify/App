import type {ReactNode} from 'react';

import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';

type StoryRouteParams = {subPage?: string; action?: 'edit'};

type StoryRouter = {
    current: StoryRouteParams;
    push: (params: StoryRouteParams) => void;
    replace: (params: StoryRouteParams) => void;
    pop: () => boolean;
    setParams: (params: StoryRouteParams) => void;
};

type ActiveStoryRouter = {routePrefix: string; api: StoryRouter};

const StoryRouterContext = createContext<StoryRouter | undefined>(undefined);

let activeStoryRouter: ActiveStoryRouter | undefined;

/** A one-screen stack for stories: the App's navigation hooks and helpers read and write it while a story is mounted */
function StoryRouterProvider({routePrefix, initialParams = {}, children}: {routePrefix: string; initialParams?: StoryRouteParams; children: ReactNode}) {
    const [stack, setStack] = useState<StoryRouteParams[]>([initialParams]);
    const stackRef = useRef(stack);
    useEffect(() => {
        stackRef.current = stack;
    }, [stack]);

    const api = useMemo<StoryRouter>(
        () => ({
            current: stack.at(-1) ?? {},
            push: (params) => setStack((previous) => [...previous, params]),
            replace: (params) => setStack((previous) => [...previous.slice(0, -1), params]),
            pop: () => {
                if (stackRef.current.length <= 1) {
                    return false;
                }
                setStack((previous) => previous.slice(0, -1));
                return true;
            },
            setParams: (params) => setStack((previous) => [...previous.slice(0, -1), {...previous.at(-1), ...params}]),
        }),
        [stack],
    );

    useEffect(() => {
        activeStoryRouter = {routePrefix, api};
        return () => {
            activeStoryRouter = undefined;
        };
    }, [routePrefix, api]);

    return <StoryRouterContext.Provider value={api}>{children}</StoryRouterContext.Provider>;
}

function useStoryRouter(): StoryRouter | undefined {
    return useContext(StoryRouterContext);
}

function getActiveStoryRouter(): ActiveStoryRouter | undefined {
    return activeStoryRouter;
}

/** Reads `subPage` and `action` back out of a route the story's route builder produced */
function parseStoryRoute(routePrefix: string, route: string): StoryRouteParams {
    const path = route.split('?').at(0) ?? '';
    const rest = path.startsWith(routePrefix) ? path.slice(routePrefix.length) : path;
    const [subPage, action] = rest.split('/').filter(Boolean);
    return {subPage, action: action === 'edit' ? 'edit' : undefined};
}

type NavigationLike = {
    navigate: (route: string, options?: {forceReplace?: boolean}) => void;
    goBack: (backToRoute?: string, options?: unknown) => void;
};

/** Wraps the App's Navigation object so that, while a story router is mounted, navigation lands on its stack */
function withStoryRouter<T extends NavigationLike>(navigation: T): T {
    const navigate: NavigationLike['navigate'] = (route, options) => {
        const router = getActiveStoryRouter();
        if (!router) {
            navigation.navigate(route, options);
            return;
        }
        const params = parseStoryRoute(router.routePrefix, route);
        if (options?.forceReplace) {
            router.api.replace(params);
            return;
        }
        router.api.push(params);
    };
    const goBack: NavigationLike['goBack'] = (backToRoute, options) => {
        const router = getActiveStoryRouter();
        if (!router) {
            navigation.goBack(backToRoute, options);
            return;
        }
        if (!router.api.pop() && backToRoute) {
            router.api.replace(parseStoryRoute(router.routePrefix, backToRoute));
        }
    };
    return {...navigation, navigate, goBack};
}

export {StoryRouterProvider, useStoryRouter, getActiveStoryRouter, parseStoryRoute, withStoryRouter};
export type {StoryRouteParams};
