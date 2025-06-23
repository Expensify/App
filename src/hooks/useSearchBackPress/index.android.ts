import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {BackHandler} from 'react-native';
import useOnyx from '@hooks/useOnyx';
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
                return true;
            };
            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => backHandler.remove();
        }, [selectionMode?.isEnabled, onClearSelection, onNavigationCallBack]),
    );
};

export default useSearchBackPress;
