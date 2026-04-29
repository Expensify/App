import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import {openOldDotLink} from '@libs/actions/Link';
import {exportReportToCSV, exportReportToPDF, exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';
import {getExportTemplates, queueExportSearchWithTemplate} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getConnectedIntegration, getValidConnectedIntegration} from '@libs/PolicyUtils';
import {getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';
import {getSecondaryExportReportActions} from '@libs/ReportSecondaryActionUtils';
import {getIntegrationIcon, isExported as isExportedUtils} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import useConfirmModal from './useConfirmModal';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDecisionModal from './useDecisionModal';
import useExportAgainModal from './useExportAgainModal';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import useThemeStyles from './useThemeStyles';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

type UseExportActionsParams = {
    reportID: string | undefined;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    onPDFModalOpen?: () => void;
};

type UseExportActionsReturn = {
    exportActionEntries: Record<string, DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>>;
    secondaryExportActions: Array<ValueOf<string>>;
    beginExportWithTemplate: (templateName: string, templateType: string, transactionIDList: string[], policyID?: string) => void;
    showOfflineModal: () => void;
    showDownloadErrorModal: () => void;
};

function useExportActions({reportID, policy, onPDFModalOpen}: UseExportActionsParams): UseExportActionsReturn {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const {login: currentUserLogin, accountID} = useCurrentUserPersonalDetails();

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactionIDs = Object.values(reportTransactions).map((t) => t.transactionID);

    const connectedIntegration = getValidConnectedIntegration(policy);
    const connectedIntegrationFallback = getConnectedIntegration(policy);
    const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy);
    const isExported = isExportedUtils(reportActions, moneyRequestReport);

    const {showConfirmModal} = useConfirmModal();
    const {showDecisionModal} = useDecisionModal();
    const {triggerExportOrConfirm} = useExportAgainModal(moneyRequestReport?.reportID, moneyRequestReport?.policyID);
    const {clearSelectedTransactions} = useSearchActionsContext();

    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Table',
        'Export',
        'Download',
        'Printer',
        'XeroSquare',
        'QBOSquare',
        'NetSuiteSquare',
        'IntacctSquare',
        'QBDSquare',
        'CertiniaSquare',
        'GustoSquare',
        'ArrowRight',
    ]);

    const showOfflineModal = () => {
        showDecisionModal({
            title: translate('common.youAppearToBeOffline'),
            prompt: translate('common.offlinePrompt'),
            secondOptionText: translate('common.buttonConfirm'),
        });
    };

    const showDownloadErrorModal = () => {
        showDecisionModal({
            title: translate('common.downloadFailedTitle'),
            prompt: translate('common.downloadFailedDescription'),
            secondOptionText: translate('common.buttonConfirm'),
        });
    };

    const showExportProgressModal = () => {
        return showConfirmModal({
            title: translate('export.exportInProgress'),
            prompt: translate('export.conciergeWillSend'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const beginExportWithTemplate = (templateName: string, templateType: string, transactionIDList: string[], policyID?: string) => {
        if (isOffline) {
            showOfflineModal();
            return;
        }

        if (!moneyRequestReport) {
            return;
        }

        showExportProgressModal().then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            clearSelectedTransactions(undefined, true);
        });

        queueExportSearchWithTemplate({
            templateName,
            templateType,
            jsonQuery: '{}',
            reportIDList: [moneyRequestReport.reportID],
            transactionIDList,
            policyID,
        });
    };

    const exportSubmenuOptions: Record<string, DropdownOption<string>> = {
        [CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV]: {
            text: translate('export.basicExport'),
            icon: expensifyIcons.Table,
            value: CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                if (isOffline) {
                    showOfflineModal();
                    return;
                }
                exportReportToCSV(
                    {
                        reportID: moneyRequestReport.reportID,
                        transactionIDList: transactionIDs,
                    },
                    () => {
                        showDownloadErrorModal();
                    },
                    translate,
                );
            },
        },
        [CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION]: {
            text: translate('workspace.common.exportIntegrationSelected', {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                connectionName: connectedIntegrationFallback!,
            }),
            icon: getIntegrationIcon(connectedIntegration ?? connectedIntegrationFallback, expensifyIcons),
            displayInDefaultIconColor: true,
            additionalIconStyles: styles.integrationIcon,
            value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
            onSelected: () => {
                if (!connectedIntegration || !moneyRequestReport) {
                    return;
                }
                if (isExported) {
                    triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
                    return;
                }
                exportToIntegration(moneyRequestReport.reportID, connectedIntegration);
            },
        },
        [CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED]: {
            text: translate('workspace.common.markAsExported'),
            icon: getIntegrationIcon(connectedIntegration ?? connectedIntegrationFallback, expensifyIcons),
            additionalIconStyles: styles.integrationIcon,
            displayInDefaultIconColor: true,
            value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
            onSelected: () => {
                if (!connectedIntegration || !moneyRequestReport) {
                    return;
                }
                if (isExported) {
                    triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED);
                    return;
                }
                markAsManuallyExported([moneyRequestReport.reportID ?? CONST.DEFAULT_NUMBER_ID], connectedIntegration);
            },
        },
    };

    for (const template of exportTemplates) {
        exportSubmenuOptions[template.name] = {
            text: template.name,
            icon: expensifyIcons.Table,
            value: template.templateName,
            description: template.description,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
            onSelected: () => beginExportWithTemplate(template.templateName, template.type, transactionIDs, template.policyID),
        };
    }

    const secondaryExportActions = moneyRequestReport
        ? getSecondaryExportReportActions(accountID, currentUserLogin ?? '', moneyRequestReport, bankAccountList, policy ?? undefined, exportTemplates)
        : [];

    const exportActionEntries: Record<string, DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>> = {
        [CONST.REPORT.SECONDARY_ACTIONS.EXPORT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.EXPORT,
            text: translate('common.export'),
            backButtonText: translate('common.export'),
            icon: expensifyIcons.Export,
            rightIcon: expensifyIcons.ArrowRight,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT,
            subMenuItems: secondaryExportActions.map((action) => exportSubmenuOptions[action as string]),
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF,
            text: translate('common.downloadAsPDF'),
            icon: expensifyIcons.Download,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DOWNLOAD_PDF,
            onSelected: () => {
                if (!moneyRequestReport?.reportID) {
                    return;
                }
                onPDFModalOpen?.();
                exportReportToPDF({reportID: moneyRequestReport.reportID});
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.PRINT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.PRINT,
            text: translate('common.print'),
            icon: expensifyIcons.Printer,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.PRINT,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                openOldDotLink(CONST.OLDDOT_URLS.PRINTABLE_REPORT(moneyRequestReport.reportID));
            },
        },
    };

    return {
        exportActionEntries,
        secondaryExportActions,
        beginExportWithTemplate,
        showOfflineModal,
        showDownloadErrorModal,
    };
}

export default useExportActions;
export type {UseExportActionsParams, UseExportActionsReturn};
