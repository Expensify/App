import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import {createOptionList, shallowOptionsListCompare} from '@libs/OptionsListUtils';
import type {OptionList} from '@libs/OptionsListUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {usePersonalDetails} from './OnyxListItemProvider';

type OptionsListContextProps = {
    /** List of options for reports and personal details */
    options: OptionList;
    /** Function to initialize the options */
    initializeOptions: () => void;
    /** Flag to check if the options are initialized */
    areOptionsInitialized: boolean;
    /** Function to reset the options */
    resetOptions: () => void;
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
    resetOptions: () => {},
});

const EMPTY_OPTIONS: OptionList = {reports: [], personalDetails: []};

function OptionsListContextProvider({children}: OptionsListProviderProps) {
    const [areOptionsInitialized, setAreOptionsInitialized] = useState(false);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const personalDetails = usePersonalDetails();
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;

    const options = areOptionsInitialized
        ? createOptionList(personalDetails, currentUserAccountID, privateIsArchivedMap, reports, reportAttributes?.reports)
        : EMPTY_OPTIONS;

    const initializeOptions = useCallback(() => {
        setAreOptionsInitialized(true);
    }, []);

    const resetOptions = useCallback(() => {
        setAreOptionsInitialized(false);
    }, []);

    return (
        <OptionsListContext.Provider
            value={useMemo(() => ({options, initializeOptions, areOptionsInitialized, resetOptions}), [options, initializeOptions, areOptionsInitialized, resetOptions])}
        >
            {children}
        </OptionsListContext.Provider>
    );
}

const useOptionsListContext = () => useContext(OptionsListContext);

// Hook to use the OptionsListContext with an initializer to load the options
const useOptionsList = (options?: {shouldInitialize: boolean}) => {
    const {shouldInitialize = true} = options ?? {};
    const {initializeOptions, options: optionsList, areOptionsInitialized, resetOptions} = useOptionsListContext();
    const [internalOptions, setInternalOptions] = useState<OptionList>(optionsList);
    const [areInternalOptionsInitialized, setAreInternalOptionsInitialized] = useState(false);

    const prevIsInitialized = usePrevious(areOptionsInitialized);
    const [prevOptionsSnapshot, setPrevOptionsSnapshot] = useState(optionsList);
    const [prevOptionsDeps, setPrevOptionsDeps] = useState({optionsList, areOptionsInitialized, prevIsInitialized});
    if (prevOptionsDeps.optionsList !== optionsList || prevOptionsDeps.areOptionsInitialized !== areOptionsInitialized || prevOptionsDeps.prevIsInitialized !== prevIsInitialized) {
        setPrevOptionsDeps({optionsList, areOptionsInitialized, prevIsInitialized});
        /**
         * optionsList reference can change multiple times even the value of its arrays is the same. We perform shallow comparison to check if the options have truly changed.
         * This is necessary to avoid unnecessary re-renders in components that use this context.
         */
        const areOptionsEqual = shallowOptionsListCompare(prevOptionsSnapshot, optionsList);
        setPrevOptionsSnapshot(optionsList);
        const hasInitializedChanged = prevIsInitialized !== areOptionsInitialized;
        if (areOptionsEqual) {
            if (hasInitializedChanged) {
                setAreInternalOptionsInitialized(areOptionsInitialized);
            }
        } else {
            setInternalOptions(optionsList);
            setAreInternalOptionsInitialized(areOptionsInitialized);
        }
    }

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
            areOptionsInitialized: areInternalOptionsInitialized,
            resetOptions: resetInternalOptions,
        }),
        [initializeOptions, internalOptions, resetInternalOptions, areInternalOptionsInitialized],
    );
};

export default OptionsListContextProvider;

export {useOptionsList, OptionsListContext};
