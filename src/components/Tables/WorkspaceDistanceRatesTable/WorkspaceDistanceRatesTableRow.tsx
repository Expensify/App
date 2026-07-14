import Icon from '@components/Icon';
import StatusBadge from '@components/StatusBadge';
import Switch from '@components/Switch';
import Table from '@components/Table';
import type {TableData} from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getRateStatus} from '@libs/PolicyDistanceRatesUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {Rate} from '@src/types/onyx/Policy';

import {format, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

type DistanceRateTableItemData = TableData & {
    rateID: string;
    rate: Rate;
    formattedRate: string;
    enabled: boolean;
    isLocked: boolean;
    pendingAction?: OnyxCommon.PendingAction;
    errors?: OnyxCommon.Errors;
    action: () => void;
    dismissError: () => void;
    onToggleEnabled: (value: boolean) => void;
};

type WorkspaceDistanceRatesTableRowProps = {
    item: DistanceRateTableItemData;
    rowIndex: number;
    shouldUseNarrowTableLayout: boolean;
    shouldShowDateColumns: boolean;
    statusLabels: Record<string, string>;
};

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
        return '';
    }
    return format(parseISO(dateString), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT);
}

function getRateStatusColors(status: string, theme: ReturnType<typeof useTheme>, isSelected?: boolean) {
    switch (status) {
        case CONST.CUSTOM_UNITS.RATE_STATUS.ACTIVE:
            return theme.reportStatusBadge.paid;
        case CONST.CUSTOM_UNITS.RATE_STATUS.FUTURE:
            return theme.reportStatusBadge.draft;
        case CONST.CUSTOM_UNITS.RATE_STATUS.EXPIRED:
            return theme.reportStatusBadge.outstanding;
        case CONST.CUSTOM_UNITS.RATE_STATUS.INACTIVE:
        default:
            return {
                backgroundColor: isSelected ? theme.buttonHoveredBG : theme.badgeDefaultBG,
                textColor: theme.text,
            };
    }
}

function WorkspaceDistanceRatesTableRow({item, rowIndex, shouldUseNarrowTableLayout, shouldShowDateColumns, statusLabels}: WorkspaceDistanceRatesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const {processedData} = useTableContext<DistanceRateTableItemData>();

    const {rate, formattedRate, pendingAction, errors} = item;
    const isSelected = processedData.at(rowIndex)?.selected ?? false;

    const status = getRateStatus(rate);
    const statusColors = getRateStatusColors(status, theme, isSelected);
    const dateLabelText = DistanceRequestUtils.getRateDateLabel({...rate, unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}, translate);

    const accessibilityLabel = [rate.name, statusLabels[status], formattedRate, dateLabelText].filter(Boolean).join(', ');

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.ROW}
            offlineWithFeedback={{
                errors,
                pendingAction,
                shouldHideOnDelete: false,
                onClose: item.dismissError,
            }}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    {shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                text={rate.name ?? ''}
                                style={[styles.optionDisplayName, styles.pre]}
                            />
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt1, styles.gap2]}>
                                <StatusBadge
                                    text={statusLabels[status] ?? ''}
                                    backgroundColor={statusColors.backgroundColor}
                                    textColor={statusColors.textColor}
                                />
                                <TextWithTooltip
                                    shouldShowTooltip
                                    text={[formattedRate, dateLabelText].filter(Boolean).join(` ${CONST.DOT_SEPARATOR} `)}
                                    numberOfLines={1}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre, styles.flexShrink1]}
                                />
                            </View>
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.justifyContentCenter]}>
                            <StatusBadge
                                text={statusLabels[status] ?? ''}
                                backgroundColor={statusColors.backgroundColor}
                                textColor={statusColors.textColor}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={rate.name ?? ''}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={formattedRate}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowDateColumns && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={formatDate(rate.startDate)}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowDateColumns && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={formatDate(rate.endDate)}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    <View style={[styles.justifyContentCenter, styles.alignItemsEnd]}>
                        <Switch
                            isOn={item.enabled}
                            showLockIcon={item.isLocked}
                            disabled={item.disabled}
                            accessibilityLabel={rate.name ?? ''}
                            onToggle={item.onToggleEnabled}
                        />
                    </View>

                    <Icon
                        src={Expensicons.ArrowRight}
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

export default WorkspaceDistanceRatesTableRow;
export type {DistanceRateTableItemData};
