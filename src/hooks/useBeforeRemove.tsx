import {useNavigation} from '@react-navigation/native';
import {useEffect} from 'react';

const useBeforeRemove = (onBeforeRemove: () => void) => {
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', onBeforeRemove);
        return unsubscribe;
    }, [navigation, onBeforeRemove]);
};

export default useBeforeRemove;
