import {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {setPageTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';

function useDocumentTitle(title: string) {
    useFocusEffect(
        useCallback(() => {
            setPageTitle(title);

            // Reset to default title when screen loses focus or unmounts
            return () => {
                setPageTitle('');
            };
        }, [title]),
    );
}

export default useDocumentTitle;
