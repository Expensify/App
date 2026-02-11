import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import OptionListContextProvider, {useOptionsList} from '@components/OptionListContextProvider';
import useOnyx from '@hooks/useOnyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import type {OptionList, SearchOption} from '@libs/OptionsListUtils';
import {createOptionFromReport, createOptionList} from '@libs/OptionsListUtils';
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
        };

        onyxSourceValues = {
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: onyxState[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES],
            [ONYXKEYS.COLLECTION.REPORT]: {},
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

    it('passes privateIsArchived to createOptionFromReport when personal details change', () => {
        const reportID = '1';
        const accountID = '12345';
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const report = {
            reportID,
            participants: {[accountID]: {notificationPreference: 'always'}},
        };

        const archivedKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`;
        mockUsePrivateIsArchivedMap.mockReturnValue({[archivedKey]: 'true'});

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

        expect(mockCreateOptionFromReport).toHaveBeenCalledWith(report, updatedPersonalDetails, expect.any(Number), 'true', undefined, {showPersonalDetails: true});
    });
});
