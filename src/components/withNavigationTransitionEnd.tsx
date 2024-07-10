import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {useEffect, useState} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {RootStackParamList} from '@libs/Navigation/types';

type WithNavigationTransitionEndProps = {didScreenTransitionEnd: boolean};

export default function <TProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>): React.ComponentType<TProps & RefAttributes<TRef>> {
    function WithNavigationTransitionEnd(props: TProps, ref: ForwardedRef<TRef>) {
        const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
        const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

        useEffect(() => {
            const unsubscribeTransitionEnd = navigation.addListener('transitionEnd', () => {
                setDidScreenTransitionEnd(true);
            });

            return unsubscribeTransitionEnd;
            // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        }, []);

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                didScreenTransitionEnd={didScreenTransitionEnd}
                ref={ref}
            />
        );
    }

    WithNavigationTransitionEnd.displayName = `WithNavigationTransitionEnd(${getComponentDisplayName(WrappedComponent)})`;

    return React.forwardRef(WithNavigationTransitionEnd);
}

export type {WithNavigationTransitionEndProps};
