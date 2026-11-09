import {useSearchRouterActions} from '@components/Search/SearchRouter/SearchRouterContext';

import useOnyx from '@hooks/useOnyx';
import useShouldShowRequire2FAPage from '@hooks/useShouldShowRequire2FAPage';

import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';

import * as Session from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';
import {useEffect, useRef} from 'react';

function SearchHandler() {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    // The shortcut callback below is registered once, so read the latest session from a ref at fire time.
    const sessionRef = useRef(session);

    useEffect(() => {
        sessionRef.current = session;
    }, [session]);
    const {toggleSearch} = useSearchRouterActions();
    const shouldShowRequire2FAPage = useShouldShowRequire2FAPage();

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.SEARCH;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                Session.callFunctionIfActionIsAllowed(
                    () => {
                        if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                            return;
                        }
                        toggleSearch();
                    },
                    false,
                    sessionRef.current,
                )();
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
        );

        return () => unsubscribe();
        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default SearchHandler;
