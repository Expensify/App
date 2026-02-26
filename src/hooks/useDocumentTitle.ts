import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {getPageTitle, setPageTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';

function useDocumentTitle(title: string) {
    useFocusEffect(
        useCallback(() => {
            setPageTitle(title);

            return () => {
                // Only clear the title if no other screen has already set a new one.
                // When switching between Settings sub-pages, the new screen's useFocusEffect
                // fires before this cleanup runs (due to React's child-before-parent effect
                // ordering), so currentPageTitle will already be the new screen's title.
                if (getPageTitle() !== title) {
                    return;
                }
                setPageTitle('');
            };
        }, [title]),
    );
}

export default useDocumentTitle;
