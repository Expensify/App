import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Table from '@components/Table';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {WorkspaceCategoryTableRowData} from '.';

type WorkspaceCategoriesTableRowProps = {
    /** Data about the category */
    item: WorkspaceCategoryTableRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;

    /** Whether the approver column is visible on web screens or not */
    shouldShowApproverColumn: boolean;
};

export default function WorkspaceCategoriesTableRow({rowIndex, shouldUseNarrowTableLayout, shouldShowApproverColumn, item}: WorkspaceCategoriesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            skeletonReasonAttributes={{context: 'categoriesTableRow'}}
            offlineWithFeedback={{errors: item.errors, pendingAction: item.pendingAction, shouldHideOnDelete: false}}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1, styles.flexRow]}>
                        <Text>{item.name}</Text>
                    </View>

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.flexRow]}>
                            <Text>{item.glCode}</Text>
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowApproverColumn && (
                        <View style={[styles.flex1, styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                            {item.approverDisplayName && item.approverAccountID && (
                                <>
                                    <Avatar
                                        name={item.approverDisplayName}
                                        source={item.approverAvatar}
                                        type={CONST.ICON_TYPE_AVATAR}
                                        size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                                    />
                                    <TextWithTooltip text={item.approverDisplayName ?? ''} />
                                </>
                            )}
                        </View>
                    )}

                    <Switch
                        isOn={item.enabled}
                        accessibilityLabel={`${translate('workspace.categories.enableCategory')}: ${item.name}`}
                        onToggle={item.onToggleEnabled}
                    />

                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.alignItemsCenter, !hovered && styles.opacitySemiTransparent]}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </Table.Row>
    );
}
