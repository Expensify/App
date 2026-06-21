import {useEffect, useRef} from 'react';
import {useIsModalCovering} from '@components/Overlay/hooks/useOverlaySelectors';
import usePreviousRenderValue from '@components/Overlay/hooks/usePreviousRenderValue';
import {useRoot} from '@components/PopoverMenu/v2/root/RootContext';
import useCallbackRef from '@hooks/useCallbackRef';
import type {ContentContextValue} from './ContentContext';
import useCloseOnScreenBlur from './useCloseOnScreenBlur';
import useFocusableRegistry from './useFocusableRegistry';
import useSubNavigation from './useSubNavigation';

function useContentController(componentName: string): ContentContextValue {
    const {state, actions} = useRoot(componentName);
    const {isOpen} = state;
    const {close: closeRoot} = actions;

    const focus = useFocusableRegistry({isOpen});
    const subNav = useSubNavigation({onLevelChange: focus.resetFocus});

    const exitSub = useCallbackRef(subNav.actions.exitSub);
    const wasOpen = usePreviousRenderValue(isOpen, isOpen);
    useEffect(() => {
        if (wasOpen || !isOpen) {
            return;
        }
        exitSub(null);
    }, [isOpen, wasOpen, exitSub]);

    const close = useCallbackRef(() => {
        closeRoot();
    });

    const isCovered = useIsModalCovering();
    const prevIsCoveredRef = useRef(isCovered);
    useEffect(() => {
        const justBecameCovered = !prevIsCoveredRef.current && isCovered;
        prevIsCoveredRef.current = isCovered;
        if (justBecameCovered && isOpen) {
            close();
        }
    }, [isCovered, isOpen, close]);

    useCloseOnScreenBlur(close, isOpen);

    return {
        state: {
            focusedID: focus.focusedID,
            currentSubID: subNav.currentSubID,
            isAncestorOfCurrent: subNav.isAncestorOfCurrent,
        },
        actions: {
            enterSub: subNav.actions.enterSub,
            exitSub: subNav.actions.exitSub,
            registerSub: subNav.actions.registerSub,
            unregisterSub: subNav.actions.unregisterSub,
            registerItem: focus.actions.registerItem,
            unregisterItem: focus.actions.unregisterItem,
            setFocusedID: focus.actions.setFocusedID,
            close,
        },
    };
}

export default useContentController;
