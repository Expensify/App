import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import type {TableData} from '@components/Table';
import Table from '@components/Table';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type DomainGroupRowData = TableData & {
    groupID: string;
    name: string;
    memberCount: number;
    isDefault: boolean;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    action: () => void;
    dismissError: () => void;
};

type DomainGroupsTableRowProps = {
    /** Data about the domain group */
    item: DomainGroupRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;
};

export default function DomainGroupsTableRow({item, rowIndex, shouldUseNarrowTableLayout}: DomainGroupsTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'DotIndicator']);

    const memberCountSubtitle = translate('domain.groups.memberCount', {count: item.memberCount});
    const accessibilityLabel = [item.name, memberCountSubtitle, item.isDefault ? translate('common.default') : null].filter(Boolean).join(', ');

    const brickRoadIndicator = !!item.brickRoadIndicator && (
        <Icon
            src={icons.DotIndicator}
            fill={item.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR ? theme.danger : theme.iconSuccessFill}
        />
    );

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            skeletonReasonAttributes={{context: 'domainGroupsTableRow'}}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.dismissError,
            }}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    {shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                            <View style={[styles.flex1, styles.gap1]}>
                                <TextWithTooltip
                                    shouldShowTooltip
                                    text={item.name}
                                    style={styles.optionDisplayName}
                                />
                                <Text
                                    numberOfLines={1}
                                    style={styles.textLabelSupporting}
                                >
                                    {memberCountSubtitle}
                                </Text>
                            </View>
                            {item.isDefault && (
                                <Badge
                                    text={translate('common.default')}
                                    badgeStyles={styles.ml0}
                                    isCondensed
                                />
                            )}
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                {brickRoadIndicator}
                                <Icon
                                    src={icons.ArrowRight}
                                    fill={theme.icon}
                                    additionalStyles={[styles.alignSelfCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                />
                            </View>
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <>
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                <TextWithTooltip
                                    shouldShowTooltip
                                    text={item.name}
                                    style={[styles.optionDisplayName, styles.flexShrink1]}
                                />
                            </View>

                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap3]}>
                                <Text numberOfLines={1}>{memberCountSubtitle}</Text>
                                {item.isDefault && (
                                    <Badge
                                        text={translate('common.default')}
                                        badgeStyles={styles.ml0}
                                    />
                                )}
                            </View>

                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap2]}>
                                {brickRoadIndicator}
                                <Icon
                                    src={icons.ArrowRight}
                                    fill={theme.icon}
                                    additionalStyles={[styles.alignSelfCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                />
                            </View>
                        </>
                    )}
                </>
            )}
        </Table.Row>
    );
}

export type {DomainGroupRowData};
