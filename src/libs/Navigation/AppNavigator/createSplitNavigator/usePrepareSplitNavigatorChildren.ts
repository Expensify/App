import type {StackNavigationOptions} from '@react-navigation/stack';
import {Children, isValidElement, useMemo} from 'react';
import type {ReactNode} from 'react';

export default function usePrepareSplitNavigatorChildren(screensNode: ReactNode, sidebarScreenName: string, sidebarScreenOptions: StackNavigationOptions) {
    return useMemo(
        () =>
            Children.toArray(screensNode).map((screen: ReactNode) => {
                if (isValidElement(screen) && screen?.props?.name === sidebarScreenName) {
                    // If we found the element we wanted, clone it with the provided prop changes.
                    return {
                        ...screen,
                        props: {
                            ...screen.props,
                            options: sidebarScreenOptions,
                        },
                    };
                }
                return screen;
            }),
        [screensNode, sidebarScreenName, sidebarScreenOptions],
    );
}
