import React from 'react';
import {AnchorRef, PopoverContextProps, PopoverContextValue} from './types';

const PopoverContext = React.createContext<PopoverContextValue>({
    onOpen: () => {},
    popover: {},
    close: () => {},
    isOpen: false,
});

function PopoverContextProvider(props: PopoverContextProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const activePopoverRef = React.useRef<AnchorRef | null>(null);

    const closePopover = React.useCallback((anchorRef?: React.RefObject<HTMLElement>) => {
        if (!activePopoverRef.current || (anchorRef && anchorRef !== activePopoverRef.current.anchorRef)) {
            return;
        }

        activePopoverRef.current.close();
        if (activePopoverRef.current.onCloseCallback) {
            activePopoverRef.current.onCloseCallback();
        }
        activePopoverRef.current = null;
        setIsOpen(false);
    }, []);

    React.useEffect(() => {
        const listener = (e: Event) => {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (activePopoverRef.current?.ref?.current?.contains(e.target as Node) || activePopoverRef.current?.anchorRef?.current?.contains(e.target as Node)) {
                return;
            }
            const ref = activePopoverRef.current?.anchorRef;
            closePopover(ref);
        };
        document.addEventListener('click', listener, true);
        return () => {
            document.removeEventListener('click', listener, true);
        };
    }, [closePopover]);

    React.useEffect(() => {
        const listener = (e: Event) => {
            if (activePopoverRef.current?.ref?.current?.contains(e.target as Node)) {
                return;
            }
            closePopover();
        };
        document.addEventListener('contextmenu', listener);
        return () => {
            document.removeEventListener('contextmenu', listener);
        };
    }, [closePopover]);

    React.useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') {
                return;
            }
            closePopover();
        };
        document.addEventListener('keydown', listener, true);
        return () => {
            document.removeEventListener('keydown', listener, true);
        };
    }, [closePopover]);

    React.useEffect(() => {
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

    React.useEffect(() => {
        const listener = (e: Event) => {
            if (activePopoverRef.current?.ref?.current?.contains(e.target as Node)) {
                return;
            }

            closePopover();
        };
        document.addEventListener('scroll', listener, true);
        return () => {
            document.removeEventListener('scroll', listener, true);
        };
    }, [closePopover]);

    const onOpen = React.useCallback(
        (popoverParams: AnchorRef) => {
            if (activePopoverRef.current && activePopoverRef.current.ref !== popoverParams?.ref) {
                closePopover(activePopoverRef.current.anchorRef);
            }
            activePopoverRef.current = popoverParams;
            if (popoverParams?.onOpenCallback) {
                popoverParams.onOpenCallback();
            }
            setIsOpen(true);
        },
        [closePopover],
    );

    const contextValue = React.useMemo(
        () => ({
            onOpen,
            close: closePopover,
            popover: activePopoverRef.current,
            isOpen,
        }),
        [onOpen, closePopover, isOpen],
    );

    return <PopoverContext.Provider value={contextValue}>{props.children}</PopoverContext.Provider>;
}

PopoverContextProvider.displayName = 'PopoverContextProvider';

export default PopoverContextProvider;

export {PopoverContext};
