import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import {createOptionFromReport, createOptionList, processReport, shallowOptionsListCompare} from '@libs/OptionsListUtils';
import type {OptionList, SearchOption} from '@libs/OptionsListUtils';
import {isSelfDM} from '@libs/ReportUtils';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Report} from '@src/types/onyx';
import {usePersonalDetails} from './OnyxListItemProvider';

type OptionsListStateContextProps = {
    /** List of options for reports and personal details */
    options: OptionList;
    /** Flag to check if the options are initialized */
    areOptionsInitialized: boolean;
};

type OptionsListActionsContextProps = {
    /** Function to initialize the options */
    initializeOptions: () => void;
    /** Function to reset the options */
    resetOptions: () => void;
};

type OptionsListProviderProps = {
    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

const OptionsListStateContext = createContext<OptionsListStateContextProps>({
    options: {
        reports: [],
        personalDetails: [],
    },
    areOptionsInitialized: false,
});

const OptionsListActionsContext = createContext<OptionsListActionsContextProps>({
    initializeOptions: () => {},
    resetOptions: () => {},
});

const isEqualPersonalDetail = (prevPersonalDetail: PersonalDetails, personalDetail: PersonalDetails) =>
    prevPersonalDetail?.firstName === personalDetail?.firstName &&
    prevPersonalDetail?.lastName === personalDetail?.lastName &&
    prevPersonalDetail?.login === personalDetail?.login &&
    prevPersonalDetail?.displayName === personalDetail?.displayName;

function buildUpdatedReportsMap(reportOptions: OptionList['reports']) {
    return new Map(reportOptions.filter((report) => report?.reportID).map((report) => [report.reportID, report]));
}

function OptionsListContextProvider({children}: OptionsListProviderProps) {
    const areOptionsInitialized = useRef(false);
    const [options, setOptions] = useState<OptionList>({
        reports: [],
        personalDetails: [],
    });
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
    const prevReportAttributesLocale = usePrevious(reportAttributes?.locale);
    const [reports, {sourceValue: changedReports}] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicies, {sourceValue: changedPolicies}] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const prevPolicies = usePrevious(allPolicies);
    const prevReports = usePrevious(reports);
    const [, {sourceValue: changedReportActions}] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const personalDetails = usePersonalDetails();
    const prevPersonalDetails = usePrevious(personalDetails);
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const hasInitialData = useMemo(() => Object.keys(personalDetails ?? {}).length > 0, [personalDetails]);
    const getReprocessedReportOption = useCallback(
        (report: OnyxEntry<Report> | null, reportID: string, policyID?: string) => {
            const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID ?? report?.policyID}`];

            return processReport(report, personalDetails, privateIsArchived, policy, reportAttributes?.reports).reportOption;
        },
        [allPolicies, personalDetails, privateIsArchivedMap, reportAttributes?.reports],
    );

    const loadOptions = useCallback(() => {
        const optionLists = createOptionList(personalDetails, privateIsArchivedMap, reports, allPolicies, reportAttributes?.reports);
        setOptions({
            reports: optionLists.reports,
            personalDetails: optionLists.personalDetails,
        });
    }, [personalDetails, privateIsArchivedMap, reports, allPolicies, reportAttributes?.reports]);

    /**
     * This effect is responsible for generating the options list when their data is not yet initialized
     */
    useEffect(() => {
        if (!areOptionsInitialized.current || !reports || hasInitialData) {
            return;
        }

        loadOptions();
    }, [reports, personalDetails, hasInitialData, loadOptions]);

    /**
     * This effect is responsible for generating the options list when the locale changes
     * Since options might use report attributes, it's necessary to call this after report attributes are loaded with the new locale to make sure the options are generated in a proper language
     */
    useEffect(() => {
        if (!areOptionsInitialized.current || reportAttributes?.locale === prevReportAttributesLocale) {
            return;
        }

        loadOptions();
    }, [prevReportAttributesLocale, loadOptions, reportAttributes?.locale]);

    const changedReportsEntries = useMemo(() => {
        const result: OnyxCollection<OnyxEntry<Report> | null> = {};

        for (const key of Object.keys(changedReports ?? {})) {
            let report: Report | null = reports?.[key] ?? null;
            result[key] = report;
            if (reports?.[key] === undefined && prevReports?.[key]) {
                report = null;
            }
        }
        return result;
    }, [changedReports, reports, prevReports]);

    /**
     * This effect is responsible for updating the options only for changed reports
     */
    useEffect(() => {
        if (!changedReportsEntries || !areOptionsInitialized.current) {
            return;
        }

        setOptions((prevOptions) => {
            const changedReportKeys = Object.keys(changedReportsEntries);
            if (changedReportKeys.length === 0) {
                return prevOptions;
            }

            const updatedReportsMap = buildUpdatedReportsMap(prevOptions.reports);
            for (const reportKey of changedReportKeys) {
                const report = changedReportsEntries[reportKey];
                const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
                const reportOption = getReprocessedReportOption(report, reportID);

                if (reportOption) {
                    updatedReportsMap.set(reportID, reportOption);
                } else {
                    updatedReportsMap.delete(reportID);
                }
            }

            return {
                ...prevOptions,
                reports: Array.from(updatedReportsMap.values()),
            };
        });
    }, [changedReportsEntries, getReprocessedReportOption]);

    useEffect(() => {
        if (!changedReportActions || !areOptionsInitialized.current) {
            return;
        }

        setOptions((prevOptions) => {
            const changedReportActionsEntries = Object.entries(changedReportActions);
            if (changedReportActionsEntries.length === 0) {
                return prevOptions;
            }

            const updatedReportsMap = buildUpdatedReportsMap(prevOptions.reports);
            for (const [key, reportAction] of changedReportActionsEntries) {
                if (!reportAction) {
                    continue;
                }

                const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
                const reportItem = updatedReportsMap.get(reportID)?.item;
                const reportOption = getReprocessedReportOption(reportItem, reportID);

                if (reportOption) {
                    updatedReportsMap.set(reportID, reportOption);
                }
            }

            return {
                ...prevOptions,
                reports: Array.from(updatedReportsMap.values()),
            };
        });
    }, [changedReportActions, getReprocessedReportOption]);

    useEffect(() => {
        if (!changedPolicies || !areOptionsInitialized.current || !reports || !prevPolicies) {
            return;
        }

        const changedPolicyIDs = new Set<string>();

        for (const policyKey of Object.keys(changedPolicies)) {
            const previousName = prevPolicies?.[policyKey]?.name;
            const updatedName = allPolicies?.[policyKey]?.name;

            if (previousName === updatedName) {
                continue;
            }

            changedPolicyIDs.add(policyKey.replace(ONYXKEYS.COLLECTION.POLICY, ''));
        }

        if (changedPolicyIDs.size === 0) {
            return;
        }

        setOptions((prevOptions) => {
            const updatedReportsMap = buildUpdatedReportsMap(prevOptions.reports);
            let hasUpdatedReportOption = false;

            for (const option of prevOptions.reports) {
                const policyID = option?.item?.policyID;
                const reportID = option?.reportID;

                if (!policyID || !reportID || !changedPolicyIDs.has(policyID)) {
                    continue;
                }

                hasUpdatedReportOption = true;
                const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                const reportOption = getReprocessedReportOption(report, reportID, policyID);

                if (reportOption) {
                    updatedReportsMap.set(reportID, reportOption);
                } else {
                    updatedReportsMap.delete(reportID);
                }
            }

            if (!hasUpdatedReportOption) {
                return prevOptions;
            }

            return {
                ...prevOptions,
                reports: Array.from(updatedReportsMap.values()),
            };
        });
    }, [changedPolicies, reports, allPolicies, prevPolicies, getReprocessedReportOption]);

    /**
     * This effect is used to update the options list when personal details change.
     */
    useEffect(() => {
        // there is no need to update the options if the options are not initialized
        if (!areOptionsInitialized.current) {
            return;
        }

        if (!personalDetails) {
            return;
        }

        // Handle initial personal details load. This initialization is required here specifically to prevent
        // UI freezing that occurs when resetting the app from the troubleshooting page.
        if (!prevPersonalDetails) {
            const {personalDetails: newPersonalDetailsOptions, reports: newReports} = createOptionList(
                personalDetails,
                privateIsArchivedMap,
                reports,
                allPolicies,
                reportAttributes?.reports,
            );
            setOptions((prevOptions) => ({
                ...prevOptions,
                personalDetails: newPersonalDetailsOptions,
                reports: newReports,
            }));
            return;
        }

        const newReportOptions: Array<{
            replaceIndex: number;
            newReportOption: SearchOption<Report>;
        }> = [];

        for (const accountID of Object.keys(personalDetails)) {
            const prevPersonalDetail = prevPersonalDetails?.[accountID];
            const personalDetail = personalDetails[accountID];

            if (prevPersonalDetail && personalDetail && isEqualPersonalDetail(prevPersonalDetail, personalDetail)) {
                continue;
            }

            for (const report of Object.values(reports ?? {})) {
                if (!report) {
                    continue;
                }

                const isParticipant = accountID in (report.participants ?? {});
                const isOwnerOfSelfDM = isSelfDM(report) && report?.ownerAccountID === Number(accountID);
                if (!isParticipant && !isOwnerOfSelfDM) {
                    continue;
                }

                const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`];
                const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
                const newReportOption = createOptionFromReport(report, personalDetails, privateIsArchived, policy, reportAttributes?.reports, {
                    showPersonalDetails: true,
                });
                const replaceIndex = options.reports.findIndex((option) => option.reportID === report.reportID);
                newReportOptions.push({
                    newReportOption,
                    replaceIndex,
                });
            }
        }

        // since personal details are not a collection, we need to recreate the whole list from scratch
        const newPersonalDetailsOptions = createOptionList(personalDetails, privateIsArchivedMap, reports, allPolicies, reportAttributes?.reports).personalDetails;

        setOptions((prevOptions) => {
            const newOptions = {...prevOptions};
            newOptions.personalDetails = newPersonalDetailsOptions;
            for (const newReportOption of newReportOptions) {
                newOptions.reports[newReportOption.replaceIndex] = newReportOption.newReportOption;
            }
            return newOptions;
        });

        // This effect is used to update the options list when personal details change so we ignore all dependencies except personalDetails
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [personalDetails]);

    const initializeOptions = useCallback(() => {
        const isSearchRouterSpanActive = !!getSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER);
        if (isSearchRouterSpanActive) {
            startSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_OPTIONS_INIT, {
                name: CONST.TELEMETRY.SPAN_SEARCH_ROUTER_OPTIONS_INIT,
                op: 'function',
                parentSpan: getSpan(CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER),
            });
        }
        loadOptions();
        areOptionsInitialized.current = true;
        if (isSearchRouterSpanActive) {
            endSpan(CONST.TELEMETRY.SPAN_SEARCH_ROUTER_OPTIONS_INIT);
        }
    }, [loadOptions]);

    const resetOptions = useCallback(() => {
        if (!areOptionsInitialized.current) {
            return;
        }

        areOptionsInitialized.current = false;
        setOptions({
            reports: [],
            personalDetails: [],
        });
    }, []);

    const stateValue = useMemo(() => ({options, areOptionsInitialized: areOptionsInitialized.current}), [options]);
    const actionsValue = useMemo(() => ({initializeOptions, resetOptions}), [initializeOptions, resetOptions]);

    return (
        <OptionsListStateContext.Provider value={stateValue}>
            <OptionsListActionsContext.Provider value={actionsValue}>{children}</OptionsListActionsContext.Provider>
        </OptionsListStateContext.Provider>
    );
}

const useOptionsListState = () => useContext(OptionsListStateContext);

const useOptionsListActions = () => useContext(OptionsListActionsContext);

// Hook to use the OptionsListContext with an initializer to load the options
const useOptionsList = (options?: {shouldInitialize: boolean}) => {
    const {shouldInitialize = true} = options ?? {};
    const {options: optionsList, areOptionsInitialized} = useOptionsListState();
    const {initializeOptions, resetOptions} = useOptionsListActions();
    const [internalOptions, setInternalOptions] = useState<OptionList>(optionsList);
    const prevOptions = useRef<OptionList>(null);
    const [areInternalOptionsInitialized, setAreInternalOptionsInitialized] = useState(false);

    const prevIsInitialized = usePrevious(areOptionsInitialized);
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
        const hasInitializedChanged = prevIsInitialized !== areOptionsInitialized;
        if (areOptionsEqual) {
            if (hasInitializedChanged) {
                setAreInternalOptionsInitialized(areOptionsInitialized);
            }

            return;
        }
        setInternalOptions(optionsList);
        setAreInternalOptionsInitialized(areOptionsInitialized);
    }, [optionsList, areOptionsInitialized, prevIsInitialized]);

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

export {useOptionsList, OptionsListStateContext, OptionsListActionsContext};
