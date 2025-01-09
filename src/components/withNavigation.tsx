import type {NavigationProp} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

type WithNavigationProps = {
    navigation: NavigationProp<RootNavigatorParamList>;
};

export default function withNavigation<TProps extends WithNavigationProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: Omit<TProps, keyof WithNavigationProps>, ref: ForwardedRef<TRef>) => React.JSX.Element | null {
    function WithNavigation(props: Omit<TProps, keyof WithNavigationProps>, ref: ForwardedRef<TRef>) {
        const navigation = useNavigation();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                ref={ref}
                navigation={navigation}
            />
        );
    }

    WithNavigation.displayName = `withNavigation(${getComponentDisplayName(WrappedComponent)})`;
    return React.forwardRef(WithNavigation);
}
