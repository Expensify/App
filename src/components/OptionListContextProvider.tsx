import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {OptionList} from '@libs/OptionsListUtils';
import {usePersonalDetails, useReports} from './OnyxProvider';

type OptionsListContextProps = {
    options: OptionList;
    initializeOptions: () => void;
    areOptionsInitialized: boolean;
};

type OptionsListProviderProps = {
    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

const OptionsListContext = createContext<OptionsListContextProps>({
    options: {
        reports: [],
        personalDetails: [],
    },
    initializeOptions: () => {},
    areOptionsInitialized: false,
});

function OptionsListContextProvider({children}: OptionsListProviderProps) {
    const areOptionsInitialized = useRef(false);
    const [options, setOptions] = useState<OptionList>({
        reports: [],
        personalDetails: [],
    });
    const personalDetails = usePersonalDetails();
    const reports = useReports();

    const loadOptions = useCallback(() => {
        const optionLists = OptionsListUtils.createOptionList(reports, personalDetails);
        setOptions({
            reports: optionLists.reports,
            personalDetails: optionLists.personalDetails,
        });
    }, [personalDetails, reports]);

    const initializeOptions = useCallback(() => {
        if (areOptionsInitialized.current) {
            return;
        }

        loadOptions();
        areOptionsInitialized.current = true;
    }, [loadOptions]);

    return (
        <OptionsListContext.Provider value={useMemo(() => ({options, initializeOptions, areOptionsInitialized: areOptionsInitialized.current}), [options, initializeOptions])}>
            {children}
        </OptionsListContext.Provider>
    );
}

const useOptionsListContext = () => useContext(OptionsListContext);

// Hook to use the OptionsListContext with an initializer to load the options
const useOptionsList = (options?: {shouldInitialize: boolean}) => {
    const {shouldInitialize = true} = options ?? {};
    const {initializeOptions, ...optionsListContext} = useOptionsListContext();

    useEffect(() => {
        if (!shouldInitialize || optionsListContext.areOptionsInitialized) {
            return;
        }

        initializeOptions();
    }, [shouldInitialize, initializeOptions, optionsListContext.areOptionsInitialized]);

    return {
        initializeOptions,
        ...optionsListContext,
    };
};

export {OptionsListContextProvider, useOptionsListContext, useOptionsList};
