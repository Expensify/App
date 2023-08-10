import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.node.isRequired,
};

const defaultProps = {};

const PopoverContext = React.createContext({
    onOpen: () => {},
    popover: {},
    close: () => {},
    isOpen: false,
});

function PopoverContextProvider(props) {
    const [isOpen, setIsOpen] = React.useState(false);
    const activePopoverRef = React.useRef(null);

    const closePopover = React.useCallback((anchorRef) => {
        if (!activePopoverRef.current || (anchorRef && anchorRef !== activePopoverRef.current.anchorRef)) {
            return;
        }
        activePopoverRef.current.close();
        activePopoverRef.current = null;
        setIsOpen(false);
    }, []);

    React.useEffect(() => {
        const listener = (e) => {
            if (
                !activePopoverRef.current ||
                !activePopoverRef.current.ref ||
                !activePopoverRef.current.ref.current ||
                activePopoverRef.current.ref.current.contains(e.target) ||
                (activePopoverRef.current.anchorRef && activePopoverRef.current.anchorRef.current && activePopoverRef.current.anchorRef.current.contains(e.target))
            ) {
                return;
            }
            const ref = activePopoverRef.current.anchorRef;
            closePopover(ref);
        };
        document.addEventListener('click', listener, true);
        return () => {
            document.removeEventListener('click', listener, true);
        };
    }, [closePopover]);

    React.useEffect(() => {
        const listener = () => {
            closePopover();
        };
        document.addEventListener('contextmenu', listener);
        return () => {
            document.removeEventListener('contextmenu', listener);
        };
    }, [closePopover]);

    React.useEffect(() => {
        const listener = (e) => {
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
        const listener = (e) => {
            if (activePopoverRef.current && activePopoverRef.current.ref && activePopoverRef.current.ref.current && activePopoverRef.current.ref.current.contains(e.target)) {
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
        (popoverParams) => {
            if (activePopoverRef.current && activePopoverRef.current.ref !== popoverParams.ref) {
                closePopover(activePopoverRef.current.anchorRef);
            }
            activePopoverRef.current = popoverParams;
            setIsOpen(true);
        },
        [closePopover],
    );

    return (
        <PopoverContext.Provider
            value={{
                onOpen,
                close: closePopover,
                popover: activePopoverRef.current,
                isOpen,
            }}
        >
            {props.children}
        </PopoverContext.Provider>
    );
}

PopoverContextProvider.defaultProps = defaultProps;
PopoverContextProvider.propTypes = propTypes;
PopoverContextProvider.displayName = 'PopoverContextProvider';

export default PopoverContextProvider;

export {PopoverContext};
