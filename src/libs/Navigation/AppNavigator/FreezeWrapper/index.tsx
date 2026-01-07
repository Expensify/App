import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Freeze} from 'react-freeze';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import getIsScreenBlurred from './getIsScreenBlurred';

function FreezeWrapper({children}: ChildrenProps) {
    const navigation = useNavigation();
    const currentRoute = useRoute();

    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    const [freezed, setFreezed] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e) => setIsScreenBlurred(getIsScreenBlurred(e.data.state, currentRoute.key)));
        return () => unsubscribe();
    }, [currentRoute.key, navigation]);

    // Decouple the Suspense render task so it won't be interrupted by React's concurrent mode
    // and stuck in an infinite loop
    useLayoutEffect(() => {
        setFreezed(isScreenBlurred);
    }, [isScreenBlurred]);

    return <Freeze freeze={freezed}>{children}</Freeze>;
}

export default FreezeWrapper;
