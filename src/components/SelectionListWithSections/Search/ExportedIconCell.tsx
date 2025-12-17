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
    const icons = useMemoizedLazyExpensifyIcons(['Document', 'NetSuiteSquare', 'XeroSquare', 'IntacctSquare', 'QBOSquare']);

    const actions = Object.values(reportActions[0] ?? {});
    const actionNames = actions.map((action) => action.actionName);

    const isExportedToCsv = actionNames.includes(CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV);
    const isExportedToXero = actions.some((action) => isExportedToIntegrationAction(action) && getOriginalMessage(action)?.label === CONST.EXPORT_LABELS.XERO);
    const isExportedToIntacct = actions.some((action) => isExportedToIntegrationAction(action) && getOriginalMessage(action)?.label === CONST.EXPORT_LABELS.INTACCT);
    const isExportedToNetsuite = actions.some((action) => isExportedToIntegrationAction(action) && getOriginalMessage(action)?.label === CONST.EXPORT_LABELS.NETSUITE);
    const isExportedToQuickbooksOnline = actions.some((action) => isExportedToIntegrationAction(action) && getOriginalMessage(action)?.label === CONST.EXPORT_LABELS.QBO);
    const isExportedToQuickbooksDesktop = actions.some((action) => isExportedToIntegrationAction(action) && getOriginalMessage(action)?.label === CONST.EXPORT_LABELS.QBD);

    if (!reportID) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.gap2]}>
            {isExportedToCsv && (
                <Icon
                    src={icons.Document}
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
        </View>
    );
}

export default ExportedIconCell;
