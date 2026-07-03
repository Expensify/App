import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Table from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

import type {ReportFieldListValueRowData} from '.';

type WorkspaceReportFieldListValuesTableRowProps = {
    /** The list value item for the row */
    item: ReportFieldListValueRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;
};

export default function WorkspaceReportFieldListValuesTableRow({item, rowIndex}: WorkspaceReportFieldListValuesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const accessibilityLabel = `${item.name}, ${item.enabled ? translate('common.enabled') : translate('common.disabled')}`;

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                        <TextWithTooltip
                            shouldShowTooltip
                            numberOfLines={1}
                            text={item.name}
                        />
                    </View>

                    <View style={[styles.justifyContentCenter, styles.alignItemsEnd]}>
                        <Switch
                            isOn={item.enabled}
                            showLockIcon={item.isLocked}
                            disabled={item.isSwitchDisabled}
                            disabledAction={item.onDisabledSwitchPress}
                            accessibilityLabel={`${translate('workspace.reportFields.enableValue')}: ${item.name}`}
                            onToggle={item.onToggleEnabled}
                        />
                    </View>

                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </Table.Row>
    );
}
