import type {RefObject} from 'react';
import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text, View} from 'react-native';
import type {AnchorRef, PopoverContextProps, PopoverContextValue} from './types';

const PopoverContext = createContext<PopoverContextValue>({
    onOpen: () => {},
    popover: null,
    popoverAnchor: null,
    close: () => {},
    isOpen: false,
    setActivePopoverExtraAnchorRef: () => {},
});

function elementContains(ref: RefObject<View | HTMLElement | Text | null> | undefined, target: EventTarget | null) {
    if (ref?.current && 'contains' in ref.current && ref?.current?.contains(target as Node)) {
        return true;
    }
    return false;
}

function PopoverContextProvider(props: PopoverContextProps) {
    const [isOpen, setIsOpen] = useState(false);
    const activePopoverRef = useRef<AnchorRef | null>(null);
    const [activePopoverAnchor, setActivePopoverAnchor] = useState<AnchorRef['anchorRef']['current'] | null>(null);
    const [activePopoverExtraAnchorRefs, setActivePopoverExtraAnchorRefs] = useState<AnchorRef['extraAnchorRefs']>([]);

    const closePopover = useCallback((anchorRef?: RefObject<View | HTMLElement | Text | null>): boolean => {
        if (!activePopoverRef.current || (anchorRef && anchorRef !== activePopoverRef.current.anchorRef)) {
            return false;
        }

        activePopoverRef.current.close();
        activePopoverRef.current = null;
        setIsOpen(false);
        setActivePopoverAnchor(null);
        return true;
    }, []);

    useEffect(() => {
        const listener = (e: Event) => {
            if (elementContains(activePopoverRef.current?.ref, e.target) || elementContains(activePopoverRef.current?.anchorRef, e.target)) {
                return;
            }
            // In case there are any extra anchor refs where the popover should not close on click
            // for example, the case when the QAB tooltip is clicked it closes the popover this will prevent that
            if (activePopoverExtraAnchorRefs?.some((ref: RefObject<View | HTMLElement | Text | null>) => elementContains(ref, e.target))) {
                return;
            }
            const ref = activePopoverRef.current?.anchorRef;
            closePopover(ref);
        };
        document.addEventListener('click', listener, true);
        return () => {
            document.removeEventListener('click', listener, true);
        };
    }, [closePopover, activePopoverExtraAnchorRefs]);

    useEffect(() => {
        const listener = (e: Event) => {
            if (elementContains(activePopoverRef.current?.ref, e.target)) {
                return;
            }
            closePopover();
        };
        document.addEventListener('contextmenu', listener);
        return () => {
            document.removeEventListener('contextmenu', listener);
        };
    }, [closePopover]);

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') {
                return;
            }
            if (closePopover()) {
                e.stopImmediatePropagation();
            }
        };
        document.addEventListener('keyup', listener, true);
        return () => {
            document.removeEventListener('keyup', listener, true);
        };
    }, [closePopover]);

    useEffect(() => {
        const listener = () => {
            if (document.hasFocus()) {
                return;
            }
            closePopover();
        };
        document.addEventListener('visibilitychange', listener);
        return () => {
            document.removeEventListener('visibilitychange', listener);
        };
    }, [closePopover]);

    useEffect(() => {
        const listener = (e: Event) => {
            if (elementContains(activePopoverRef.current?.ref, e.target)) {
                return;
            }

            closePopover();
        };
        document.addEventListener('wheel', listener, true);
        return () => {
            document.removeEventListener('wheel', listener, true);
        };
    }, [closePopover]);

    const onOpen = useCallback(
        (popoverParams: AnchorRef) => {
            if (activePopoverRef.current && activePopoverRef.current.ref !== popoverParams?.ref) {
                closePopover(activePopoverRef.current.anchorRef);
            }
            activePopoverRef.current = popoverParams;
            setActivePopoverAnchor(popoverParams.anchorRef.current);
            setIsOpen(true);
        },
        [closePopover],
    );

    // To set the extra anchor refs for the popover when prop-drilling is not possible
    const setActivePopoverExtraAnchorRef = useCallback((extraAnchorRef?: RefObject<View | HTMLDivElement | Text | null>) => {
        if (!extraAnchorRef) {
            return;
        }
        setActivePopoverExtraAnchorRefs((prev: AnchorRef['extraAnchorRefs']) => {
            if (!prev) {
                return [extraAnchorRef];
            }

            if (prev?.includes(extraAnchorRef)) {
                return prev;
            }
            return [...prev, extraAnchorRef];
        });
    }, []);

    const contextValue = useMemo(
        () => ({
            onOpen,
            setActivePopoverExtraAnchorRef,
            close: closePopover,
            popover: activePopoverRef.current,
            popoverAnchor: activePopoverAnchor,
            isOpen,
        }),
        [onOpen, closePopover, isOpen, activePopoverAnchor, setActivePopoverExtraAnchorRef],
    );

    return <PopoverContext.Provider value={contextValue}>{props.children}</PopoverContext.Provider>;
}

export default PopoverContextProvider;

export {PopoverContext};
