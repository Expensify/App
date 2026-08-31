import {ModalActions} from '@components/Modal/Global/ModalContext';

import {getAccountingIntegrationDisplayName} from '@libs/AccountingUtils';
import {exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';
import {getConnectedIntegration, getValidConnectedIntegration} from '@libs/PolicyUtils';

import type {ExportType} from '@pages/inbox/report/DynamicReportDetailsExportPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

function useExportAgainModal(reportID: string | undefined, policyID: string | undefined) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const connectedIntegration = getValidConnectedIntegration(policy);
    const connectedIntegrationFallback = getConnectedIntegration(policy);
    const reportName = report?.reportName ?? '';

    const triggerExportOrConfirm = (exportType: ExportType) => {
        const integrationForExport = exportType === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED ? connectedIntegrationFallback : connectedIntegration;

        if (!integrationForExport) {
            return;
        }

        // "Mark as exported" only logs a per-report exported action through MarkAsExported and never pushes data
        // into the external accounting company, so an already-exported report is simply re-marked. The
        // "export again" copy would wrongly warn that the report is about to be exported to e.g. QuickBooks Online.
        if (exportType === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
            if (!reportID) {
                return;
            }
            markAsManuallyExported([reportID], integrationForExport, policy);
            return;
        }

        const connectionNameFriendly = getAccountingIntegrationDisplayName(policy, integrationForExport, translate);

        showConfirmModal({
            title: translate('workspace.exportAgainModal.title'),
            prompt: translate('workspace.exportAgainModal.description', {
                connectionName: integrationForExport,
                connectionNameFriendly,
                reportName,
            }),
            confirmText: translate('workspace.exportAgainModal.confirmText'),
            cancelText: translate('workspace.exportAgainModal.cancelText'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM || !reportID) {
                return;
            }
            exportToIntegration(reportID, integrationForExport, policy);
        });
    };

    return {triggerExportOrConfirm};
}

export default useExportAgainModal;
