import {renderHook} from '@testing-library/react-native';

import useExportAgainModal from '@hooks/useExportAgainModal';

import {exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';

import CONST from '@src/CONST';

const REPORT_ID = 'report1';
const POLICY_ID = 'policy1';

// `lastSync.isConnected` marks the connection verified, which the real "Export to integration" path requires.
const mockPolicy = {
    id: POLICY_ID,
    connections: {[CONST.POLICY.CONNECTIONS.NAME.QBO]: {lastSync: {isConnected: true}}},
};

jest.mock('@libs/actions/Report', () => ({
    exportToIntegration: jest.fn(),
    markAsManuallyExported: jest.fn(),
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

// A QBO-connected policy and an already-exported report, which is the state that used to trigger the
// "export again" confirmation for BOTH export options.
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => {
        if (key === `report_${REPORT_ID}`) {
            return [{reportID: REPORT_ID, policyID: POLICY_ID, reportName: 'Approved report', isExportedToIntegration: true}];
        }
        if (key === `policy_${POLICY_ID}`) {
            return [mockPolicy];
        }
        return [undefined];
    },
}));

describe('useExportAgainModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockShowConfirmModal.mockResolvedValue({action: 'CONFIRM'});
    });

    it('marks an already-exported report as manually exported without showing the QBO export-again modal', async () => {
        /**
         * Given: a single already-exported report on a QuickBooks Online workspace.
         *
         * When: the user picks "Mark as exported".
         *
         * Then: MarkAsExported runs straight away. No confirmation is shown, because that action only writes a
         *       per-report exported marker and never (re-)exports anything to QuickBooks Online.
         */
        const {result} = renderHook(() => useExportAgainModal(REPORT_ID, POLICY_ID));

        result.current.triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED);

        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(markAsManuallyExported).toHaveBeenCalledWith([REPORT_ID], CONST.POLICY.CONNECTIONS.NAME.QBO, expect.objectContaining({id: POLICY_ID}));
        expect(exportToIntegration).not.toHaveBeenCalled();
    });

    it('still shows the export-again confirmation before re-exporting an already-exported report to the integration', async () => {
        /**
         * Given: the same already-exported report.
         *
         * When: the user picks the real "Export to QuickBooks Online" action.
         *
         * Then: the existing export-again confirmation is shown first and the report is exported only after it
         *       is confirmed — this path is deliberately unchanged.
         */
        const {result} = renderHook(() => useExportAgainModal(REPORT_ID, POLICY_ID));

        result.current.triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);

        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'workspace.exportAgainModal.title',
                prompt: 'workspace.exportAgainModal.description',
            }),
        );

        // Flush the modal promise chain, then confirm the export ran.
        await Promise.resolve();
        expect(exportToIntegration).toHaveBeenCalledWith(REPORT_ID, CONST.POLICY.CONNECTIONS.NAME.QBO, expect.objectContaining({id: POLICY_ID}));
        expect(markAsManuallyExported).not.toHaveBeenCalled();
    });
});
