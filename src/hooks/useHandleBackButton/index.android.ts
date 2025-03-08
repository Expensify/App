import {useFocusEffect} from '@react-navigation/native';
import {BackHandler} from 'react-native';
import type UseHandleBackButtonCallback from './type';

export default function useHandleBackButton(callback: UseHandleBackButtonCallback) {
    useFocusEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', callback);

        return () => backHandler.remove();
    });
}
