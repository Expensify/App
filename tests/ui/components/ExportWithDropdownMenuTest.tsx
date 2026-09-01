import {render} from '@testing-library/react-native';

import type {DropdownOption, ReportExportType} from '@components/ButtonWithDropdownMenu/types';
import ExportWithDropdownMenu from '@components/ReportActionItem/ExportWithDropdownMenu';

import {exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import React from 'react';

const REPORT_ID = '1001';
const POLICY_ID = 'policy1';
const mockReport = {reportID: REPORT_ID, policyID: POLICY_ID, reportName: 'Approved report'} as Report;

// Captures the props ExportWithDropdownMenu hands to the dropdown so the test can fire `onPress` for a
// specific export option without rendering the real menu.
const mockDropdownProps: {current: {onPress?: (event: unknown, value: ReportExportType) => void; options?: Array<DropdownOption<ReportExportType>>} | undefined} = {current: undefined};
jest.mock('@components/ButtonWithDropdownMenu', () => ({
    __esModule: true,
    default: (props: {onPress?: (event: unknown, value: ReportExportType) => void}) => {
        mockDropdownProps.current = props;
        return null;
    },
}));

const mockShowConfirmModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: jest.fn(() => [undefined])}));

jest.mock('@libs/actions/Report', () => ({
    exportToIntegration: jest.fn(),
    markAsManuallyExported: jest.fn(),
}));

jest.mock('@libs/actions/Policy/Policy', () => ({savePreferredExportMethod: jest.fn()}));

// The report is already exported, which is the state that used to trigger the "export again" confirmation for
// BOTH dropdown options.
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof import('@libs/ReportUtils')>('@libs/ReportUtils'),
    canBeExported: () => true,
    isExported: () => true,
    getIntegrationIcon: () => undefined,
}));

describe('ExportWithDropdownMenu', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDropdownProps.current = undefined;
        mockShowConfirmModal.mockResolvedValue({action: 'CONFIRM'});
    });

    const renderMenu = () =>
        render(
            <ExportWithDropdownMenu
                report={mockReport}
                reportActions={undefined}
                connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            />,
        );

    it('marks an already-exported report as manually exported without showing the export-again modal', () => {
        /**
         * Given: an already-exported report on a QuickBooks Online workspace, shown in the report preview's
         *        export dropdown.
         *
         * When: the user picks "Mark as exported".
         *
         * Then: MarkAsExported runs straight away. The "export again" copy warns that the report is about to be
         *       exported to QuickBooks Online again, which never happens for this action.
         */
        renderMenu();

        mockDropdownProps.current?.onPress?.(undefined, CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED);

        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(markAsManuallyExported).toHaveBeenCalledWith([REPORT_ID], CONST.POLICY.CONNECTIONS.NAME.QBO, undefined);
        expect(exportToIntegration).not.toHaveBeenCalled();
    });

    it('still shows the export-again confirmation before re-exporting to the integration', async () => {
        /**
         * Given: the same already-exported report.
         *
         * When: the user picks the real "Export to QuickBooks Online" option.
         *
         * Then: the export-again confirmation is shown first and the report is exported only after it is
         *       confirmed — this path is deliberately unchanged.
         */
        renderMenu();

        mockDropdownProps.current?.onPress?.(undefined, CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);

        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'workspace.exportAgainModal.title',
                prompt: 'workspace.exportAgainModal.description',
            }),
        );

        // Flush the modal promise chain, then confirm the export ran.
        await Promise.resolve();
        expect(exportToIntegration).toHaveBeenCalledWith(REPORT_ID, CONST.POLICY.CONNECTIONS.NAME.QBO, undefined);
        expect(markAsManuallyExported).not.toHaveBeenCalled();
    });
});
