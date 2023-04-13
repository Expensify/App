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
});

const PopoverContextProvider = (props) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const activePopoverRef = React.useRef(null);

    const closePopover = () => {
        if (!activePopoverRef.current) {
            return;
        }
        activePopoverRef.current.close();
        activePopoverRef.current = null;
        setIsOpen(false);
    };

    React.useEffect(() => {
        const listener = (e) => {
            if (
                !activePopoverRef.current
                || !activePopoverRef.current.ref
                || activePopoverRef.current.ref.current.contains(e.target)
            ) {
                return;
            }
            closePopover();
        };
        document.addEventListener('click', listener, true);
        return () => {
            document.removeEventListener('click', listener, true);
        };
    }, []);

    React.useEffect(() => {
        const listener = (e) => {
            if (e.key !== 'Escape') {
                return;
            }
            closePopover();
        };
        document.addEventListener('keydown', listener);
        return () => {
            document.removeEventListener('keydown', listener);
        };
    }, []);

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
    }, []);

    const onOpen = (popoverParams) => {
        if (activePopoverRef.current) {
            closePopover();
        }
        activePopoverRef.current = popoverParams;
        setIsOpen(true);
    };
    return (
        <PopoverContext.Provider
            value={{
                onOpen,
                popover: activePopoverRef.current,
                isOpen,
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
