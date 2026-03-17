import {useNavigation} from '@react-navigation/native';
import type {ComponentType} from 'react';
import React, {useEffect, useState} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';

type WithNavigationTransitionEndProps = {didScreenTransitionEnd: boolean};

export default function <TProps>(WrappedComponent: ComponentType<TProps>): React.ComponentType<TProps> {
    function WithNavigationTransitionEnd(props: TProps) {
        const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
        const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();

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
            />
        );
    }

    WithNavigationTransitionEnd.displayName = `WithNavigationTransitionEnd(${getComponentDisplayName(WrappedComponent)})`;

    return WithNavigationTransitionEnd;
}

export type {WithNavigationTransitionEndProps};
