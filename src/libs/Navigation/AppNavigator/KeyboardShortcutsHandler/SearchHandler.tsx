import {useEffect} from 'react';
import {useSearchRouterActions} from '@components/Search/SearchRouter/SearchRouterContext';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';

type SearchHandlerProps = {
    shouldShowRequire2FAPage: boolean;
};

function SearchHandler({shouldShowRequire2FAPage}: SearchHandlerProps) {
    const {toggleSearch} = useSearchRouterActions();

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.SEARCH;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                Session.callFunctionIfActionIsAllowed(() => {
                    if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                        return;
                    }
                    toggleSearch();
                })();
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
