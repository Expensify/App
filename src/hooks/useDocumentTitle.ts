import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {clearPageTitle, setPageTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';

function useDocumentTitle(title: string) {
    useFocusEffect(
        useCallback(() => {
            setPageTitle(title);
            return () => clearPageTitle();
        }, [title]),
    );
}

export default useDocumentTitle;
