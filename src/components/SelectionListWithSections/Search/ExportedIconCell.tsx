import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getOriginalMessage, isExportedToIntegrationAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ExportedIconCellProps = {
    reportID?: string;
};

function ExportedIconCell({reportID}: ExportedIconCellProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const reportActions = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canBeMissing: true});
    const icons = useMemoizedLazyExpensifyIcons(['NetSuiteSquare', 'XeroSquare', 'IntacctSquare', 'QBOSquare', 'Table', 'ZenefitsSquare', 'BillComSquare', 'CertiniaSquare']);

    const actions = Object.values(reportActions[0] ?? {});

    let isExportedToCsv = false;
    let isExportedToNetsuite = false;
    let isExportedToXero = false;
    let isExportedToIntacct = false;
    let isExportedToQuickbooksOnline = false;
    let isExportedToQuickbooksDesktop = false;
    let isExportedToCertinia = false;
    let isExportedToBillCom = false;
    let isExportedToZenefits = false;

    for (const action of actions) {
        if (action.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV) {
            isExportedToCsv = true;
        }

        if (isExportedToIntegrationAction(action)) {
            const label = getOriginalMessage(action)?.label;
            isExportedToXero = isExportedToXero || label === CONST.EXPORT_LABELS.XERO;
            isExportedToIntacct = isExportedToIntacct || label === CONST.EXPORT_LABELS.INTACCT;
            isExportedToNetsuite = isExportedToNetsuite || label === CONST.EXPORT_LABELS.NETSUITE;
            isExportedToQuickbooksOnline = isExportedToQuickbooksOnline || label === CONST.EXPORT_LABELS.QBO;
            isExportedToQuickbooksDesktop = isExportedToQuickbooksDesktop || label === CONST.EXPORT_LABELS.QBD;
            isExportedToZenefits = isExportedToZenefits || label === CONST.EXPORT_LABELS.ZENEFITS;
            isExportedToBillCom = isExportedToBillCom || label === CONST.EXPORT_LABELS.BILLCOM;
            isExportedToCertinia = isExportedToCertinia || label === CONST.EXPORT_LABELS.FINANCIALFORCE;
        }
    }

    return (
        <View style={[styles.flexRow, styles.gap2]}>
            {isExportedToCsv && (
                <Icon
                    src={icons.Table}
                    fill={theme.icon}
                    small
                />
            )}
            {isExportedToNetsuite && (
                <Avatar
                    source={icons.NetSuiteSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {isExportedToXero && (
                <Avatar
                    source={icons.XeroSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {isExportedToIntacct && (
                <Avatar
                    source={icons.IntacctSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {(isExportedToQuickbooksOnline || isExportedToQuickbooksDesktop) && (
                <Avatar
                    source={icons.QBOSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {isExportedToCertinia && (
                <Avatar
                    source={icons.CertiniaSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {isExportedToBillCom && (
                <Avatar
                    source={icons.BillComSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
            {isExportedToZenefits && (
                <Avatar
                    source={icons.ZenefitsSquare}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                />
            )}
        </View>
    );
}

export default ExportedIconCell;
