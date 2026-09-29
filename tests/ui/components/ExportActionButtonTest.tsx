import {render} from '@testing-library/react-native';

import ExportActionButton from '@components/ReportActionItem/MoneyRequestReportPreview/ExportActionButton';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';

import React from 'react';

const mockIouReport = {reportID: '1001'} as Report;
const mockActionState: {connectedIntegration: ConnectionName | undefined} = {connectedIntegration: undefined};

// Capture the props ExportActionButton forwards to ExportWithDropdownMenu so we can assert the branch behavior.
const mockExportProps: {current: {report?: Report; connectionName?: ConnectionName} | undefined} = {current: undefined};
jest.mock('@components/ReportActionItem/ExportWithDropdownMenu', () => ({
    __esModule: true,
    default: (props: {report?: Report; connectionName?: ConnectionName}) => {
        mockExportProps.current = props;
        return null;
    },
}));

jest.mock('@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContext', () => ({
    __esModule: true,
    useReportPreviewData: () => ({iouReport: mockIouReport}),
    useReportPreviewActionState: () => mockActionState,
}));

jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: jest.fn(() => [undefined])}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({flexReset: {}})}));

describe('ExportActionButton', () => {
    beforeEach(() => {
        mockExportProps.current = undefined;
        mockActionState.connectedIntegration = undefined;
    });

    it('renders ExportWithDropdownMenu with the connected integration and report', () => {
        mockActionState.connectedIntegration = CONST.POLICY.CONNECTIONS.NAME.QBO;
        render(<ExportActionButton />);
        expect(mockExportProps.current?.connectionName).toBe(CONST.POLICY.CONNECTIONS.NAME.QBO);
        expect(mockExportProps.current?.report).toBe(mockIouReport);
    });

    it('renders nothing when no accounting integration is connected', () => {
        mockActionState.connectedIntegration = undefined;
        const {toJSON} = render(<ExportActionButton />);
        expect(mockExportProps.current).toBeUndefined();
        expect(toJSON()).toBeNull();
    });
});
