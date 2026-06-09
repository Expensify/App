import {format, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Table from '@components/Table';
import type {TableData} from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getRateStatus} from '@libs/PolicyDistanceRatesUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {Rate} from '@src/types/onyx/Policy';

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
    statusLabels: Record<string, string>;
};

function formatDateColumn(dateString: string | null | undefined): string {
    if (!dateString) {
        return '';
    }
    return format(parseISO(dateString), CONST.DATE.MONTH_DAY_YEAR_FORMAT);
}

function WorkspaceDistanceRatesTableRow({item, rowIndex, shouldUseNarrowTableLayout, statusLabels}: WorkspaceDistanceRatesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const {rate, formattedRate, pendingAction, errors} = item;
    const isDeleting = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    const status = getRateStatus(rate);

    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'WorkspaceDistanceRatesTableItem',
        isDeleting,
    };

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            skeletonReasonAttributes={reasonAttributes}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.ADD_BUTTON}
            offlineWithFeedback={{errors, pendingAction, dismissError: item.dismissError, shouldHideOnDelete: false}}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1]}>
                        <TextWithTooltip
                            text={statusLabels[status] ?? ''}
                            style={[styles.optionDisplayName, styles.pre]}
                        />
                        {shouldUseNarrowTableLayout && (
                            <TextWithTooltip
                                text={`${rate.name ?? ''} · ${formattedRate}`}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        )}
                    </View>

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                numberOfLines={1}
                                text={rate.name ?? ''}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                numberOfLines={1}
                                text={formattedRate}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                numberOfLines={1}
                                text={formatDateColumn(rate.startDate)}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <TextWithTooltip
                                numberOfLines={1}
                                text={formatDateColumn(rate.endDate)}
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
