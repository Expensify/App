import {useNavigation} from '@react-navigation/native';
import type {EventListenerCallback, EventMapCore, NavigationState} from '@react-navigation/native';
import {useEffect} from 'react';

const useBeforeRemove = (onBeforeRemove: EventListenerCallback<EventMapCore<NavigationState>, 'beforeRemove'>) => {
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', onBeforeRemove);
        return unsubscribe;
    }, [navigation, onBeforeRemove]);
};

export default useBeforeRemove;
