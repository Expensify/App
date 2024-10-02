import {useEffect} from 'react';
import {BackHandler} from 'react-native';
import type UseHandleBackButtonCallback from './type';

export default function useHandleBackButton(callback: UseHandleBackButtonCallback) {
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', callback);

        return () => backHandler.remove();
    }, [callback]);
}
