import {format, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import Table from '@components/Table';
import Text from '@components/Text';
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

type DistanceRateTableItemData = {
    rateID: string;
    rate: Rate;
    formattedRate: string;
    pendingAction?: OnyxCommon.PendingAction;
    errors?: OnyxCommon.Errors;
    onDismissError?: () => void;
};

type WorkspaceDistanceRatesTableRowProps = {
    item: DistanceRateTableItemData;
    rowIndex: number;
    isSelected: boolean;
    canSelectMultiple: boolean;
    onToggle: () => void;
    onPress: () => void;
    onLongPress?: () => void;
    shouldUseNarrowTableLayout: boolean;
    statusLabels: Record<string, string>;
};

function formatDateColumn(dateString: string | undefined): string {
    if (!dateString) {
        return '';
    }
    return format(parseISO(dateString), CONST.DATE.MONTH_DAY_YEAR_FORMAT);
}

function WorkspaceDistanceRatesTableRow({
    item,
    rowIndex,
    isSelected,
    canSelectMultiple,
    onToggle,
    onPress,
    onLongPress,
    shouldUseNarrowTableLayout,
    statusLabels,
}: WorkspaceDistanceRatesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const Expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const {rate, formattedRate, pendingAction, errors, onDismissError} = item;
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
            disabled={isDeleting}
            skeletonReasonAttributes={reasonAttributes}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.DISTANCE_RATES.ADD_BUTTON}
            offlineWithFeedback={{errors, pendingAction, onClose: onDismissError, shouldHideOnDelete: false}}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            {({hovered}) => (
                <>
                    {canSelectMultiple && (
                        <View style={[styles.mr3]}>
                            <Checkbox
                                isChecked={isSelected}
                                onPress={onToggle}
                                accessibilityLabel={rate.name ?? ''}
                                disabled={isDeleting}
                            />
                        </View>
                    )}

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
                            <Text
                                numberOfLines={1}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            >
                                {rate.name}
                            </Text>
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            >
                                {formattedRate}
                            </Text>
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            >
                                {formatDateColumn(rate.startDate)}
                            </Text>
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            >
                                {formatDateColumn(rate.endDate)}
                            </Text>
                        </View>
                    )}

                    <Icon
                        src={Expensicons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
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
