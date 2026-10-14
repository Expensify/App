import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

import useIsInLandscapeMode from './useIsInLandscapeMode';

/**
 * For a full-page selector that a form opened in place of its list because the phone was in landscape. Once the phone
 * is back in portrait, goes back to the form, which reopens the list there.
 */
function useCloseInPortrait(shouldCloseInPortrait: boolean | undefined, backPath: Route) {
    const isInLandscapeMode = useIsInLandscapeMode();
    const isFocused = useIsFocused();
    // Goes back once only, since a second call would also close the form behind this page.
    const didCloseRef = useRef(false);

    useEffect(() => {
        if (!shouldCloseInPortrait || isInLandscapeMode || !isFocused || didCloseRef.current) {
            return;
        }
        didCloseRef.current = true;
        Navigation.goBack(backPath);
    }, [shouldCloseInPortrait, isInLandscapeMode, isFocused, backPath]);
}

export default useCloseInPortrait;
