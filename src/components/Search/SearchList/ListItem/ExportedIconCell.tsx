import Icon from '@components/Icon';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isStandardExportTemplateLabel} from '@libs/AccountingUtils';
import {getOriginalMessage, isExportedToIntegrationAction} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type ExportedIconCellProps = {
    reportActions?: ReportAction[];
};

function ExportedIconCell({reportActions}: ExportedIconCellProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const actions = reportActions ?? [];
    const icons = useMemoizedLazyExpensifyIcons([
        'NetSuiteSquare',
        'XeroSquare',
        'IntacctSquare',
        'QBOSquare',
        'IntuitSquare',
        'Table',
        'TablePencil',
        'ZenefitsSquare',
        'BillComSquare',
        'CertiniaSquare',
        'RilletSquare',
        'DualEntrySquare',
    ]);

    let isExportedToStandardTemplate = false;
    let isExportedToCustomTemplate = false;
    let isExportedToNetsuite = false;
    let isExportedToXero = false;
    let isExportedToIntacct = false;
    let isExportedToQuickbooksOnline = false;
    let isExportedToQuickbooksDesktop = false;
    let isExportedToIntuitEnterpriseSuite = false;
    let isExportedToCertinia = false;
    let isExportedToRillet = false;
    let isExportedToDualEntry = false;
    let isExportedToBillCom = false;
    let isExportedToZenefits = false;

    for (const action of actions) {
        if (action.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV) {
            isExportedToStandardTemplate = true;
        }

        if (isExportedToIntegrationAction(action)) {
            const message = getOriginalMessage(action);
            const label = message?.label;
            const type = message?.type;
            const isStandardExportTemplate = !!label && isStandardExportTemplateLabel(label);

            if (type === CONST.EXPORT_TEMPLATE && isStandardExportTemplate) {
                isExportedToStandardTemplate = true;
            }

            if (type === CONST.EXPORT_TEMPLATE && !isStandardExportTemplate) {
                isExportedToCustomTemplate = true;
            }
            isExportedToXero = isExportedToXero || label === CONST.EXPORT_LABELS.XERO;
            isExportedToNetsuite = isExportedToNetsuite || label === CONST.EXPORT_LABELS.NETSUITE;
            isExportedToQuickbooksOnline = isExportedToQuickbooksOnline || label === CONST.EXPORT_LABELS.QBO;
            isExportedToQuickbooksDesktop = isExportedToQuickbooksDesktop || label === CONST.EXPORT_LABELS.QBD;
            isExportedToIntuitEnterpriseSuite = isExportedToIntuitEnterpriseSuite || label === CONST.EXPORT_LABELS.INTUIT_ENTERPRISE_SUITE;
            isExportedToZenefits = isExportedToZenefits || label === CONST.EXPORT_LABELS.ZENEFITS;
            isExportedToBillCom = isExportedToBillCom || label === CONST.EXPORT_LABELS.BILLCOM;
            isExportedToCertinia = isExportedToCertinia || label === CONST.EXPORT_LABELS.CERTINIA;
            isExportedToRillet = isExportedToRillet || label === CONST.EXPORT_LABELS.RILLET;
            isExportedToDualEntry = isExportedToDualEntry || label === CONST.EXPORT_LABELS.DUALENTRY;
            isExportedToIntacct = isExportedToIntacct || label === CONST.EXPORT_LABELS.INTACCT || label === CONST.EXPORT_LABELS.SAGE_INTACCT;
        }
    }

    const integrationIconStyle = StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.XXX_SMALL, CONST.AVATAR_SHAPE.CIRCLE);

    return (
        <View style={[styles.flexRow, styles.gap2]}>
            {isExportedToStandardTemplate && (
                <Icon
                    src={icons.Table}
                    fill={theme.icon}
                    size={CONST.ICON_SIZE.SMALL}
                />
            )}
            {isExportedToCustomTemplate && (
                <Icon
                    src={icons.TablePencil}
                    fill={theme.icon}
                    size={CONST.ICON_SIZE.SMALL}
                />
            )}
            {isExportedToNetsuite && (
                <Icon
                    src={icons.NetSuiteSquare}
                    size={CONST.ICON_SIZE.SMALL}
                    additionalStyles={[integrationIconStyle]}
                />
            )}
            {isExportedToXero && (
                <Icon
                    src={icons.XeroSquare}
                    size={CONST.ICON_SIZE.SMALL}
                    additionalStyles={[integrationIconStyle]}
                />
            )}
            {isExportedToIntacct && (
                <Icon
                    src={icons.IntacctSquare}
                    size={CONST.ICON_SIZE.SMALL}
                    additionalStyles={[integrationIconStyle]}
                />
            )}
            {(isExportedToQuickbooksOnline || isExportedToQuickbooksDesktop) && (
                <Icon
                    src={icons.QBOSquare}
                    size={CONST.ICON_SIZE.SMALL}
                    additionalStyles={[integrationIconStyle]}
                />
            )}
            {isExportedToIntuitEnterpriseSuite && (
                <Icon
                    src={icons.IntuitSquare}
                    size={CONST.ICON_SIZE.SMALL}
                    additionalStyles={[integrationIconStyle]}
                />
            )}
            {isExportedToCertinia && (
                <Icon
                    src={icons.CertiniaSquare}
                    size={CONST.ICON_SIZE.SMALL}
                    additionalStyles={[integrationIconStyle]}
                />
            )}
            {isExportedToRillet && (
                <Icon
                    src={icons.RilletSquare}
                    size={CONST.ICON_SIZE.SMALL}
                    additionalStyles={[integrationIconStyle]}
                />
            )}
            {isExportedToDualEntry && (
                <Icon
                    src={icons.DualEntrySquare}
                    size={CONST.ICON_SIZE.SMALL}
                    additionalStyles={[integrationIconStyle]}
                />
            )}
            {isExportedToBillCom && (
                <Icon
                    src={icons.BillComSquare}
                    size={CONST.ICON_SIZE.SMALL}
                    additionalStyles={[integrationIconStyle]}
                />
            )}
            {isExportedToZenefits && (
                <Icon
                    src={icons.ZenefitsSquare}
                    size={CONST.ICON_SIZE.SMALL}
                    additionalStyles={[integrationIconStyle]}
                />
            )}
        </View>
    );
}

export default ExportedIconCell;
