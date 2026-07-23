import {render} from '@testing-library/react-native';

import AddExpenseActionButton from '@components/ReportActionItem/MoneyRequestReportPreview/AddExpenseActionButton';

import {getAddExpenseDropdownOptions} from '@libs/ReportUtils';

import type {Report} from '@src/types/onyx';

import React from 'react';

const mockIouReport = {reportID: '1001', parentReportID: '3003'} as Report;
const mockPolicy = {id: 'policy1'};

// Capture the props AddExpenseActionButton forwards to ButtonWithDropdownMenu.
const mockButtonProps: {current: {customText?: string} | undefined} = {current: undefined};
jest.mock('@components/ButtonWithDropdownMenu', () => ({
    __esModule: true,
    default: (props: {customText?: string}) => {
        mockButtonProps.current = props;
        return null;
    },
}));

jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext', () => ({
    __esModule: true,
    useReportPreviewData: () => ({iouReport: mockIouReport, chatReportID: '2002', policy: mockPolicy}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({accountID: 1})}));
jest.mock('@hooks/useLazyAsset', () => ({__esModule: true, useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: jest.fn(() => [undefined])}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- partial mock of the real module
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- spread the real module and override one export
    return {...actual, __esModule: true, getAddExpenseDropdownOptions: jest.fn(() => [])};
});

const mockedGetAddExpenseDropdownOptions = jest.mocked(getAddExpenseDropdownOptions);

describe('AddExpenseActionButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockButtonProps.current = undefined;
    });

    it('renders the add-expense dropdown with options built from context data', () => {
        render(<AddExpenseActionButton />);

        expect(mockButtonProps.current?.customText).toBe('iou.addExpense');
        expect(mockedGetAddExpenseDropdownOptions).toHaveBeenCalledWith(
            expect.objectContaining({
                iouReportID: '1001',
                policy: mockPolicy,
                currentUserAccountID: 1,
                iouRequestBackToReport: '2002',
                unreportedExpenseBackToReport: '3003',
            }),
        );
    });
});
