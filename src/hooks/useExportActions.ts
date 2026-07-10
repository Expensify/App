import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchSelectionActions} from '@components/Search/SearchContext';

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

import type React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDecisionModal from './useDecisionModal';
import useExportAgainModal from './useExportAgainModal';
import useExportDownloadStatusModal from './useExportDownloadStatusModal';
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
    beginExportWithTemplate: (templateName: string, templateType: string, transactionIDList: string[], exportName: string, policyID?: string) => void;
    showOfflineModal: () => void;
    showDownloadErrorModal: () => void;

    /** The realtime export status modal for the in-progress template export (or null when none is active). Render it directly in the consumer. */
    exportDownloadStatusModal: React.JSX.Element | null;
};

function useExportActions({reportID, policy, onPDFModalOpen}: UseExportActionsParams): UseExportActionsReturn {
    const {translate, localeCompare} = useLocalize();
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
    // The export templates available to the user, pre-grouped and sorted alphabetically. The basic export is part of the default group so it's sorted alongside the other default templates.
    const {customTemplates, defaultTemplates} = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, localeCompare, policy, true, true);
    const isExported = isExportedUtils(reportActions, moneyRequestReport);

    const {showDecisionModal} = useDecisionModal();
    const {triggerExportOrConfirm} = useExportAgainModal(moneyRequestReport?.reportID, moneyRequestReport?.policyID);
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {trackExport, exportDownloadStatusModal} = useExportDownloadStatusModal(() => clearSelectedTransactions(undefined, true));

    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Table',
        'TablePencil',
        'Export',
        'Download',
        'Printer',
        'XeroSquare',
        'QBOSquare',
        'NetSuiteSquare',
        'IntacctSquare',
        'QBDSquare',
        'CertiniaSquare',
        'RilletSquare',
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

    const beginExportWithTemplate = (templateName: string, templateType: string, transactionIDList: string[], exportName: string, policyID?: string) => {
        if (isOffline) {
            showOfflineModal();
            return;
        }

        if (!moneyRequestReport) {
            return;
        }

        const exportID = queueExportSearchWithTemplate(
            {
                templateName,
                templateType,
                jsonQuery: '{}',
                reportIDList: [moneyRequestReport.reportID],
                transactionIDList,
                policyID,
                exportName,
            },
            true,
        );
        trackExport(exportID);
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
                if (!connectedIntegrationFallback || !moneyRequestReport) {
                    return;
                }
                if (isExported) {
                    triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED);
                    return;
                }
                markAsManuallyExported([moneyRequestReport.reportID ?? CONST.DEFAULT_NUMBER_ID], connectedIntegrationFallback);
            },
        },
    };

    // Register a submenu option for each export template. The basic export is skipped since it already has a dedicated DOWNLOAD_CSV option above
    // (it downloads the CSV directly instead of queueing a template export).
    for (const template of [...customTemplates, ...defaultTemplates]) {
        if (template.templateName === CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV) {
            continue;
        }
        const isDefaultTemplate = defaultTemplates.includes(template);
        exportSubmenuOptions[template.name] = {
            text: template.name,
            icon: isDefaultTemplate ? expensifyIcons.Table : expensifyIcons.TablePencil,
            value: template.templateName,
            description: template.description,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
            onSelected: () => beginExportWithTemplate(template.templateName, template.type, transactionIDs, template.name, template.policyID),
        };
    }

    // The accounting export actions (export to integration / mark as exported) the user is allowed to perform on the report
    const secondaryExportActions: string[] = moneyRequestReport
        ? getSecondaryExportReportActions(accountID, currentUserLogin ?? '', moneyRequestReport, bankAccountList, policy ?? undefined)
        : [];

    // Assemble the export submenu from its pre-sorted groups (accounting actions, custom templates, default templates), with a divider between each non-empty group
    const exportSubMenuGroups: string[][] = moneyRequestReport
        ? [
              secondaryExportActions,
              customTemplates.map((template) => template.name),
              defaultTemplates.map((template) => (template.templateName === CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV ? CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV : template.name)),
          ]
        : [];
    const exportSubMenuItems = exportSubMenuGroups
        .filter((group) => group.length > 0)
        .flatMap((group, groupIndex) =>
            group.flatMap((action, itemIndex) => {
                const option = exportSubmenuOptions[action];
                return option ? [{...option, addSeparatorBefore: groupIndex > 0 && itemIndex === 0}] : [];
            }),
        );

    const exportActionEntries: Record<string, DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>> = {
        [CONST.REPORT.SECONDARY_ACTIONS.EXPORT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.EXPORT,
            text: translate('common.export'),
            backButtonText: translate('common.export'),
            icon: expensifyIcons.Export,
            rightIcon: expensifyIcons.ArrowRight,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT,
            subMenuItems: exportSubMenuItems,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF,
            text: translate('common.downloadAsPDF'),
            icon: expensifyIcons.Download,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DOWNLOAD_PDF,
            onSelected: () => {
                if (isOffline) {
                    showOfflineModal();
                    return;
                }
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
        exportDownloadStatusModal,
    };
}

export default useExportActions;
