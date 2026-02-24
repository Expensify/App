import {useNavigation} from '@react-navigation/native';
import type {EventListenerCallback, EventMapCore, NavigationState} from '@react-navigation/native';
import {useEffect} from 'react';

// beforeRemove have some limitations. When the react-navigation is upgraded to 7.x, update this to use usePreventRemove hook.
const useBeforeRemove = (onBeforeRemove: EventListenerCallback<EventMapCore<NavigationState>, 'beforeRemove'>, isEnabled = true) => {
    const navigation = useNavigation();

    useEffect(() => {
        if (!isEnabled) {
            return undefined;
        }
        const unsubscribe = navigation.addListener('beforeRemove', onBeforeRemove);
        return unsubscribe;
    }, [navigation, onBeforeRemove, isEnabled]);
};

export default useBeforeRemove;
