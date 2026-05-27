import {ModalActions} from '@components/Modal/Global/ModalContext';
import {exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';
import {getConnectedIntegration, getValidConnectedIntegration} from '@libs/PolicyUtils';
import type {ExportType} from '@pages/inbox/report/ReportDetailsExportPage';
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
        if (!connectedIntegration) {
            return;
        }

        showConfirmModal({
            title: translate('workspace.exportAgainModal.title'),
            prompt: translate('workspace.exportAgainModal.description', {
                connectionName: connectedIntegration ?? connectedIntegrationFallback,
                reportName,
            }),
            confirmText: translate('workspace.exportAgainModal.confirmText'),
            cancelText: translate('workspace.exportAgainModal.cancelText'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM || !reportID || !connectedIntegration) {
                return;
            }
            if (exportType === CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
                exportToIntegration(reportID, connectedIntegration);
            } else if (exportType === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
                markAsManuallyExported([reportID], connectedIntegration);
            }
        });
    };

    return {triggerExportOrConfirm};
}

export default useExportAgainModal;
