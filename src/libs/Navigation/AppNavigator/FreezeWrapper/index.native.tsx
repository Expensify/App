import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Freeze} from 'react-freeze';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import getIsScreenBlurred from './getIsScreenBlurred';

function FreezeWrapper({children}: ChildrenProps) {
    const navigation = useNavigation();
    const currentRoute = useRoute();

    const [isScreenBlurred, setIsScreenBlurred] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e) => setIsScreenBlurred(getIsScreenBlurred(e.data.state, currentRoute.key)));
        return () => unsubscribe();
    }, [currentRoute.key, navigation]);

    return <Freeze freeze={isScreenBlurred}>{children}</Freeze>;
}

export default FreezeWrapper;
