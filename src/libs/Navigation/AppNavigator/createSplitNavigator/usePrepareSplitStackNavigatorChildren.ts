import type {EventMapBase, NavigationState, ParamListBase, RouteConfig} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {Children, isValidElement, useMemo} from 'react';
import type {ReactNode} from 'react';

export default function usePrepareSplitNavigatorChildren(screensNode: ReactNode, sidebarScreenName: string, sidebarScreenOptions: StackNavigationOptions) {
    return useMemo(
        () =>
            Children.toArray(screensNode).map((screen: ReactNode) => {
                if (!isValidElement(screen)) {
                    return screen;
                }

                const screenProps = screen?.props as RouteConfig<ParamListBase, keyof ParamListBase, NavigationState, Record<string, string | undefined>, EventMapBase>;

                if (screenProps?.name === sidebarScreenName) {
                    // If we found the element we wanted, clone it with the provided prop changes.
                    return {
                        ...screen,
                        props: {
                            ...screenProps,
                            options: {...sidebarScreenOptions, ...screenProps.options},
                        },
                    };
                }
                return screen;
            }),
        [screensNode, sidebarScreenName, sidebarScreenOptions],
    );
}
