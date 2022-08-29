import React, {createContext} from 'react';
import {render} from '@testing-library/react-native';

const LocaleContext = createContext(null);

const AllTheProviders = ({children}) => {
    return (
        <LocaleContext.Provider
            value={{
                translate: thing => thing,
                numberFormat: () => {},
                timestampToRelative: () => {},
                timestampToDateTime: () => {},
                fromLocalPhone: () => {},
                toLocalPhone: () => {},
                fromLocaleDigit: () => {},
                toLocaleDigit: () => {},
                preferredLocale: () => {},
            }}
        >
            {children}
        </LocaleContext.Provider>
    );
}

const customRender = (ui, options) => render(ui, {wrapper: AllTheProviders, ...options})

// re-export everything
export * from '@testing-library/react-native'

// override render method
export {customRender as render}
