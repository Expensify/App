import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import usePrevious from '@hooks/usePrevious';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {OptionList} from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {usePersonalDetails} from './OnyxProvider';

type OptionsListContextProps = {
    /** List of options for reports and personal details */
    options: OptionList;
    /** Function to initialize the options */
    initializeOptions: () => void;
    /** Flag to check if the options are initialized */
    areOptionsInitialized: boolean;
};

type OptionsListProviderOnyxProps = {
    /** Collection of reports */
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
    const prevReports = usePrevious(reports);

    /**
     * This effect is used to update the options list when a report is updated.
     */
    useEffect(() => {
        // there is no need to update the options if the options are not initialized
        if (!areOptionsInitialized.current) {
            return;
        }

        const lastUpdatedReport = ReportUtils.getLastUpdatedReport();

        if (!lastUpdatedReport) {
            return;
        }

        const newOption = OptionsListUtils.createOptionFromReport(lastUpdatedReport, personalDetails);
        const replaceIndex = options.reports.findIndex((option) => option.reportID === lastUpdatedReport.reportID);

        if (replaceIndex === -1) {
            return;
        }

        setOptions((prevOptions) => {
            const newOptions = {...prevOptions};
            newOptions.reports[replaceIndex] = newOption;
            return newOptions;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports]);

    /**
     * This effect is used to add a new report option to the list of options when a new report is added to the collection.
     */
    useEffect(() => {
        if (!areOptionsInitialized.current || !reports) {
            return;
        }
        const missingReportIds = Object.keys(reports).filter((key) => prevReports && !(key in prevReports));

        setOptions((prevOptions) => {
            const newOptions = {...prevOptions};
            missingReportIds.forEach((missingReportId) => {
                const report = missingReportId ? reports[missingReportId] : null;
                if (!missingReportId || !report) {
                    return;
                }
                const reportOption = OptionsListUtils.createOptionFromReport(report, personalDetails);
                newOptions.reports.push(reportOption);
            });
            return newOptions;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports]);

    /**
     * This effect is used to update the options list when personal details change.
     */
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
    const {initializeOptions, options: optionsList, areOptionsInitialized} = useOptionsListContext();

    useEffect(() => {
        if (!shouldInitialize || areOptionsInitialized) {
            return;
        }

        initializeOptions();
    }, [shouldInitialize, initializeOptions, areOptionsInitialized]);

    return {
        initializeOptions,
        options: optionsList,
        areOptionsInitialized,
    };
};

export default withOnyx<OptionsListProviderProps, OptionsListProviderOnyxProps>({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
})(OptionsListContextProvider);

export {useOptionsListContext, useOptionsList, OptionsListContext};
