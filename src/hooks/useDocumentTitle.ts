import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {setPageTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';

function useDocumentTitle(title: string) {
    useFocusEffect(
        useCallback(() => {
            setPageTitle(title);

            return () => {
                setPageTitle('');
            };
        }, [title]),
    );
}

export default useDocumentTitle;
