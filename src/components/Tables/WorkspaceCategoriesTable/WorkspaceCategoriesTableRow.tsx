import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import Table from '@components/Table';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {WorkspaceCategoryTableRowData} from '.';

type WorkspaceCategoriesTableRowProps = {
    item: WorkspaceCategoryTableRowData;

    rowIndex: number;

    shouldShowApproverColumn: boolean;
};

export default function WorkspaceCategoriesTableRow({rowIndex, shouldShowApproverColumn, item}: WorkspaceCategoriesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
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

                    <View style={[styles.flex1, styles.flexRow]}>
                        <Text>{item.glCode}</Text>
                    </View>

                    {shouldShowApproverColumn && (
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

                    <View style={[styles.flex1, styles.flexRow]}></View>

                    <View style={[styles.flex1, styles.flexRow]}>
                        <Icon
                            src={icons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                </>
            )}
        </Table.Row>
    );
}
