import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    // eslint-disable-next-line
    children: PropTypes.any,
};

const defaultProps = {};

const PopoverContext = React.createContext({
    onOpen: () => {},
    popover: {},
    close: () => {},
    isOpen: false,
    activePopoverId: '',
});

const PopoverContextProvider = (props) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [activePopoverId, setActivePopoverId] = React.useState(null);
    const activePopoverRef = React.useRef(null);

    const closePopover = (id) => {
        if (
            !activePopoverRef.current
            || !activePopoverId
            || !id
            || id !== activePopoverId
        ) {
            return;
        }
        activePopoverRef.current.close();
        activePopoverRef.current = null;
        setIsOpen(false);
        setActivePopoverId(null);
    };

    React.useEffect(() => {
        const listener = (e) => {
            if (
                !activePopoverRef.current
                || !activePopoverRef.current.ref
                || !activePopoverRef.current.ref.current
                || activePopoverRef.current.ref.current.contains(e.target)
            ) {
                return;
            }
            closePopover(activePopoverId);
            e.closedPopoverId = activePopoverId;
        };
        document.addEventListener('click', listener, true);
        return () => {
            document.removeEventListener('click', listener, true);
        };
    }, [activePopoverId]);

    React.useEffect(() => {
        const listener = () => {
            closePopover(activePopoverId);
        };
        document.addEventListener('contextmenu', listener);
        return () => {
            document.removeEventListener('contextmenu', listener);
        };
    }, [activePopoverId]);

    React.useEffect(() => {
        const listener = (e) => {
            if (e.key !== 'Escape') {
                return;
            }
            closePopover(activePopoverId);
        };
        document.addEventListener('keydown', listener);
        return () => {
            document.removeEventListener('keydown', listener);
        };
    }, [activePopoverId]);

    React.useEffect(() => {
        const listener = () => {
            if (document.hasFocus()) {
                return;
            }
            closePopover(activePopoverId);
        };
        document.addEventListener('visibilitychange', listener);
        return () => {
            document.removeEventListener('visibilitychange', listener);
        };
    }, [activePopoverId]);

    React.useEffect(() => {
        document.addEventListener('scroll', () => closePopover(activePopoverId), true);
        return () => {
            document.removeEventListener('scroll', () => closePopover(activePopoverId), true);
        };
    }, [activePopoverId]);

    const onOpen = (popoverParams) => {
        if (activePopoverRef.current) {
            closePopover(activePopoverId);
        }
        activePopoverRef.current = popoverParams;
        setActivePopoverId(popoverParams.popoverId);
        setIsOpen(true);
    };
    return (
        <PopoverContext.Provider
            value={{
                onOpen,
                close: closePopover,
                popover: activePopoverRef.current,
                isOpen,
                activePopoverId,
            }}
        >
            {props.children}
        </PopoverContext.Provider>
    );
};

PopoverContextProvider.defaultProps = defaultProps;
PopoverContextProvider.propTypes = propTypes;
PopoverContextProvider.displayName = 'PopoverContextProvider';

export default PopoverContextProvider;

export {
    PopoverContext,
};
