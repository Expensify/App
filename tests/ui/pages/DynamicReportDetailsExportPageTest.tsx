import {render} from '@testing-library/react-native';

import {exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';

import DynamicReportDetailsExportPage from '@pages/inbox/report/DynamicReportDetailsExportPage';
import type {ExportType} from '@pages/inbox/report/DynamicReportDetailsExportPage';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import createMock from '../../utils/createMock';

type ExportPageProps = PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_EXPORT>;

const REPORT_ID = '1001';

// Captures the props the page hands to SelectionScreen so the test can fire `onSelectRow` for a specific
// export option without rendering the real selection list.
const mockSelectionProps: {current: {onSelectRow?: (option: {value: ExportType}) => void} | undefined} = {current: undefined};
jest.mock('@components/SelectionScreen', () => ({
    __esModule: true,
    default: (props: {onSelectRow?: (option: {value: ExportType}) => void}) => {
        mockSelectionProps.current = props;
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

jest.mock('@hooks/useDynamicBackPath', () => ({__esModule: true, default: () => undefined}));

jest.mock('@libs/actions/Report', () => ({
    exportToIntegration: jest.fn(),
    markAsManuallyExported: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {dismissModal: jest.fn(), goBack: jest.fn()},
}));

// The report is already exported, which is the state that used to trigger the "export again" confirmation for
// BOTH export options on this page.
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof import('@libs/ReportUtils')>('@libs/ReportUtils'),
    canBeExported: () => true,
    isExported: () => true,
    getIntegrationIcon: () => undefined,
}));

describe('DynamicReportDetailsExportPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSelectionProps.current = undefined;
        mockShowConfirmModal.mockResolvedValue({action: 'CONFIRM'});
    });

    const renderPage = () =>
        render(
            <DynamicReportDetailsExportPage
                route={createMock<ExportPageProps['route']>({params: {reportID: REPORT_ID, connectionName: CONST.POLICY.CONNECTIONS.NAME.QBO}})}
                navigation={createMock<ExportPageProps['navigation']>({})}
            />,
        );

    it('marks an already-exported report as manually exported without showing the export-again modal', () => {
        /**
         * Given: an already-exported report on a QuickBooks Online workspace, opened on the report details
         *        export page.
         *
         * When: the user selects "Mark as exported".
         *
         * Then: MarkAsExported runs straight away. The "export again" copy warns that the report is about to be
         *       exported to QuickBooks Online again, which never happens for this action.
         */
        renderPage();

        mockSelectionProps.current?.onSelectRow?.({value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED});

        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(markAsManuallyExported).toHaveBeenCalledWith([REPORT_ID], CONST.POLICY.CONNECTIONS.NAME.QBO, undefined);
        expect(exportToIntegration).not.toHaveBeenCalled();
    });

    it('still shows the export-again confirmation before re-exporting to the integration', async () => {
        /**
         * Given: the same already-exported report.
         *
         * When: the user selects the real "Export to QuickBooks Online" option.
         *
         * Then: the export-again confirmation is shown first and the report is exported only after it is
         *       confirmed — this path is deliberately unchanged.
         */
        renderPage();

        mockSelectionProps.current?.onSelectRow?.({value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION});

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
