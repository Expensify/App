import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {BackHandler} from 'react-native';
import type UseAndroidBackButtonHandlerCallback from './type';

export default function useAndroidBackButtonHandler(callback: UseAndroidBackButtonHandlerCallback) {
    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', callback);
            return () => backHandler.remove();
        }, [callback]),
    );
}
