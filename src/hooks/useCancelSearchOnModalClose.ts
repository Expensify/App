import {useNavigation} from '@react-navigation/native';
import {useEffect} from 'react';
import {READ_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';

const useCancelSearchOnModalClose = () => {
    const navigation = useNavigation();
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);
        });

        return unsubscribe;
    }, [navigation]);
};

export default useCancelSearchOnModalClose;
