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
    const contextValue = React.useMemo(
        () => ({
            onOpen: () => {},
            close: () => {},
            popover: {},
            isOpen: false,
        }),
        [],
    );

    return <PopoverContext.Provider value={contextValue}>{props.children}</PopoverContext.Provider>;
}

PopoverContextProvider.defaultProps = defaultProps;
PopoverContextProvider.propTypes = propTypes;
PopoverContextProvider.displayName = 'PopoverContextProvider';

export default PopoverContextProvider;

export {PopoverContext};
