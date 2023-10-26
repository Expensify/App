import React, {ComponentType, ForwardedRef, RefAttributes} from 'react';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import getComponentDisplayName from '../libs/getComponentDisplayName';

type WithNavigationProps = {
    navigation: NavigationProp<ReactNavigation.RootParamList>;
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
