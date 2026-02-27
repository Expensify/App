import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {ThemeColors} from '@styles/theme/types';
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';
import {convertToDisplayString} from './CurrencyUtils';
import DateUtils from './DateUtils';
import {getOriginalMessage, isExportedToIntegrationAction} from './ReportActionsUtils';
import {getPolicyName, getReportStatusColorStyle, getReportStatusTranslation, getWorkspaceIcon} from './ReportUtils';

type FormattedReportStatus = {
    text: string;
    backgroundColor: string;
    textColor: string;
} | null;

type FormattedWorkspace = {
    name: string;
    icon: ReturnType<typeof getWorkspaceIcon>;
} | null;

type ExpensifyIconName = 'NetSuiteSquare' | 'XeroSquare' | 'IntacctSquare' | 'QBOSquare' | 'Table' | 'ZenefitsSquare' | 'BillComSquare' | 'CertiniaSquare';

/**
 * Formats a date string for display in a search result row.
 * Automatically switches between short (MMM D) and long (MMM D, YYYY) format based on whether the date is from a past year.
 */
function formatSearchDate(date: string): string {
    return DateUtils.formatWithUTCTimeZone(date, DateUtils.doesDateBelongToAPastYear(date) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
}

/**
 * Formats a numeric amount + currency code into a display string, e.g. "$42.00".
 * Returns "Receipt Scanning" translation when the expense is still being scanned.
 */
function formatSearchTotal(total: number, currency: string, isScanning: boolean, translate: LocalizedTranslate): string {
    if (isScanning) {
        return translate('iou.receiptStatusTitle');
    }
    return convertToDisplayString(total, currency);
}

/**
 * Resolves the display text and color styles for a report status badge.
 * Returns null when there is no valid status to show.
 */
function formatReportStatus(theme: ThemeColors, translate: LocalizedTranslate, stateNum?: number, statusNum?: number): FormattedReportStatus {
    const statusText = getReportStatusTranslation({stateNum, statusNum, translate});
    const colorStyle = getReportStatusColorStyle(theme, stateNum, statusNum);

    if (!statusText || !colorStyle) {
        return null;
    }

    return {
        text: statusText,
        backgroundColor: colorStyle.backgroundColor,
        textColor: colorStyle.textColor,
    };
}

/**
 * Resolves the workspace avatar icon and policy name for a report.
 * Returns null when the report is not an expense/invoice report or when icon/name are missing.
 */
function formatWorkspace(report?: Report): FormattedWorkspace {
    if (report?.type !== CONST.REPORT.TYPE.EXPENSE && report?.type !== CONST.REPORT.TYPE.INVOICE) {
        return null;
    }
    const icon = getWorkspaceIcon(report);
    const name = getPolicyName({report});

    if (!icon || !name) {
        return null;
    }

    return {name, icon};
}

/**
 * Resolves which integration export icon names should be shown for a given set of report actions.
 * Returns an array of ExpensifyIconName strings — e.g. ['NetSuiteSquare', 'XeroSquare'].
 * The caller is responsible for loading the actual icon assets via useMemoizedLazyExpensifyIcons.
 */
function resolveExportedIconNames(reportActions: ReportAction[]): ExpensifyIconName[] {
    let isExportedToCsv = false;
    let isExportedToNetsuite = false;
    let isExportedToXero = false;
    let isExportedToIntacct = false;
    let isExportedToQuickbooks = false;
    let isExportedToCertinia = false;
    let isExportedToBillCom = false;
    let isExportedToZenefits = false;

    for (const action of reportActions) {
        if (action.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV) {
            isExportedToCsv = true;
        }

        if (isExportedToIntegrationAction(action)) {
            const message = getOriginalMessage(action);
            const label = message?.label;
            const type = message?.type;
            isExportedToCsv = isExportedToCsv || type === CONST.EXPORT_TEMPLATE;
            isExportedToXero = isExportedToXero || label === CONST.EXPORT_LABELS.XERO;
            isExportedToNetsuite = isExportedToNetsuite || label === CONST.EXPORT_LABELS.NETSUITE;
            isExportedToQuickbooks = isExportedToQuickbooks || label === CONST.EXPORT_LABELS.QBO || label === CONST.EXPORT_LABELS.QBD;
            isExportedToZenefits = isExportedToZenefits || label === CONST.EXPORT_LABELS.ZENEFITS;
            isExportedToBillCom = isExportedToBillCom || label === CONST.EXPORT_LABELS.BILLCOM;
            isExportedToCertinia = isExportedToCertinia || label === CONST.EXPORT_LABELS.CERTINIA;
            isExportedToIntacct = isExportedToIntacct || label === CONST.EXPORT_LABELS.INTACCT || label === CONST.EXPORT_LABELS.SAGE_INTACCT;
        }
    }

    const iconNames: ExpensifyIconName[] = [];
    if (isExportedToCsv) {
        iconNames.push('Table');
    }
    if (isExportedToNetsuite) {
        iconNames.push('NetSuiteSquare');
    }
    if (isExportedToXero) {
        iconNames.push('XeroSquare');
    }
    if (isExportedToIntacct) {
        iconNames.push('IntacctSquare');
    }
    if (isExportedToQuickbooks) {
        iconNames.push('QBOSquare');
    }
    if (isExportedToCertinia) {
        iconNames.push('CertiniaSquare');
    }
    if (isExportedToBillCom) {
        iconNames.push('BillComSquare');
    }
    if (isExportedToZenefits) {
        iconNames.push('ZenefitsSquare');
    }
    return iconNames;
}

export type {FormattedReportStatus, FormattedWorkspace, ExpensifyIconName};
export {formatSearchDate, formatSearchTotal, formatReportStatus, formatWorkspace, resolveExportedIconNames};
