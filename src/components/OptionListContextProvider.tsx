import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import {usePersonalDetails, useReports} from './OnyxProvider';

type Options = {
    reports: OptionData[];
    personalDetails: OptionData[];
};

type OptionsListContextProps = {
    options: Options;
    initializeOptions: () => void;
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
});

function OptionsListContextProvider({children}: OptionsListProviderProps) {
    const areOptionsInitialized = useRef(false);
    const [options, setOptions] = useState<Options>({
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

        areOptionsInitialized.current = true;
        loadOptions();
    }, [loadOptions]);

    return <OptionsListContext.Provider value={useMemo(() => ({options, initializeOptions}), [options, initializeOptions])}>{children}</OptionsListContext.Provider>;
}

const useOptionsListContext = () => useContext(OptionsListContext);

export {OptionsListContextProvider, useOptionsListContext};
