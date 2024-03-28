import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {useEffect, useState} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {RootStackParamList} from '@libs/Navigation/types';

type WithTransitionEndProps = {didScreenTransitionEnd: boolean};

export default function <TProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>): React.ComponentType<TProps & RefAttributes<TRef>> {
    function WithTransitionEnd(props: TProps, ref: ForwardedRef<TRef>) {
        const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
        const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

        useEffect(() => {
            const unsubscribeTransitionEnd = navigation.addListener('transitionEnd', () => {
                setDidScreenTransitionEnd(true);
            });

            return unsubscribeTransitionEnd;
            // eslint-disable-next-line react-hooks/exhaustive-deps
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

    WithTransitionEnd.displayName = `WithTransitionEnd(${getComponentDisplayName(WrappedComponent)})`;

    return WithTransitionEnd;
}

export type {WithTransitionEndProps};
