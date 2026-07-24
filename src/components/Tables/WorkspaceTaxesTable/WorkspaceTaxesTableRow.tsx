import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Table from '@components/Table';
import type {TableData} from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import React from 'react';
import {View} from 'react-native';

type WorkspaceTaxTableRowData = TableData & {
    name: string;
    alternateText: string;
    enabled: boolean;
    isLocked: boolean;
    isSwitchDisabled?: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
    onToggleEnabled: (enabled: boolean) => void;
    onDisabledSwitchPress?: () => void;
    onClose: () => void;
};

type WorkspaceTaxesTableRowProps = {
    /** Data about the tax rate */
    item: WorkspaceTaxTableRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;
};

function WorkspaceTaxesTableRow({item, rowIndex, shouldUseNarrowTableLayout}: WorkspaceTaxesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const isDeleting = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const enabledStatusLabel = item.enabled ? translate('common.enabled') : translate('common.disabled');
    const accessibilityLabel = [item.name, item.alternateText, enabledStatusLabel].filter(Boolean).join(', ');

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={isDeleting}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TAXES.ROW}
            onPress={item.action}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.onClose,
            }}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, shouldUseNarrowTableLayout && styles.gap1]}>
                        <View style={[styles.flex1, styles.gap1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={item.name}
                                style={styles.optionDisplayName}
                            />
                            {!!item.alternateText && (
                                <TextWithTooltip
                                    shouldShowTooltip
                                    numberOfLines={1}
                                    text={item.alternateText}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                />
                            )}
                        </View>
                    </View>

                    <View style={[styles.justifyContentCenter, styles.alignItemsEnd]}>
                        <Switch
                            isOn={item.enabled}
                            showLockIcon={item.isLocked}
                            disabled={item.isSwitchDisabled}
                            disabledAction={item.onDisabledSwitchPress}
                            accessibilityLabel={translate('workspace.taxes.actions.enable')}
                            onToggle={item.onToggleEnabled}
                            isNested
                        />
                    </View>

                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || isDeleting) && styles.opacitySemiTransparent]}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </Table.Row>
    );
}

export default WorkspaceTaxesTableRow;
export type {WorkspaceTaxTableRowData};
