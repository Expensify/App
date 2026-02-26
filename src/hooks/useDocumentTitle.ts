import {useEffect} from 'react';
import {setPageTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';

function useDocumentTitle(title: string) {
    useEffect(() => {
        setPageTitle(title);

        // Reset to default title when component unmounts
        return () => {
            setPageTitle('');
        };
    }, [title]);
}

export default useDocumentTitle;
