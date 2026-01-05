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
import type {ReportAction} from '@src/types/onyx';

type ExportedIconCellProps = {
    reportID?: string;
    hash?: number;
};

function ExportedIconCell({reportID, hash}: ExportedIconCellProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    // We need to subscribe directly to the snapshot to get the report actions because this can be rendered in either a group
    // list (which has a separate hash than the current top-level search query) or in the top-level search query.
    // This selector is specific to this edge-case (and thus is not in the selectors folder) and should be used in other places where the snapshot needs to be accessed
    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const reportActions = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {
        canBeMissing: true,
        selector: (snapshot) => {
            return Object.entries(snapshot?.data ?? {})
                .filter(([key]) => key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`)
                .map(([, value]) => Object.values(value ?? {}) as ReportAction[])
                .flat();
        },
    });

    const actions = Object.values(reportActions[0] ?? {});
    const icons = useMemoizedLazyExpensifyIcons(['NetSuiteSquare', 'XeroSquare', 'IntacctSquare', 'QBOSquare', 'Table', 'ZenefitsSquare', 'BillComSquare', 'CertiniaSquare']);

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
            const message = getOriginalMessage(action);
            const label = message?.label;
            const type = message?.type;
            isExportedToCsv = isExportedToCsv || type === CONST.EXPORT_TEMPLATE;
            isExportedToXero = isExportedToXero || label === CONST.EXPORT_LABELS.XERO;
            isExportedToNetsuite = isExportedToNetsuite || label === CONST.EXPORT_LABELS.NETSUITE;
            isExportedToQuickbooksOnline = isExportedToQuickbooksOnline || label === CONST.EXPORT_LABELS.QBO;
            isExportedToQuickbooksDesktop = isExportedToQuickbooksDesktop || label === CONST.EXPORT_LABELS.QBD;
            isExportedToZenefits = isExportedToZenefits || label === CONST.EXPORT_LABELS.ZENEFITS;
            isExportedToBillCom = isExportedToBillCom || label === CONST.EXPORT_LABELS.BILLCOM;
            isExportedToCertinia = isExportedToCertinia || label === CONST.EXPORT_LABELS.CERTINIA;
            isExportedToIntacct = isExportedToIntacct || label === CONST.EXPORT_LABELS.INTACCT || label === CONST.EXPORT_LABELS.SAGE_INTACCT;
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
