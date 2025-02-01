import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {BackHandler} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import ONYXKEYS from '@src/ONYXKEYS';
import type UseSearchBackPress from './types';

const useSearchBackPress: UseSearchBackPress = ({onClearSelection, onNavigationCallBack}) => {
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (selectionMode?.isEnabled) {
                    onClearSelection();
                    turnOffMobileSelectionMode();
                    return true;
                }
                onNavigationCallBack();
                return false;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [selectionMode, onClearSelection, onNavigationCallBack]),
    );
};

export default useSearchBackPress;
