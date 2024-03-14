import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {OptionList} from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {usePersonalDetails} from './OnyxProvider';

type OptionsListContextProps = {
    options: OptionList;
    initializeOptions: () => void;
    areOptionsInitialized: boolean;
};

type OptionsListProviderOnyxProps = {
    reports: OnyxCollection<Report>;
};

type OptionsListProviderProps = OptionsListProviderOnyxProps & {
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

function OptionsListContextProvider({reports, children}: OptionsListProviderProps) {
    const areOptionsInitialized = useRef(false);
    const [options, setOptions] = useState<OptionList>({
        reports: [],
        personalDetails: [],
    });
    const personalDetails = usePersonalDetails();

    useEffect(() => {
        // there is no need to update the options if the options are not initialized
        if (!areOptionsInitialized.current) {
            return;
        }

        const lastUpdatedReport = ReportUtils.getLastUpdatedReport();
        const newOption = OptionsListUtils.createOptionFromReport(lastUpdatedReport, personalDetails);
        const replaceIndex = options.reports.findIndex((option) => option.reportID === lastUpdatedReport.reportID);

        if (replaceIndex === undefined) {
            return;
        }

        setOptions((prevOptions) => {
            const newOptions = {...prevOptions};
            newOptions.reports[replaceIndex] = newOption;
            return newOptions;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports]);

    useEffect(() => {
        // there is no need to update the options if the options are not initialized
        if (!areOptionsInitialized.current) {
            return;
        }

        // since personal details are not a collection, we need to recreate the whole list from scratch
        const newPersonalDetailsOptions = OptionsListUtils.createOptionList(personalDetails).personalDetails;

        setOptions((prevOptions) => {
            const newOptions = {...prevOptions};
            newOptions.personalDetails = newPersonalDetailsOptions;
            return newOptions;
        });
    }, [personalDetails]);

    const loadOptions = useCallback(() => {
        const optionLists = OptionsListUtils.createOptionList(personalDetails, reports);
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

export default withOnyx<OptionsListProviderProps, OptionsListProviderOnyxProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
})(OptionsListContextProvider);

export {useOptionsListContext, useOptionsList};
