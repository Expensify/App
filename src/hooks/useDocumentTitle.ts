import {setPageTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';

import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';

/**
 * Identifies which screen currently owns the browser tab title. Every focus claims a new token, and a screen
 * only releases the title if it is still the owner. That way a cleanup that lands late can never wipe a title
 * a newer screen has already claimed, which is what made the previous blur cleanup unsafe
 * (see https://github.com/Expensify/App/pull/85473).
 */
let latestTitleToken = 0;

function useDocumentTitle(title: string) {
    const titleTokenRef = useRef(0);

    // Claim the title on focus rather than on mount. Preloaded screens are mounted in the React tree with
    // display: none, so setting the title on mount would let a preloaded tab overwrite the title of the tab the
    // user is actually looking at (see https://github.com/Expensify/App/pull/83388).
    useFocusEffect(
        useCallback(() => {
            latestTitleToken += 1;
            titleTokenRef.current = latestTitleToken;
            setPageTitle(title);
        }, [title]),
    );

    // Release the title on unmount rather than on blur. Pushing a sub-page that doesn't set a title (e.g. an RHP
    // opened from a workspace page) blurs this screen but keeps it mounted, so the parent page's title correctly
    // stays put. On sign-out the whole authenticated stack unmounts, nothing claims the title afterwards, and
    // updateDocumentTitle falls back to the default site title instead of staying stuck on the last page.
    useEffect(
        () => () => {
            if (!titleTokenRef.current || titleTokenRef.current !== latestTitleToken) {
                return;
            }
            const releasedToken = titleTokenRef.current;

            // Deferred on purpose. Some screens are replaced by a fresh instance of themselves rather than merely
            // blurred (e.g. picking a different search on the Spend page), and the outgoing instance unmounts before
            // the incoming one claims the title. Releasing synchronously would blank the title in between, so the tab
            // visibly flashes the default site title before settling back. Re-checking the token on the next tick
            // makes the release a no-op whenever anything has claimed the title in the meantime, and only actually
            // resets it when nothing takes over — which is exactly the sign-out case this reset exists for.
            setTimeout(() => {
                if (releasedToken !== latestTitleToken) {
                    return;
                }
                setPageTitle('');
            }, 0);
        },
        [],
    );
}

export default useDocumentTitle;
