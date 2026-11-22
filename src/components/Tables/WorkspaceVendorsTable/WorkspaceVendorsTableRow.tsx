/**
 * Renders a single row in the workspace vendors table with its name, enable toggle, and push chevron.
 */
import DefaultVendorLockedSwitch from '@components/DefaultVendorLockedSwitch';
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Table from '@components/Table';
import type {TableData} from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import {useTableContext} from '@components/Table/TableContext';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getAccountingExportRoute from '@libs/Navigation/helpers/getAccountingExportRoute';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {ConnectionName, PolicyConnectionName} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type WorkspaceVendorTableRowData = TableData & {
    name: string;
    enabled: boolean;
    isLocked: boolean;

    /** True when the row is the active workspace default vendor and should show the locked tooltip. */
    isDefaultVendorLocked: boolean;
    origin?: PolicyConnectionName;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
    onToggleEnabled: (enabled: boolean) => void;
    dismissError: () => void;
};

type WorkspaceVendorsTableRowProps = {
    item: WorkspaceVendorTableRowData;
    rowIndex: number;
    policyID: string;

    /** Active accounting integration used as fallback when resolving the default vendor's export settings route. */
    connectedIntegration?: ConnectionName;

    /** Reports the rendered tooltip root element on web so the parent screen can register it with a focus trap. */
    onTooltipElementChange?: (element: HTMLElement | null) => void;
};

function WorkspaceVendorsTableRow({item, rowIndex, policyID, connectedIntegration, onTooltipElementChange}: WorkspaceVendorsTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const {shouldUseNarrowTableLayout} = useTableContext();
    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    const accessibilityLabel = [item.name, item.enabled ? translate('common.enabled') : translate('common.disabled')].filter(Boolean).join(', ');

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.VENDORS.ROW}
            onPress={item.action}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.dismissError,
            }}
        >
            {({hovered}) => (
                <>
                    <View
                        style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                    >
                        <TextWithTooltip
                            shouldShowTooltip
                            numberOfLines={1}
                            text={item.name}
                        />
                    </View>
                    <View
                        style={[styles.justifyContentCenter, styles.alignItemsEnd]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                    >
                        {item.isDefaultVendorLocked ? (
                            <DefaultVendorLockedSwitch
                                accessibilityLabel={`${translate('workspace.vendors.enableVendor')}: ${item.name}`}
                                accountingExportRoute={getAccountingExportRoute(policyID, item.origin ?? connectedIntegration)}
                                onToggle={item.onToggleEnabled}
                                switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.VENDORS.ROW_ENABLE_SWITCH}
                                linkSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.VENDORS.ROW_ACCOUNTING_EXPORT_SETTINGS_LINK}
                                onTooltipElementChange={onTooltipElementChange}
                                isNested
                            />
                        ) : (
                            <Switch
                                isOn={item.enabled}
                                showLockIcon={item.isLocked}
                                disabled={item.disabled}
                                accessibilityLabel={`${translate('workspace.vendors.enableVendor')}: ${item.name}`}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.VENDORS.ROW_ENABLE_SWITCH}
                                onToggle={item.onToggleEnabled}
                                isNested
                            />
                        )}
                    </View>
                    <View {...getCellAccessibilityProps(isTableSemanticsEnabled)}>
                        <Icon
                            src={icons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                </>
            )}
        </Table.Row>
    );
}

export default WorkspaceVendorsTableRow;
export type {WorkspaceVendorTableRowData};
