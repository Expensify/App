import {setPageTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';

import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';

function useDocumentTitle(title: string) {
    useFocusEffect(
        useCallback(() => {
            setPageTitle(title);
        }, [title]),
    );
}

export default useDocumentTitle;
