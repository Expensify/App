import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {createOptionList, shallowOptionsListCompare} from '@libs/PersonalDetailsOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import {isOneOnOneChat, isSelfDM} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportNameValuePairs} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import {usePersonalDetails} from './OnyxListItemProvider';

type PersonalDetailsOptionsListContextProps = {
    /** List of options for personal details */
    options: OptionData[];
    /** Current option */
    currentOption: OptionData | undefined;
    /** Function to initialize the options */
    initializeOptions: () => void;
    /** Flag to check if the options are initialized */
    areOptionsInitialized: boolean;
    /** Function to reset the options */
    resetOptions: () => void;
};

type PersonalDetailsOptionsListProviderProps = {
    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

const PersonalDetailsOptionListContext = createContext<PersonalDetailsOptionsListContextProps>({
    options: [],
    currentOption: undefined,
    initializeOptions: () => {},
    areOptionsInitialized: false,
    resetOptions: () => {},
});

// const isEqualReport = (prevReport: Report, report: Report) =>
//     prevReport?.reportID === report?.reportID &&
//     prevReport?.lastVisibleActionCreated === report?.lastVisibleActionCreated;

const generateAccountIDToReportIDMap = (reports: OnyxCollection<Report>, currentUserAccountID: number) => {
    if (!reports) {
        return {};
    }

    const accountIDToReportIDMap: Record<number, string> = {};
    Object.values(reports).forEach((report) => {
        if (!report || !report.participants) {
            return;
        }
        // This means it's a self-DM
        if (Object.keys(report.participants).length === 1) {
            accountIDToReportIDMap[currentUserAccountID] = report.reportID;
            return;
        }
        Object.keys(report.participants).forEach((accountID) => {
            if (Number(accountID) === currentUserAccountID) {
                return;
            }
            accountIDToReportIDMap[Number(accountID)] = report.reportID;
        });
    });
    return accountIDToReportIDMap;
};

const reportSelector = (report: OnyxEntry<Report>): OnyxEntry<Report> =>
    report && {
        reportID: report.reportID,
        participants: report.participants,
        lastVisibleActionCreated: report.lastVisibleActionCreated,
    };

const rNVPSelector = (rNVP: OnyxEntry<ReportNameValuePairs>): OnyxEntry<ReportNameValuePairs> =>
    rNVP && {
        private_isArchived: rNVP.private_isArchived,
    };

function PersonalDetailsOptionListContextProvider({children}: PersonalDetailsOptionsListProviderProps) {
    const areOptionsInitialized = useRef(false);
    const [options, setOptions] = useState<OptionData[]>([]);
    const currentOption = useRef<OptionData | undefined>(undefined);
    const {accountID} = useCurrentUserPersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: (val) => mapOnyxCollectionItems(Object.fromEntries(Object.entries(val ?? {}).filter(([, value]) => isOneOnOneChat(value) || isSelfDM(value))), reportSelector),
    });
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: (val) => val?.reports});
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true, selector: (val) => mapOnyxCollectionItems(val, rNVPSelector)});
    const personalDetails = usePersonalDetails();

    const loadOptions = useCallback(() => {
        const accountIDToReportIDMap = generateAccountIDToReportIDMap(reports, accountID);
        const optionsData = createOptionList(accountID, personalDetails, accountIDToReportIDMap, reports, reportAttributes, reportNameValuePairs);
        currentOption.current = optionsData.currentUserOption;
        setOptions(optionsData.options);
    }, [reports, accountID, personalDetails, reportAttributes, reportNameValuePairs]);

    /**
     * This effect is responsible for generating the options list when data is changed
     */
    useEffect(() => {
        if (!areOptionsInitialized.current || !personalDetails) {
            return;
        }

        loadOptions();
    }, [personalDetails, loadOptions]);

    const initializeOptions = useCallback(() => {
        loadOptions();
        areOptionsInitialized.current = true;
    }, [loadOptions]);

    const resetOptions = useCallback(() => {
        if (!areOptionsInitialized.current) {
            return;
        }

        areOptionsInitialized.current = false;
        setOptions([]);
    }, []);

    return (
        <PersonalDetailsOptionListContext.Provider
            // eslint-disable-next-line react-compiler/react-compiler
            value={useMemo(
                // eslint-disable-next-line react-compiler/react-compiler
                () => ({options, currentOption: currentOption.current, initializeOptions, areOptionsInitialized: areOptionsInitialized.current, resetOptions}),
                [options, initializeOptions, resetOptions],
            )}
        >
            {children}
        </PersonalDetailsOptionListContext.Provider>
    );
}

const useOptionsListContext = () => useContext(PersonalDetailsOptionListContext);

// Hook to use the PersonalDetailsOptionListContext with an initializer to load the options
const usePersonalDetailsOptionsList = (options?: {shouldInitialize: boolean}) => {
    const {shouldInitialize = true} = options ?? {};
    const {initializeOptions, options: optionsList, currentOption, areOptionsInitialized, resetOptions} = useOptionsListContext();
    const [internalOptions, setInternalOptions] = useState<OptionData[]>(optionsList);
    const prevOptions = useRef<OptionData[]>(null);
    const [areInternalOptionsInitialized, setAreInternalOptionsInitialized] = useState(false);

    useEffect(() => {
        if (!prevOptions.current) {
            prevOptions.current = optionsList;
            setInternalOptions(optionsList);
            setAreInternalOptionsInitialized(areOptionsInitialized);
            return;
        }
        /**
         * optionsList reference can change multiple times even the value of its arrays is the same. We perform shallow comparison to check if the options have truly changed.
         * This is necessary to avoid unnecessary re-renders in components that use this context.
         */
        const areOptionsEqual = shallowOptionsListCompare(prevOptions.current, optionsList);
        prevOptions.current = optionsList;
        if (areOptionsEqual) {
            return;
        }
        setInternalOptions(optionsList);
        setAreInternalOptionsInitialized(areOptionsInitialized);
    }, [optionsList, areOptionsInitialized]);

    useEffect(() => {
        if (!shouldInitialize || areOptionsInitialized) {
            return;
        }

        initializeOptions();
    }, [shouldInitialize, initializeOptions, areOptionsInitialized]);

    const resetInternalOptions = useCallback(() => {
        setAreInternalOptionsInitialized(false);
        resetOptions();
    }, [resetOptions]);

    return useMemo(
        () => ({
            initializeOptions,
            options: internalOptions,
            currentOption,
            areOptionsInitialized: areInternalOptionsInitialized,
            resetOptions: resetInternalOptions,
        }),
        [initializeOptions, internalOptions, currentOption, areInternalOptionsInitialized, resetInternalOptions],
    );
};

export default PersonalDetailsOptionListContextProvider;

export {usePersonalDetailsOptionsList, PersonalDetailsOptionListContext};
