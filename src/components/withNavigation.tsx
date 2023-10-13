import React, {ComponentType, ForwardedRef, RefAttributes} from 'react';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import getComponentDisplayName from '../libs/getComponentDisplayName';

type WithNavigationProps = {
    navigation: NavigationProp<ReactNavigation.RootParamList>;
};

export default function withNavigation<TProps extends WithNavigationProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
    function WithNavigation(props: Omit<TProps, keyof WithNavigationProps>, ref: ForwardedRef<TRef>) {
        const navigation = useNavigation();
        return (
            <WrappedComponent
                {...(props as TProps)}
                ref={ref}
                navigation={navigation}
            />
        );
    }

    WithNavigation.displayName = `withNavigation(${getComponentDisplayName(WrappedComponent)})`;
    return React.forwardRef(WithNavigation);
}
