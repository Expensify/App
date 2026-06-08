import {useEffect, useRef, useState} from 'react';
import Clipboard from '@libs/Clipboard';
import ROUTES from '@src/ROUTES';
import useEnvironment from './useEnvironment';

// Matches the success state duration in useThrottledButtonState used by ContextMenuItem
const SHARE_FEEDBACK_DURATION_MS = 1800;

// Matches the shouldDelay close timing in hideContextMenu (ReportActionContextMenu.ts)
const MENU_CLOSE_DELAY_MS = 800;

function useShareSavedSearch() {
    const {environmentURL} = useEnvironment();
    const [copiedHash, setCopiedHash] = useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current ?? undefined);
        };
    }, []);

    const handleShare = (itemHash: number, itemQuery: string) => {
        const url = `${environmentURL}/${ROUTES.SEARCH_ROOT.getRoute({query: itemQuery})}`;
        Clipboard.setString(url);
        setCopiedHash(itemHash);

        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setCopiedHash((prev) => (prev === itemHash ? null : prev));
            timeoutRef.current = null;
        }, SHARE_FEEDBACK_DURATION_MS);
    };

    return {copiedHash, handleShare};
}

export {MENU_CLOSE_DELAY_MS};
export default useShareSavedSearch;
