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
});

const PopoverContextProvider = ({children}) => (
    <PopoverContext.Provider
        value={{
            onOpen: () => {},
            close: () => {},
            popover: {},
            isOpen: false,
        }}
    >
        {children}
    </PopoverContext.Provider>
);

PopoverContextProvider.defaultProps = defaultProps;
PopoverContextProvider.propTypes = propTypes;
PopoverContextProvider.displayName = 'PopoverContextProvider';

export default PopoverContextProvider;

export {PopoverContext};
