import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import OptionListContextProvider, {useOptionsList} from '@components/OptionListContextProvider';
import useOnyx from '@hooks/useOnyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import type {OptionList, SearchOption} from '@libs/OptionsListUtils';
import {createOptionFromReport, createOptionList, processReport} from '@libs/OptionsListUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

jest.mock('@libs/OptionsListUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/OptionsListUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        createOptionList: jest.fn(),
        processReport: jest.fn(() => ({reportOption: null})),
        createOptionFromReport: jest.fn(),
    };
});

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePrivateIsArchivedMap', () => jest.fn());
jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: jest.fn(),
}));

const mockCreateOptionList = createOptionList as jest.MockedFunction<typeof createOptionList>;
const mockProcessReport = processReport as jest.MockedFunction<typeof processReport>;
const mockCreateOptionFromReport = createOptionFromReport as jest.MockedFunction<typeof createOptionFromReport>;
const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;
const mockUsePersonalDetails = usePersonalDetails as jest.MockedFunction<typeof usePersonalDetails>;
const mockUsePrivateIsArchivedMap = usePrivateIsArchivedMap as jest.MockedFunction<typeof usePrivateIsArchivedMap>;

const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => <OptionListContextProvider>{children}</OptionListContextProvider>;

describe('OptionListContextProvider', () => {
    let onyxState: Record<string, unknown>;
    let onyxSourceValues: Record<string, unknown>;

    beforeEach(() => {
        jest.clearAllMocks();

        onyxState = {
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: {locale: 'en'},
            [ONYXKEYS.COLLECTION.REPORT]: {},
            [ONYXKEYS.COLLECTION.POLICY]: {},
        };

        onyxSourceValues = {
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: onyxState[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES],
            [ONYXKEYS.COLLECTION.REPORT]: {},
            [ONYXKEYS.COLLECTION.POLICY]: {},
            [ONYXKEYS.COLLECTION.REPORT_ACTIONS]: {},
        };

        mockCreateOptionList.mockReturnValue({reports: [], personalDetails: []});
        mockUsePersonalDetails.mockReturnValue({});
        mockUsePrivateIsArchivedMap.mockReturnValue({});

        mockUseOnyx.mockImplementation(((key: string) => {
            if (key === ONYXKEYS.DERIVED.REPORT_ATTRIBUTES) {
                return [onyxState[key], {sourceValue: onyxSourceValues[key]}];
            }

            if (key === ONYXKEYS.COLLECTION.REPORT) {
                return [onyxState[key], {sourceValue: onyxSourceValues[key]}];
            }

            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [onyxState[key], {sourceValue: onyxSourceValues[key]}];
            }

            if (key === ONYXKEYS.COLLECTION.REPORT_ACTIONS) {
                return [undefined, {sourceValue: onyxSourceValues[key]}];
            }

            return [undefined];
        }) as typeof useOnyx);
    });

    it('ignores locale changes before options are initialized', () => {
        const {rerender} = renderHook(({shouldInitialize}) => useOptionsList({shouldInitialize}), {
            initialProps: {shouldInitialize: false},
            wrapper,
        });

        expect(mockCreateOptionList).not.toHaveBeenCalled();

        onyxState = {
            ...onyxState,
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: {locale: 'es'},
        };
        onyxSourceValues = {
            ...onyxSourceValues,
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: onyxState[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES],
        };
        rerender({shouldInitialize: false});

        expect(mockCreateOptionList).not.toHaveBeenCalled();
    });

    it('refreshes options once after initialization when locale changes', () => {
        const {result, rerender} = renderHook(({shouldInitialize}) => useOptionsList({shouldInitialize}), {
            initialProps: {shouldInitialize: false},
            wrapper,
        });

        act(() => {
            result.current.initializeOptions();
        });

        expect(mockCreateOptionList).toHaveBeenCalledTimes(1);

        mockCreateOptionList.mockClear();

        onyxState = {
            ...onyxState,
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: {locale: 'fr'},
        };
        onyxSourceValues = {
            ...onyxSourceValues,
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: onyxState[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES],
        };
        rerender({shouldInitialize: false});

        expect(mockCreateOptionList).toHaveBeenCalledTimes(1);
    });

    it('calls processReport with privateIsArchived when reports change', () => {
        const reportID = '1';
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const report = {reportID};

        const {result, rerender} = renderHook(({shouldInitialize}) => useOptionsList({shouldInitialize}), {
            initialProps: {shouldInitialize: false},
            wrapper,
        });

        act(() => {
            result.current.initializeOptions();
        });

        mockProcessReport.mockClear();

        onyxState = {
            ...onyxState,
            [ONYXKEYS.COLLECTION.REPORT]: {[reportKey]: report},
        };
        onyxSourceValues = {
            ...onyxSourceValues,
            [ONYXKEYS.COLLECTION.REPORT]: {[reportKey]: report},
        };
        rerender({shouldInitialize: false});

        expect(mockProcessReport).toHaveBeenCalled();
    });

    it('calls processReport with privateIsArchived when report actions change', () => {
        const reportID = '2';
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;

        const {result, rerender} = renderHook(({shouldInitialize}) => useOptionsList({shouldInitialize}), {
            initialProps: {shouldInitialize: false},
            wrapper,
        });

        act(() => {
            result.current.initializeOptions();
        });

        mockProcessReport.mockClear();

        onyxSourceValues = {
            ...onyxSourceValues,
            [ONYXKEYS.COLLECTION.REPORT_ACTIONS]: {[reportActionsKey]: {someAction: {}}},
        };
        rerender({shouldInitialize: false});

        expect(mockProcessReport).toHaveBeenCalled();
    });

    it('updates local options when a policy rename only changes report alternate text and subtitle', () => {
        const reportID = '3';
        const policyID = '7';
        const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const report = {reportID, policyID, reportName: '#announce'};
        const oldReportOption = {
            reportID,
            item: report,
            text: '#announce',
            alternateText: 'Old Workspace',
            subtitle: 'Old Workspace',
            keyForList: reportID,
        } as unknown as SearchOption<Report>;
        const updatedReportOption = {
            ...oldReportOption,
            alternateText: 'New Workspace',
            subtitle: 'New Workspace',
        } as unknown as SearchOption<Report>;

        onyxState = {
            ...onyxState,
            [ONYXKEYS.COLLECTION.REPORT]: {[reportKey]: report},
            [ONYXKEYS.COLLECTION.POLICY]: {[policyKey]: {name: 'Old Workspace'}},
        };
        onyxSourceValues = {
            ...onyxSourceValues,
            [ONYXKEYS.COLLECTION.REPORT]: {[reportKey]: report},
            [ONYXKEYS.COLLECTION.POLICY]: {},
        };

        mockCreateOptionList.mockReturnValue({
            reports: [oldReportOption],
            personalDetails: [],
        } as OptionList);
        mockProcessReport.mockReturnValue({reportOption: updatedReportOption});

        const {result, rerender} = renderHook(({shouldInitialize}) => useOptionsList({shouldInitialize}), {
            initialProps: {shouldInitialize: false},
            wrapper,
        });

        act(() => {
            result.current.initializeOptions();
        });

        expect(result.current.options.reports.at(0)?.alternateText).toBe('Old Workspace');

        onyxState = {
            ...onyxState,
            [ONYXKEYS.COLLECTION.POLICY]: {[policyKey]: {name: 'New Workspace'}},
        };
        onyxSourceValues = {
            ...onyxSourceValues,
            [ONYXKEYS.COLLECTION.POLICY]: {[policyKey]: {name: 'New Workspace'}},
        };

        rerender({shouldInitialize: false});

        expect(mockProcessReport).toHaveBeenCalled();
        expect(result.current.options.reports.at(0)?.text).toBe('#announce');
        expect(result.current.options.reports.at(0)?.alternateText).toBe('New Workspace');
        expect(result.current.options.reports.at(0)?.subtitle).toBe('New Workspace');
    });

    it('passes privateIsArchived to createOptionFromReport when personal details change', () => {
        const reportID = '1';
        const accountID = '12345';
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const report = {
            reportID,
            participants: {[accountID]: {notificationPreference: 'always'}},
        };

        const archivedKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`;
        mockUsePrivateIsArchivedMap.mockReturnValue({[archivedKey]: true});

        const initialPersonalDetails = {[accountID]: {accountID: Number(accountID), firstName: 'John', lastName: 'Doe', login: 'john@test.com', displayName: 'John Doe'}};
        mockUsePersonalDetails.mockReturnValue(initialPersonalDetails);

        onyxState = {
            ...onyxState,
            [ONYXKEYS.COLLECTION.REPORT]: {[reportKey]: report},
        };
        onyxSourceValues = {
            ...onyxSourceValues,
            [ONYXKEYS.COLLECTION.REPORT]: {[reportKey]: report},
        };

        const mockReportOption = {reportID, item: report, text: 'John Doe', keyForList: reportID} as unknown as SearchOption<Report>;
        mockCreateOptionList.mockReturnValue({
            reports: [mockReportOption],
            personalDetails: [],
        } as OptionList);
        mockCreateOptionFromReport.mockReturnValue(mockReportOption);

        const {result, rerender} = renderHook(({shouldInitialize}) => useOptionsList({shouldInitialize}), {
            initialProps: {shouldInitialize: false},
            wrapper,
        });

        act(() => {
            result.current.initializeOptions();
        });

        mockCreateOptionFromReport.mockClear();

        // Change personal details to trigger the update effect
        const updatedPersonalDetails = {[accountID]: {accountID: Number(accountID), firstName: 'Jane', lastName: 'Doe', login: 'john@test.com', displayName: 'Jane Doe'}};
        mockUsePersonalDetails.mockReturnValue(updatedPersonalDetails);
        rerender({shouldInitialize: false});

        expect(mockCreateOptionFromReport).toHaveBeenCalledWith(report, updatedPersonalDetails, true, undefined, undefined, {showPersonalDetails: true});
    });

    it('does not reset options when called before initialization', () => {
        const {result} = renderHook(({shouldInitialize}) => useOptionsList({shouldInitialize}), {
            initialProps: {shouldInitialize: false},
            wrapper,
        });

        act(() => {
            result.current.resetOptions();
        });

        expect(result.current.areOptionsInitialized).toBe(false);
        expect(result.current.options).toEqual({reports: [], personalDetails: []});
    });

    it('resets options to empty state when called after initialization', () => {
        const {result} = renderHook(({shouldInitialize}) => useOptionsList({shouldInitialize}), {
            initialProps: {shouldInitialize: false},
            wrapper,
        });

        act(() => {
            result.current.initializeOptions();
        });

        expect(result.current.areOptionsInitialized).toBe(true);

        act(() => {
            result.current.resetOptions();
        });

        expect(result.current.areOptionsInitialized).toBe(false);
        expect(result.current.options).toEqual({reports: [], personalDetails: []});
    });
});
