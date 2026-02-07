import {useEffect} from 'react';
import {setPageTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';

/**
 * Custom hook to set the document title for a specific page
 * This will be combined with unread count when applicable
 * @param title - The page-specific title (e.g., "Settings - Subscription")
 */
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
