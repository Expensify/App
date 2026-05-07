import {NavigationContext} from '@react-navigation/core';
import type {EventListenerCallback, EventMapCore, NavigationState} from '@react-navigation/native';
import {useContext, useEffect} from 'react';

// beforeRemove have some limitations. When the react-navigation is upgraded to 7.x, update this to use usePreventRemove hook.
const useBeforeRemove = (onBeforeRemove: EventListenerCallback<EventMapCore<NavigationState>, 'beforeRemove'>) => {
    const navigation = useContext(NavigationContext);

    useEffect(() => {
        if (!navigation) {
            return;
        }
        const unsubscribe = navigation.addListener('beforeRemove', onBeforeRemove);
        return unsubscribe;
    }, [navigation, onBeforeRemove]);
};

export default useBeforeRemove;
