import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {navigationRef} from '@libs/Navigation/Navigation';
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
                // Don't clear the title when blur is caused by a modal/RHP overlay opening
                // on top of the current screen. The central pane is still visible behind
                // the overlay, so the title should remain. Only clear when navigating to
                // a different full-screen route (e.g., switching tabs).
                const topmostRoute = navigationRef?.getRootState()?.routes?.at(-1);
                if (topmostRoute && !isFullScreenName(topmostRoute.name)) {
                    return;
                }
                setPageTitle('');
            };
        }, [title]),
    );
}

export default useDocumentTitle;
